import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, Clock, CheckCircle, XCircle, 
  History as HistoryIcon, Smartphone, LogOut 
} from 'lucide-react';

export default function History() {
  const user = JSON.parse(localStorage.getItem('geoClassUser') || '{}');
  const navigate = useNavigate();
  
  const [historico, setHistorico] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:3000/aluno/${user.id}/historico`)
      .then(res => res.json())
      .then(data => {
        setHistorico(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user.id]);

  const handleLogout = () => {
    localStorage.removeItem('geoClassUser');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-base-200 pb-10">
      
      {/* --- NAVBAR DO ALUNO (Padrão) --- */}
      <div className="navbar bg-gradient-to-r from-primary to-[#0077b6] text-primary-content shadow-lg px-4 sm:px-8">
        <div className="flex-1 flex items-center gap-3">
          <img src="/logo.png" className="h-10 w-auto" alt="GeoClass" />
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            GeoClass <span className="badge badge-ghost text-primary-content font-bold bg-white/20 border-none">Aluno</span>
          </h1>
        </div>
        <div className="flex-none gap-4">
            <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle avatar hover:ring-2 hover:ring-white transition-all">
                <div className="w-11 rounded-full ring ring-white ring-opacity-50 ring-offset-base-100 ring-offset-2">
                <div className="bg-primary-focus text-white w-full h-full flex items-center justify-center font-bold text-lg">
                    {user.nome?.charAt(0)}
                </div>
                </div>
            </label>
            <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow-xl menu menu-sm dropdown-content bg-base-100 rounded-box w-52 text-base-content">
                <li><a onClick={() => navigate('/perfil')}>Meu Perfil</a></li>
                <li><a onClick={() => navigate('/configuracoes')}>Configurações</a></li>
                <div className="divider my-0"></div>
                <li><button onClick={handleLogout} className="text-error font-bold">Sair da Conta</button></li>
            </ul>
            </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8">
        
        {/* Cabeçalho da Página */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate(-1)} className="btn btn-circle btn-ghost bg-white shadow-sm hover:bg-gray-100">
            <ArrowLeft className="text-gray-600" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-700 flex items-center gap-2">
              <HistoryIcon className="text-primary" /> Histórico de Presenças
            </h2>
            <p className="text-sm text-gray-500">Comprovante de todos os seus registros.</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20"><span className="loading loading-spinner loading-lg text-primary"></span></div>
        ) : (
          <div className="card bg-base-100 shadow-xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                {/* Cabeçalho da Tabela */}
                <thead className="bg-base-200 text-gray-600">
                  <tr>
                    <th>Data</th>
                    <th>Disciplina</th>
                    <th>Horário</th>
                    <th>Método</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {historico.map((log) => (
                    <tr key={log.id} className="hover">
                      {/* Data */}
                      <td>
                        <div className="flex items-center gap-2 font-medium">
                          <Calendar size={16} className="text-gray-400" />
                          {new Date(log.data).toLocaleDateString()}
                        </div>
                      </td>
                      
                      {/* Disciplina */}
                      <td>
                        <div className="font-bold text-primary">{log.disciplina}</div>
                      </td>

                      {/* Horário */}
                      <td>
                        <div className="flex items-center gap-2 font-mono text-xs">
                          <Clock size={14} className="text-gray-400" />
                          {new Date(log.data).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </td>

                      {/* Método (Segurança) */}
                      <td>
                        {log.deviceId ? (
                          <div className="badge badge-ghost badge-sm gap-1 text-gray-500">
                            <Smartphone size={10} /> App Seguro
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>

                      {/* Status */}
                      <td>
                        {log.status === 'SINCRONIZADO' ? (
                            <span className="badge badge-success gap-1 text-white font-bold">
                                <CheckCircle size={12} /> Confirmado
                            </span>
                        ) : (
                            <span className="badge badge-warning gap-1">
                                <Clock size={12} /> Aguardando SIGA
                            </span>
                        )}
                      </td>
                    </tr>
                  ))}

                  {historico.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-gray-400">
                        Nenhum registro encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}