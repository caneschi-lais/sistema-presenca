import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // <--- FALTAVA ISSO
import { Users, Calendar, MapPin, RefreshCw, X, LogOut } from 'lucide-react';

export default function TeacherHome() {
  const user = JSON.parse(localStorage.getItem('geoClassUser') || '{}');
  const navigate = useNavigate(); // <--- FALTAVA ISSO

  const [turmas, setTurmas] = useState<any[]>([]);
  const [selectedTurma, setSelectedTurma] = useState<any>(null);
  const [presencas, setPresencas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user.id) return;
    fetch(`http://localhost:3000/professor/${user.id}/turmas`)
      .then(res => res.json())
      .then(data => setTurmas(data));
  }, [user.id]);

  // <--- A FUNÇÃO INTEIRA FALTAVA
  const handleLogout = () => {
    localStorage.removeItem('geoClassUser');
    navigate('/');
  };

  const verChamada = async (turma: any) => {
    setSelectedTurma(turma);
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/turma/${turma.id}/presencas`);
      const data = await res.json();
      setPresencas(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200">
      <div className="navbar bg-base-100 shadow-md px-6 border-b border-primary/10">
        <div className="flex-1">
          <img src="/logo.png" className="h-10 mr-2" />
          <span className="font-bold text-xl text-primary">GeoClass Docente</span>
        </div>
        <div className="flex-none gap-3">
          <div className="text-right hidden sm:block">
            <p className="font-bold text-sm">{user.nome}</p>
            <p className="text-xs text-gray-500">Professor</p>
          </div>
          <div className="avatar placeholder">
            <div className="bg-primary text-primary-content rounded-full w-10">
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
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-700">
          <Calendar /> Turmas sob sua responsabilidade
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {turmas.map((turma) => (
            <div key={turma.id} className="card bg-base-100 shadow-xl border-l-4 border-primary cursor-pointer hover:shadow-2xl transition-all" onClick={() => verChamada(turma)}>
              <div className="card-body">
                <h3 className="card-title text-xl">{turma.nome}</h3>
                <div className="text-sm text-gray-500 flex flex-col gap-1 mt-2">
                  <span className="flex items-center gap-1"><Users size={16}/> {turma._count?.alunos || 0} Alunos matriculados</span>
                  <span className="flex items-center gap-1"><MapPin size={16}/> Raio: {turma.raioMetros}m</span>
                </div>
                <div className="card-actions justify-end mt-4">
                  <button className="btn btn-outline btn-primary btn-sm">Ver Chamada em Tempo Real</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {turmas.length === 0 && (
          <div className="text-center mt-20 opacity-50">
            Nenhuma turma vinculada ao seu perfil.
          </div>
        )}
      </div>

      {selectedTurma && (
        <div className="modal modal-open bg-black/50 backdrop-blur-sm">
          <div className="modal-box w-11/12 max-w-3xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Chamada: {selectedTurma.nome}</h3>
              <button className="btn btn-ghost btn-circle btn-sm" onClick={() => setSelectedTurma(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="flex justify-between items-center bg-base-200 p-3 rounded-lg mb-4">
              <span className="text-sm font-bold">Data: {new Date().toLocaleDateString()}</span>
              <button className="btn btn-ghost btn-xs gap-1" onClick={() => verChamada(selectedTurma)}>
                <RefreshCw size={12} /> Atualizar Lista
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center p-10"><span className="loading loading-spinner loading-lg"></span></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>Hora</th>
                      <th>RA</th>
                      <th>Aluno</th>
                      <th>Status Integração</th>
                    </tr>
                  </thead>
                  <tbody>
                    {presencas.map((p) => (
                      <tr key={p.logId}>
                        <td className="font-mono text-xs">{new Date(p.horario).toLocaleTimeString()}</td>
                        <td>{p.ra}</td>
                        <td className="font-bold">{p.aluno}</td>
                        <td>
                          {p.status === 'PENDENTE' && <span className="badge badge-warning badge-sm">Aguardando SIGA</span>}
                          {p.status === 'SINCRONIZADO' && <span className="badge badge-success badge-sm">Sincronizado</span>}
                          {p.status === 'ERRO' && <span className="badge badge-error badge-sm">Erro</span>}
                        </td>
                      </tr>
                    ))}
                    {presencas.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center py-8 text-gray-400">
                          Nenhum registro de presença hoje.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            
            <div className="modal-action">
              <button className="btn btn-primary" disabled={presencas.length === 0}>
                Enviar para o SIGA Agora
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}