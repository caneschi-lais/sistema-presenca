import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Calendar, MapPin, RefreshCw, X, LogOut, 
  Clock, CheckCircle, Search, MoreVertical 
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function TeacherHome() {
  const user = JSON.parse(localStorage.getItem('geoClassUser') || '{}');
  const navigate = useNavigate();

  const [turmas, setTurmas] = useState<any[]>([]);
  const [selectedTurma, setSelectedTurma] = useState<any>(null);
  const [presencas, setPresencas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingChamada, setLoadingChamada] = useState(false);

  // Helper para traduzir o dia da semana (0-6)
  const diasSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

  useEffect(() => {
    carregarTurmas();
  }, [user.id]);

  const carregarTurmas = () => {
    setLoading(true);
    fetch(`http://localhost:3000/professor/${user.id}/turmas`)
      .then(res => res.json())
      .then(data => {
        setTurmas(data);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Erro ao carregar turmas.");
        setLoading(false);
      });
  };

  const handleLogout = () => {
    localStorage.removeItem('geoClassUser');
    navigate('/');
  };

  const verChamada = async (turma: any) => {
    setSelectedTurma(turma);
    setLoadingChamada(true);
    try {
      const res = await fetch(`http://localhost:3000/turma/${turma.id}/presencas`);
      const data = await res.json();
      setPresencas(data);
      
      if (data.length > 0) {
        toast.info(`${data.length} presenças registradas hoje.`);
      }
    } catch (error) {
      toast.error("Erro ao buscar lista.");
    } finally {
      setLoadingChamada(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 pb-10">
      {/* --- NAVBAR MODERNA (PROFESSOR) --- */}
      <div className="navbar bg-gradient-to-r from-primary to-[#0077b6] text-primary-content shadow-lg px-4 sm:px-8">
        <div className="flex-1 flex items-center gap-3">
          <img src="/logo.png" className="h-10 w-auto brightness-200 contrast-200" alt="GeoClass Logo" />
          <div>
            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
              GeoClass
              <span className="badge badge-accent text-white font-bold border-none bg-accent/90">Docente</span>
            </h1>
          </div>
        </div>

        <div className="flex-none gap-4">
          <div className="hidden sm:block text-right leading-tight">
          </div>

          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle avatar hover:ring-2 hover:ring-accent transition-all">
              <div className="w-11 rounded-full ring ring-accent ring-offset-base-100 ring-offset-2">
                <div className="bg-primary-focus text-white w-full h-full flex items-center justify-center font-bold text-lg">
                  {user.nome?.charAt(0)}
                </div>
              </div>
            </label>
            <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow-xl menu menu-sm dropdown-content bg-base-100 rounded-box w-52 text-base-content">
              <li className="menu-title sm:hidden"><span>{user.nome}</span></li>
              
              {/* Links Funcionais */}
              <li><a onClick={() => navigate('/perfil')} className="justify-between">Meu Perfil</a></li>
              <li><a onClick={() => navigate('/configuracoes')}>Configurações</a></li>
              
              <div className="divider my-0"></div>
              <li><button onClick={handleLogout} className="text-error font-bold hover:bg-error/10">Sair da Conta</button></li>
            </ul>
          </div>
        </div>
      </div>

      {/* --- CONTEÚDO DA PÁGINA --- */}
      <div className="container mx-auto px-4 mt-8">
        
        {/* Cabeçalho da Seção */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-700 flex items-center gap-2">
              <Calendar className="text-primary" /> Minhas Turmas
            </h2>
            <p className="text-sm text-gray-500">Gerencie suas aulas e acompanhe a frequência em tempo real.</p>
          </div>
          
          {/* Botão de Filtro (Visual) */}
          <div className="join">
            <input className="join-item btn btn-sm btn-active" type="radio" name="options" aria-label="Hoje" />
            <input className="join-item btn btn-sm" type="radio" name="options" aria-label="Todas" />
          </div>
        </div>

        {/* Loading State */}
        {loading && <div className="text-center py-20"><span className="loading loading-spinner loading-lg text-primary"></span></div>}

        {/* Grid de Turmas */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {turmas.map((turma) => (
              <div key={turma.id} className="card bg-base-100 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 group">
                <div className="card-body p-6">
                  
                  {/* Topo do Card */}
                  <div className="flex justify-between items-start">
                    <div className="badge badge-primary badge-outline text-xs font-bold gap-1">
                       {turma.diaSemana !== undefined ? diasSemana[turma.diaSemana] : 'Dia a definir'}
                    </div>
                    <button className="btn btn-ghost btn-xs btn-circle opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical size={16} />
                    </button>
                  </div>

                  {/* Título */}
                  <h3 className="card-title text-xl text-primary mt-2">{turma.nome}</h3>
                  
                  <div className="divider my-2"></div>

                  {/* Detalhes */}
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-accent" />
                      <span className="font-medium">Início: {turma.horarioInicio || '--:--'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-secondary" />
                      <span>{turma._count?.alunos || 0} Alunos matriculados</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-gray-400" />
                      <span className="text-xs">Geofence: {turma.raioMetros}m</span>
                    </div>
                  </div>

                  {/* Botão de Ação */}
                  <div className="card-actions justify-end mt-6">
                    <button 
                      className="btn btn-primary w-full gap-2 shadow-md group-hover:scale-[1.02] transition-transform"
                      onClick={() => verChamada(turma)}
                    >
                      <CheckCircle size={18} /> Ver Chamada Agora
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && turmas.length === 0 && (
          <div className="text-center mt-20 opacity-50 flex flex-col items-center">
            <Calendar size={48} className="mb-4 text-gray-300" />
            <p>Nenhuma turma vinculada ao seu perfil.</p>
            <p className="text-sm">Fale com o coordenador para atribuir disciplinas.</p>
          </div>
        )}
      </div>

      {/* --- MODAL DE CHAMADA (Melhorado) --- */}
      {selectedTurma && (
        <div className="modal modal-open bg-black/60 backdrop-blur-sm z-50">
          <div className="modal-box w-11/12 max-w-4xl p-0 overflow-hidden">
            
            {/* Cabeçalho do Modal */}
            <div className="bg-primary text-white p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Users size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{selectedTurma.nome}</h3>
                  <p className="text-xs opacity-80">Lista de Presença em Tempo Real</p>
                </div>
              </div>
              <button className="btn btn-ghost btn-circle text-white hover:bg-white/20" onClick={() => setSelectedTurma(null)}>
                <X size={24} />
              </button>
            </div>

            {/* Corpo do Modal */}
            <div className="p-6 bg-base-100">
              
              {/* Barra de Ferramentas */}
              <div className="flex justify-between items-center mb-4 bg-base-200 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                   <Calendar size={16} />
                   <span>Data: {new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex gap-2">
                  <div className="join">
                    <input className="input input-sm join-item w-32 md:w-auto" placeholder="Buscar aluno..." />
                    <button className="btn btn-sm btn-square join-item"><Search size={16}/></button>
                  </div>
                  <button className="btn btn-sm btn-outline gap-1" onClick={() => verChamada(selectedTurma)}>
                    <RefreshCw size={14} className={loadingChamada ? "animate-spin" : ""} /> Atualizar
                  </button>
                </div>
              </div>

              {/* Tabela */}
              <div className="overflow-x-auto h-80 border border-base-200 rounded-lg">
                <table className="table table-zebra w-full header-fixed">
                  <thead className="bg-base-200 text-gray-600 sticky top-0 z-10">
                    <tr>
                      <th>Horário</th>
                      <th>RA</th>
                      <th>Aluno</th>
                      <th>Dispositivo</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {presencas.map((p) => (
                      <tr key={p.logId} className="hover">
                        <td className="font-mono text-xs font-bold text-primary">
                          {new Date(p.horario).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </td>
                        <td>{p.ra || '---'}</td>
                        <td className="font-bold">{p.aluno}</td>
                        <td className="text-xs text-gray-400">
                           {/* Simulação visual de ID de dispositivo */}
                           {p.deviceId ? '📱 App Verificado' : '❓ Desconhecido'}
                        </td>
                        <td>
                          {p.status === 'PENDENTE' && <span className="badge badge-warning badge-sm gap-1">Aguardando</span>}
                          {p.status === 'SINCRONIZADO' && <span className="badge badge-success badge-sm gap-1">Sincronizado</span>}
                          {p.status === 'ERRO' && <span className="badge badge-error badge-sm gap-1">Erro</span>}
                        </td>
                      </tr>
                    ))}
                    {!loadingChamada && presencas.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-16 text-gray-400 flex flex-col items-center justify-center w-full">
                          <Users size={48} className="opacity-20 mb-2" />
                          <p>Nenhum aluno registrou presença ainda.</p>
                          <p className="text-xs">A lista atualiza automaticamente.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Rodapé do Modal */}
            <div className="modal-action bg-base-200 p-4 m-0 flex justify-between items-center">
              <div className="text-xs text-gray-500">
                Total: <strong>{presencas.length}</strong> alunos presentes
              </div>
              <button className="btn btn-primary btn-sm px-6" disabled={presencas.length === 0}>
                Enviar para o SIGA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}