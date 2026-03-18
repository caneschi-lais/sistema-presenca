import { useState, useEffect } from 'react';
import AttendanceTable from '../components/AttendanceTable';
import { useNavigate } from 'react-router-dom';
import ClassCard from '../components/ClassCard';
import {
  Users, Calendar, RefreshCw, X,
  Clock, CheckCircle, Search, GraduationCap, ChevronLeft, ChevronRight, Mail, BookX, UserX
} from 'lucide-react';
import { toast } from 'react-toastify';
import ActionButton from '../components/ActionButton';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';

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

      {loading && <LoadingSpinner text="A buscar as suas disciplinas..." />}

      {!loading && turmas.length === 0 && (
        <EmptyState
          title="Agenda Livre"
          message="Você ainda não foi alocado em nenhuma turma neste semestre."
          icon={<BookX size={48} />}
        />
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

      {/* 1. MODAL DE CHAMADA */}
      <Modal
        isOpen={!!selectedTurmaChamada}
        onClose={() => setSelectedTurmaChamada(null)}
        title={<><CheckCircle /> Chamada: {selectedTurmaChamada?.nome}</>}
        headerColor="primary"
        maxWidth="max-w-4xl"
        headerAction={
          <button
            className="btn btn-ghost btn-circle text-white tooltip tooltip-left"
            data-tip="Atualizar lista"
            onClick={() => verChamada(selectedTurmaChamada)}
          >
            <RefreshCw size={20} className={loadingChamada ? "animate-spin" : ""} />
          </button>
        }
      >
        <AttendanceTable presencas={presencas} loading={loadingChamada} />
      </Modal>

      {/* 2. MODAL DE LISTA DE ALUNOS */}
      <Modal
        isOpen={!!selectedTurmaAlunos}
        onClose={() => setSelectedTurmaAlunos(null)}
        title={
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg"><GraduationCap size={24} /></div>
            <div className="flex flex-col">
              <span>Alunos Matriculados</span>
              <span className="text-xs opacity-90 font-normal">{selectedTurmaAlunos?.nome}</span>
            </div>
          </div>
        }
        headerColor="secondary"
        maxWidth="max-w-3xl"
      >
        {/* AQUI DENTRO FICA APENAS A BARRA DE BUSCA E A TABELA DE ALUNOS QUE JÁ ESTAVAM NO SEU CÓDIGO */}
        {/* ... (Cole a div da barra de busca, a tabela e a paginação aqui) ... */}
      </Modal>
    </div>
  );
}