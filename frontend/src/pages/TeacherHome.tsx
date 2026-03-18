import { useState, useEffect } from 'react';
import AttendanceTable from '../components/AttendanceTable';
import { useNavigate } from 'react-router-dom';
import ClassCard from '../components/ClassCard';
import { 
  Users, Calendar, RefreshCw, X, 
  Clock, CheckCircle, Search, GraduationCap, ChevronLeft, ChevronRight, Mail 
} from 'lucide-react';
import { toast } from 'react-toastify';
import ActionButton from '../components/ActionButton';

export default function TeacherHome() {
  const user = JSON.parse(localStorage.getItem('geoClassUser') || '{}');
  const navigate = useNavigate();

  const [turmas, setTurmas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedTurmaChamada, setSelectedTurmaChamada] = useState<any>(null);
  const [presencas, setPresencas] = useState<any[]>([]);
  const [loadingChamada, setLoadingChamada] = useState(false);

  const [selectedTurmaAlunos, setSelectedTurmaAlunos] = useState<any>(null);
  const [listaAlunos, setListaAlunos] = useState<any[]>([]);
  const [loadingAlunos, setLoadingAlunos] = useState(false);
  const [pageAlunos, setPageAlunos] = useState(1);
  const [totalPageAlunos, setTotalPageAlunos] = useState(1);
  const [buscaAlunos, setBuscaAlunos] = useState('');

  const diasSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

  useEffect(() => {
    if (!user || user.perfil !== 'PROFESSOR') {
      navigate('/');
      return;
    }
    carregarTurmas();
  }, []);

  useEffect(() => {
    if (selectedTurmaAlunos) {
      const timer = setTimeout(() => {
        carregarListaAlunos(selectedTurmaAlunos.id, 1);
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

  const verChamada = async (turma: any) => {
    setSelectedTurmaChamada(turma);
    setLoadingChamada(true);
    try {
      const res = await fetch(`http://localhost:3000/turma/${turma.id}/presencas`);
      const data = await res.json();
      setPresencas(data);
    } catch (error) { 
      toast.error("Erro ao buscar lista."); 
    } finally { 
      setLoadingChamada(false); 
    }
  };

  const abrirListaAlunos = (turma: any) => {
    setSelectedTurmaAlunos(turma);
    setBuscaAlunos('');
    setPageAlunos(1);
    carregarListaAlunos(turma.id, 1);
  };

  const carregarListaAlunos = async (turmaId: string, page: number) => {
    setLoadingAlunos(true);
    try {
      const url = `http://localhost:3000/turma/${turmaId}/alunos?page=${page}&limit=5&search=${buscaAlunos}`;
      const res = await fetch(url);
      const data = await res.json();
      
      setListaAlunos(data.data);
      setTotalPageAlunos(data.totalPages);
      setPageAlunos(data.page);
    } catch (error) {
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
    <div className="container mx-auto px-4 mt-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-700 flex items-center gap-2">
            <Calendar className="text-primary" /> Minhas Turmas
          </h2>
        </div>
      </div>

      {loading && <div className="text-center py-20"><span className="loading loading-spinner loading-lg text-primary"></span></div>}

      {!loading && turmas.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          Você ainda não foi alocado em nenhuma turma.
        </div>
      )}

          {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {turmas.map((turma) => (
            <ClassCard 
              key={turma.id}
              title={turma.nome}
              topBadge={
                <span className="badge badge-primary badge-outline text-xs font-bold gap-1">
                  {turma.diaSemana !== undefined ? diasSemana[turma.diaSemana] : 'Dia a definir'}
                </span>
              }
              actions={
                <>
                  <ActionButton 
                    title="Chamada do Dia" 
                    icon={<CheckCircle size={18} />} 
                    onClick={() => verChamada(turma)} 
                  />
                  <ActionButton 
                    title="Ver Lista de Alunos" 
                    icon={<GraduationCap size={18} />} 
                    variant="outline"
                    className="btn-secondary" // Força a cor secundária no modo outline
                    onClick={() => abrirListaAlunos(turma)} 
                  />
                </>
              }
            >
              {/* O QUE FICA DENTRO DO CARTÃO DO PROFESSOR: */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-accent" />
                  <span className="font-medium">Início: {turma.horarioInicio || '--:--'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-secondary" />
                  <span>{turma._count?.alunos || 0} Alunos matriculados</span>
                </div>
              </div>
            </ClassCard>
          ))}
        </div>
      )}

      {/* MODAIS (MANTIDOS IGUAIS, APENAS COPIADOS DO SEU CÓDIGO ORIGINAL) */}
      {selectedTurmaChamada && (
        <div className="modal modal-open bg-black/60 backdrop-blur-sm z-50">
          <div className="modal-box w-11/12 max-w-4xl p-0 overflow-hidden">
            <div className="bg-primary text-white p-4 flex justify-between items-center">
              <h3 className="font-bold text-lg flex items-center gap-2"><CheckCircle/> Chamada: {selectedTurmaChamada.nome}</h3>
              <div className="flex items-center gap-2">
                <button 
                  className="btn btn-ghost btn-circle text-white tooltip tooltip-left" 
                  data-tip="Atualizar lista"
                  onClick={() => verChamada(selectedTurmaChamada)}
                >
                  <RefreshCw size={20} className={loadingChamada ? "animate-spin" : ""} />
                </button>
                <button className="btn btn-ghost btn-circle text-white" onClick={() => setSelectedTurmaChamada(null)}>
                  <X size={24} />
                </button>
              </div>
            </div>
            
            {/* VEJA COMO FICOU LIMPO AQUI EMBAIXO: */}
            <div className="p-6 bg-base-100">
                <AttendanceTable presencas={presencas} loading={loadingChamada} />
            </div>

          </div>
        </div>
      )}

      {selectedTurmaAlunos && (
        <div className="modal modal-open bg-black/60 backdrop-blur-sm z-50">
          <div className="modal-box w-11/12 max-w-3xl p-0 overflow-hidden">
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
              <div className="mb-4">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Buscar aluno..." 
                    className="input input-bordered w-full pl-10"
                    value={buscaAlunos}
                    onChange={(e) => setBuscaAlunos(e.target.value)}
                  />
                  <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                </div>
              </div>
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
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-500">Página {pageAlunos} de {totalPageAlunos}</span>
                <div className="join">
                  <button className="join-item btn btn-sm" onClick={() => mudarPaginaAlunos(pageAlunos - 1)} disabled={pageAlunos === 1 || loadingAlunos}><ChevronLeft size={16} /></button>
                  <button className="join-item btn btn-sm btn-active pointer-events-none">{pageAlunos}</button>
                  <button className="join-item btn btn-sm" onClick={() => mudarPaginaAlunos(pageAlunos + 1)} disabled={pageAlunos === totalPageAlunos || loadingAlunos}><ChevronRight size={16} /></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}