import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Tipagem simples para as turmas que vêm do backend
interface TurmaDashboard {
  turmaId: string;
  nome: string;
  presencas: number;
  faltas: number;
  totalAulas: number;
  frequencia: number;
  status: string;
}

export default function StudentHome() {
  const navigate = useNavigate();
  const [turmas, setTurmas] = useState<TurmaDashboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [mensagem, setMensagem] = useState<{ texto: string; tipo: 'success' | 'error' | 'info' } | null>(null);

  // Pega os dados do usuário logado
  const userString = localStorage.getItem('geoClassUser');
  const user = userString ? JSON.parse(userString) : null;

  // Função para gerar ou recuperar um ID único do dispositivo (para evitar fraudes)
  const getDeviceId = () => {
    let deviceId = localStorage.getItem('geoClassDeviceId');
    if (!deviceId) {
      deviceId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
      localStorage.setItem('geoClassDeviceId', deviceId);
    }
    return deviceId;
  };

  useEffect(() => {
    if (!user || user.perfil !== 'ALUNO') {
      navigate('/');
      return;
    }
    carregarDashboard();
  }, []);

  const carregarDashboard = async () => {
    try {
      const response = await fetch(`http://localhost:3000/aluno/${user.id}/dashboard`);
      const data = await response.json();
      setTurmas(data);
    } catch (error) {
      console.error("Erro ao buscar turmas:", error);
      setMensagem({ texto: 'Erro ao carregar suas disciplinas.', tipo: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleMarcarPresenca = (turmaId: string) => {
    setMensagem({ texto: 'Buscando sua localização via GPS...', tipo: 'info' });

    // Verifica se o navegador suporta geolocalização
    if (!navigator.geolocation) {
      setMensagem({ texto: 'Seu navegador não suporta geolocalização.', tipo: 'error' });
      return;
    }

    // Pede a localização
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const long = position.coords.longitude;

        try {
          const response = await fetch('http://localhost:3000/registrar-presenca', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              alunoId: user.id,
              turmaId: turmaId,
              lat: lat,
              long: long,
              deviceId: getDeviceId()
            })
          });

          const data = await response.json();

          if (response.ok) {
            setMensagem({ texto: '✅ Presença garantida com sucesso!', tipo: 'success' });
            carregarDashboard(); // Atualiza os números de faltas e presenças
          } else {
            setMensagem({ texto: `❌ ${data.error}`, tipo: 'error' });
          }
        } catch (error) {
          setMensagem({ texto: 'Erro de conexão com o servidor.', tipo: 'error' });
        }
      },
      (error) => {
        console.error(error);
        setMensagem({ texto: 'Você precisa permitir o acesso à localização para marcar presença.', tipo: 'error' });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const sair = () => {
    localStorage.clear();
    navigate('/');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><span className="loading loading-spinner loading-lg text-primary"></span></div>;

  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-8">
      {/* Cabeçalho */}
      <div className="max-w-4xl mx-auto flex justify-between items-center bg-base-100 p-4 rounded-xl shadow-sm mb-6">
        <div>
          <h1 className="text-2xl font-bold text-base-content">Olá, {user?.nome.split(' ')[0]}!</h1>
          <p className="text-sm text-gray-500">RA: {user?.ra}</p>
        </div>
        <button onClick={sair} className="btn btn-outline btn-error btn-sm">Sair</button>
      </div>

      {/* Alertas de Feedback Visual */}
      {mensagem && (
        <div className={`max-w-4xl mx-auto alert mb-6 ${
          mensagem.tipo === 'success' ? 'alert-success' : 
          mensagem.tipo === 'error' ? 'alert-error' : 'alert-info'
        }`}>
          <span className="font-medium text-white">{mensagem.texto}</span>
        </div>
      )}

      {/* Lista de Turmas */}
      <div className="max-w-4xl mx-auto grid gap-6 md:grid-cols-2">
        {turmas.length === 0 ? (
          <p className="text-center text-gray-500 col-span-2">Você não está matriculado em nenhuma turma.</p>
        ) : (
          turmas.map(turma => (
            <div key={turma.turmaId} className="card bg-base-100 shadow-md">
              <div className="card-body">
                <h2 className="card-title text-primary">{turma.nome}</h2>
                
                <div className="flex justify-between mt-2 text-sm">
                  <div>
                    <p className="text-gray-500">Presenças</p>
                    <p className="font-bold text-lg text-success">{turma.presencas}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Faltas</p>
                    <p className="font-bold text-lg text-error">{turma.faltas}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Frequência</p>
                    <p className={`font-bold text-lg ${turma.frequencia >= 75 ? 'text-success' : 'text-warning'}`}>
                      {turma.frequencia}%
                    </p>
                  </div>
                </div>

                <div className="card-actions justify-end mt-4">
                  <button 
                    onClick={() => handleMarcarPresenca(turma.turmaId)} 
                    className="btn btn-primary w-full"
                  >
                    📍 Marcar Presença
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}