import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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

  const userString = localStorage.getItem('geoClassUser');
  const user = userString ? JSON.parse(userString) : null;

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

    if (!navigator.geolocation) {
      setMensagem({ texto: 'Seu navegador não suporta geolocalização.', tipo: 'error' });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const response = await fetch('http://localhost:3000/registrar-presenca', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              alunoId: user.id,
              turmaId: turmaId,
              lat: position.coords.latitude,
              long: position.coords.longitude,
              deviceId: getDeviceId()
            })
          });

          const data = await response.json();

          if (response.ok) {
            setMensagem({ texto: '✅ Presença garantida com sucesso!', tipo: 'success' });
            carregarDashboard(); 
          } else {
            setMensagem({ texto: `❌ ${data.error}`, tipo: 'error' });
          }
        } catch (error) {
          setMensagem({ texto: 'Erro de conexão com o servidor.', tipo: 'error' });
        }
      },
      (error) => {
        console.error(error);
        setMensagem({ texto: 'Permita o acesso à localização para marcar presença.', tipo: 'error' });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><span className="loading loading-spinner loading-lg text-primary"></span></div>;

  return (
    <div className="container mx-auto px-4 mt-8">
      {mensagem && (
        <div className={`max-w-4xl mx-auto alert mb-6 shadow-sm ${
          mensagem.tipo === 'success' ? 'alert-success' : 
          mensagem.tipo === 'error' ? 'alert-error' : 'alert-info'
        }`}>
          <span className="font-medium text-white">{mensagem.texto}</span>
        </div>
      )}

      <div className="max-w-4xl mx-auto grid gap-6 md:grid-cols-2">
        {turmas.length === 0 ? (
          <p className="text-center text-gray-500 col-span-2 py-10">Você não está matriculado em nenhuma turma.</p>
        ) : (
          turmas.map(turma => (
            <div key={turma.turmaId} className="card bg-base-100 shadow-md border border-gray-100">
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
                    className="btn btn-primary w-full shadow-md"
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