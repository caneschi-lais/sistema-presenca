import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Calendar, MapPin, RefreshCw, X, LogOut, 
  Clock, CheckCircle, Search, MoreVertical, GraduationCap, ChevronLeft, ChevronRight, Mail 
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function TeacherHome() {
  const user = JSON.parse(localStorage.getItem('geoClassUser') || '{}');
  const navigate = useNavigate();

  // Estados Gerais
  const [turmas, setTurmas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Estados para Modal de Chamada (Presença Hoje)
  const [selectedTurmaChamada, setSelectedTurmaChamada] = useState<any>(null);
  const [presencas, setPresencas] = useState<any[]>([]);
  const [loadingChamada, setLoadingChamada] = useState(false);

  // NOVO: Estados para Modal de Lista de Alunos (Paginação)
  const [selectedTurmaAlunos, setSelectedTurmaAlunos] = useState<any>(null);
  const [listaAlunos, setListaAlunos] = useState<any[]>([]);
  const [loadingAlunos, setLoadingAlunos] = useState(false);
  const [pageAlunos, setPageAlunos] = useState(1);
  const [totalPageAlunos, setTotalPageAlunos] = useState(1);
  const [buscaAlunos, setBuscaAlunos] = useState('');

  const diasSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

  useEffect(() => {
    carregarTurmas();
  }, [user.id]);

  // Debounce para busca de alunos
  useEffect(() => {
    if (selectedTurmaAlunos) {
      const timer = setTimeout(() => {
        carregarListaAlunos(selectedTurmaAlunos.id, 1); // Volta pra pág 1 ao buscar
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [buscaAlunos]);

  const carregarTurmas = () => {
    setLoading(true);
    fetch(`http://localhost:3000/professor/${user.id}/turmas`)
      .then(res => res.json())
      .then(data => { setTurmas(data); setLoading(false); })
      .catch(() => { toast.error("Erro ao carregar turmas."); setLoading(false); });
  };

  const handleLogout = () => {
    localStorage.removeItem('geoClassUser');
    navigate('/');
  };

  // --- FUNÇÕES DE CHAMADA (PRESENÇA) ---
  const verChamada = async (turma: any) => {
    setSelectedTurmaChamada(turma);
    setLoadingChamada(true);
    try {
      const res = await fetch(`http://localhost:3000/turma/${turma.id}/presencas`);
      const data = await res.json();
      setPresencas(data);
      if (data.length > 0) toast.info(`${data.length} presenças hoje.`);
    } catch (error) { toast.error("Erro ao buscar lista."); } 
    finally { setLoadingChamada(false); }
  };

  // --- NOVA FUNÇÃO: LISTAR ALUNOS DA TURMA ---
  const abrirListaAlunos = (turma: any) => {
    setSelectedTurmaAlunos(turma);
    setBuscaAlunos('');
    setPageAlunos(1);
    carregarListaAlunos(turma.id, 1);
  };

  const carregarListaAlunos = async (turmaId: string, page: number) => {
    setLoadingAlunos(true);
    try {
      const url = `http://localhost:3000/turma/${turmaId}/alunos?page=${page}&limit=5&search=${buscaAlunos}`; // Limit 5 para testar paginação
      const res = await fetch(url);
      const data = await res.json();
      
      setListaAlunos(data.data);
      setTotalPageAlunos(data.totalPages);
      setPageAlunos(data.page);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar alunos.");
    } finally {
      setLoadingAlunos(false);
    }
  };

  const mudarPaginaAlunos = (novaPagina: number) => {
    if (novaPagina >= 1 && novaPagina <= totalPageAlunos) {
      carregarListaAlunos(selectedTurmaAlunos.id, novaPagina);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 pb-10">
      {/* NAVBAR (Igual ao anterior) */}
      <div className="navbar bg-gradient-to-r from-primary to-[#0077b6] text-primary-content shadow-lg px-4 sm:px-8">
        <div className="flex-1 flex items-center gap-3">
          <img src="/logo.png" className="h-10 w-auto" alt="GeoClass" />
          <div>
            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
              GeoClass <span className="badge badge-accent text-white font-bold border-none bg-accent/90">Docente</span>
            </h1>
          </div>
        </div>
        <div className="flex-none gap-4">
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle avatar hover:ring-2 hover:ring-accent transition-all">
              <div className="w-11 rounded-full ring ring-accent ring-offset-base-100 ring-offset-2">
                <div className="bg-primary-focus text-white w-full h-full flex items-center justify-center font-bold text-lg">{user.nome?.charAt(0)}</div>
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
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-700 flex items-center gap-2">
              <Calendar className="text-primary" /> Minhas Turmas
            </h2>
          </div>
        </div>

        {loading && <div className="text-center py-20"><span className="loading loading-spinner loading-lg text-primary"></span></div>}

        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {turmas.map((turma) => (
              <div key={turma.id} className="card bg-base-100 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 group">
                <div className="card-body p-6">
                  <div className="flex justify-between items-start">
                    <div className="badge badge-primary badge-outline text-xs font-bold gap-1">
                       {turma.diaSemana !== undefined ? diasSemana[turma.diaSemana] : 'Dia a definir'}
                    </div>
                  </div>

                  <h3 className="card-title text-xl text-primary mt-2">{turma.nome}</h3>
                  <div className="divider my-2"></div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-accent" />
                      <span className="font-medium">Início: {turma.horarioInicio || '--:--'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-secondary" />
                      <span>{turma._count?.alunos || 0} Alunos matriculados</span>
                    </div>
                  </div>

                  {/* AÇÕES DO CARD */}
                  <div className="card-actions justify-end mt-6 flex-col gap-2">
                    {/* Botão Chamada (Existente) */}
                    <button 
                      className="btn btn-primary w-full gap-2 shadow-md"
                      onClick={() => verChamada(turma)}
                    >
                      <CheckCircle size={18} /> Chamada do Dia
                    </button>
                    
                    {/* Botão Ver Alunos (NOVO) */}
                    <button 
                      className="btn btn-secondary btn-outline w-full gap-2"
                      onClick={() => abrirListaAlunos(turma)}
                    >
                      <GraduationCap size={18} /> Ver Lista de Alunos
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- MODAL 1: CHAMADA EM TEMPO REAL --- */}
      {selectedTurmaChamada && (
        <div className="modal modal-open bg-black/60 backdrop-blur-sm z-50">
          <div className="modal-box w-11/12 max-w-4xl p-0 overflow-hidden">
            <div className="bg-primary text-white p-4 flex justify-between items-center">
              <h3 className="font-bold text-lg flex items-center gap-2"><CheckCircle/> Chamada: {selectedTurmaChamada.nome}</h3>
              <button className="btn btn-ghost btn-circle text-white" onClick={() => setSelectedTurmaChamada(null)}><X size={24} /></button>
            </div>
            <div className="p-6 bg-base-100">
                <div className="overflow-x-auto h-80 border border-base-200 rounded-lg">
                  <table className="table table-zebra w-full header-fixed">
                    <thead className="bg-base-200 text-gray-600 sticky top-0 z-10">
                      <tr><th>Horário</th><th>RA</th><th>Aluno</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                      {presencas.map((p) => (
                        <tr key={p.logId}>
                          <td className="font-mono text-xs">{new Date(p.horario).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</td>
                          <td>{p.ra}</td>
                          <td className="font-bold">{p.aluno}</td>
                          <td><span className="badge badge-success badge-sm">Presente</span></td>
                        </tr>
                      ))}
                      {presencas.length === 0 && <tr><td colSpan={4} className="text-center py-10 text-gray-400">Ninguém registrou presença hoje.</td></tr>}
                    </tbody>
                  </table>
                </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: LISTA DE ALUNOS (PAGINADA) --- */}
      {selectedTurmaAlunos && (
        <div className="modal modal-open bg-black/60 backdrop-blur-sm z-50">
          <div className="modal-box w-11/12 max-w-3xl p-0 overflow-hidden">
            
            {/* Cabeçalho do Modal */}
            <div className="bg-secondary text-white p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg"><GraduationCap size={24} /></div>
                <div>
                  <h3 className="font-bold text-lg">Alunos Matriculados</h3>
                  <p className="text-xs opacity-90">{selectedTurmaAlunos.nome}</p>
                </div>
              </div>
              <button className="btn btn-ghost btn-circle text-white hover:bg-white/20" onClick={() => setSelectedTurmaAlunos(null)}>
                <X size={24} />
              </button>
            </div>

            <div className="p-6 bg-base-100">
              
              {/* Barra de Busca */}
              <div className="mb-4">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Buscar aluno por nome ou RA..." 
                    className="input input-bordered w-full pl-10"
                    value={buscaAlunos}
                    onChange={(e) => setBuscaAlunos(e.target.value)}
                  />
                  <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                </div>
              </div>

              {/* Tabela de Alunos */}
              <div className="overflow-x-auto min-h-[300px]">
                {loadingAlunos ? (
                  <div className="flex justify-center items-center h-64"><span className="loading loading-spinner loading-lg text-secondary"></span></div>
                ) : (
                  <table className="table table-zebra w-full">
                    <thead>
                      <tr><th>Aluno</th><th>RA</th><th>Email</th></tr>
                    </thead>
                    <tbody>
                      {listaAlunos.map((aluno) => (
                        <tr key={aluno.id}>
                          <td>
                            <div className="flex items-center gap-3">
                              <div className="avatar placeholder">
                                <div className="bg-neutral-focus text-neutral-content rounded-full w-8 h-8 flex items-center justify-center bg-gray-200 text-xs font-bold">
                                  {aluno.nome.charAt(0)}
                                </div>
                              </div>
                              <span className="font-bold text-gray-700">{aluno.nome}</span>
                            </div>
                          </td>
                          <td className="font-mono text-gray-500">{aluno.ra}</td>
                          <td className="text-sm text-gray-500 flex items-center gap-1"><Mail size={12}/> {aluno.email}</td>
                        </tr>
                      ))}
                      {listaAlunos.length === 0 && (
                        <tr><td colSpan={3} className="text-center py-10 text-gray-400">Nenhum aluno encontrado nesta turma.</td></tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Paginação */}
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-500">Página {pageAlunos} de {totalPageAlunos}</span>
                <div className="join">
                  <button 
                    className="join-item btn btn-sm" 
                    onClick={() => mudarPaginaAlunos(pageAlunos - 1)}
                    disabled={pageAlunos === 1 || loadingAlunos}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button className="join-item btn btn-sm btn-active pointer-events-none">{pageAlunos}</button>
                  <button 
                    className="join-item btn btn-sm" 
                    onClick={() => mudarPaginaAlunos(pageAlunos + 1)}
                    disabled={pageAlunos === totalPageAlunos || loadingAlunos}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}