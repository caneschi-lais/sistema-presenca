import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // <--- FALTAVA ISSO
import { MapPin, AlertTriangle, BookOpen, LogOut } from 'lucide-react';

export default function StudentHome() {
  const user = JSON.parse(localStorage.getItem('geoClassUser') || '{}');
  const navigate = useNavigate(); // <--- FALTAVA ISSO
  
  const [materias, setMaterias] = useState<any[]>([]);
  const [statusRegistro, setStatusRegistro] = useState('idle');
  const [msgRegistro, setMsgRegistro] = useState('');

  useEffect(() => {
    if (!user.id) return;
    fetch(`http://localhost:3000/aluno/${user.id}/dashboard`)
      .then(res => res.json())
      .then(data => setMaterias(data))
      .catch(err => console.error("Erro ao carregar dashboard", err));
  }, [user.id]);

  const handleLogout = () => {
    localStorage.removeItem('geoClassUser');
    navigate('/'); 
  };

  const registrarPresenca = (turmaId: string) => {
    setStatusRegistro('loading');
    setMsgRegistro('Verificando GPS...');

    if (!navigator.geolocation) {
      setMsgRegistro('GPS não suportado.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const response = await fetch('http://localhost:3000/registrar-presenca', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              alunoId: user.id,
              turmaId: turmaId,
              lat: pos.coords.latitude,
              long: pos.coords.longitude
            })
          });
          
          const data = await response.json();
          if (response.ok) {
            setStatusRegistro('success');
            setMsgRegistro('Presença Confirmada! 🎉');
            setTimeout(() => window.location.reload(), 1500);
          } else {
            setStatusRegistro('error');
            setMsgRegistro(data.error || 'Erro ao registrar.');
          }
        } catch (e) {
          setStatusRegistro('error');
          setMsgRegistro('Erro de conexão.');
        }
      },
      () => {
        setStatusRegistro('error');
        setMsgRegistro('Permita o acesso ao GPS.');
      }
    );
  };

  return (
    <div className="min-h-screen bg-base-200 pb-10">
      <div className="navbar bg-base-100 shadow-md px-6">
        <div className="flex-1">
          <img src="/logo.png" className="h-10 mr-2" />
        </div>
        <div className="flex-none gap-2">
          <div className="text-right mr-2 hidden sm:block">
            <p className="font-bold text-sm">{user.nome}</p>
            <p className="text-xs text-gray-500">RA: {user.ra}</p>
          </div>
          <div className="avatar placeholder">
            <div className="bg-neutral text-neutral-content rounded-full w-10">
              <span>{user.nome?.charAt(0)}</span>
            </div>
          </div>
          
          {/* Botão Sair */}
          <button 
            onClick={handleLogout} 
            className="btn btn-ghost btn-circle text-error ml-2 tooltip tooltip-bottom" 
            data-tip="Sair"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <BookOpen /> Minhas Matérias
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materias.map((materia) => (
            <div key={materia.turmaId} className="card bg-base-100 shadow-xl border border-gray-100">
              <div className="card-body">
                <h3 className="card-title text-primary">{materia.nome}</h3>
                <div className="divider my-1"></div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Presenças: <strong>{materia.presencas}</strong></span>
                  <span>Faltas: <strong>{materia.faltas}</strong></span>
                </div>
                <div className="w-full">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-bold">Frequência</span>
                    <span className={`text-xs font-bold ${materia.frequencia < 75 ? 'text-error' : 'text-success'}`}>
                      {materia.frequencia}%
                    </span>
                  </div>
                  <progress 
                    className={`progress w-full h-3 ${materia.frequencia < 75 ? 'progress-error' : 'progress-success'}`} 
                    value={materia.frequencia} 
                    max="100">
                  </progress>
                </div>
                {materia.frequencia < 75 && (
                  <div className="alert alert-error mt-4 py-2 text-sm flex items-start">
                    <AlertTriangle className="w-5 h-5" />
                    <span>Atenção! Risco de reprovação.</span>
                  </div>
                )}
                <div className="card-actions justify-end mt-4">
                  {statusRegistro === 'loading' ? (
                    <button className="btn btn-disabled w-full">📡 {msgRegistro}</button>
                  ) : (
                    <button 
                      className="btn btn-primary w-full gap-2"
                      onClick={() => registrarPresenca(materia.turmaId)}
                    >
                      <MapPin size={18} /> Registrar Presença Agora
                    </button>
                  )}
                </div>
                {statusRegistro === 'success' && <p className="text-success text-center text-sm font-bold mt-2">{msgRegistro}</p>}
                {statusRegistro === 'error' && <p className="text-error text-center text-sm font-bold mt-2">{msgRegistro}</p>}
              </div>
            </div>
          ))}
        </div>
        {materias.length === 0 && (
          <div className="text-center mt-10 text-gray-500">Você não está matriculado em nenhuma turma ainda.</div>
        )}
      </div>
    </div>
  );
}