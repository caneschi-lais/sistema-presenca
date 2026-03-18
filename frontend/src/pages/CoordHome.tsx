import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ActionButton from '../components/ActionButton';
import {
  Users, BookOpen, AlertTriangle, GraduationCap, BarChart3, FileText, Settings
} from 'lucide-react';
import EvasionChart from '../components/EvasionChart';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import StatCard from '../components/StatCard';

export default function CoordHome() {
  const user = JSON.parse(localStorage.getItem('geoClassUser') || '{}');
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalAlunos: 0, totalProfessores: 0, turmasAtivas: 0, alunosEmRisco: 0 });

  // Estado para armazenar as listas detalhadas
  const [detalhes, setDetalhes] = useState({ alunos: [], professores: [], turmas: [], risco: [] });

  // Estado para controlar qual modal está aberto
  const [activeModal, setActiveModal] = useState<'ALUNOS' | 'PROFESSORES' | 'TURMAS' | 'RISCO' | null>(null);

  const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  const dadosEvasao = [
    { semestre: '2024.1', taxa: 18.5 },
    { semestre: '2024.2', taxa: 16.2 },
    { semestre: '2025.1', taxa: 14.0 },
    { semestre: '2025.2', taxa: 15.5 },
    { semestre: '2026.1', taxa: 12.3 },
  ];

  useEffect(() => {
    if (!user || user.perfil !== 'COORDENADOR') {
      navigate('/');
      return;
    }
    carregarDashboard();
  }, []);

  const carregarDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/coordenador/analytics');
      const data = await res.json();

      if (res.ok) {
        setStats(data.stats);
        setDetalhes(data.detalhes);
      }
    } catch (error) {
      console.error("Erro de conexão:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="A carregar dados institucionais..." />;

  return (
    <div className="container mx-auto px-4 mt-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-base-content flex items-center gap-2">
          <BarChart3 className="text-primary" size={28} /> Visão Geral da Instituição
        </h2>
        <p className="text-gray-500 mt-1">Clique nos cartões abaixo para ver os relatórios detalhados.</p>
      </div>

      {/* CARDS DE ESTATÍSTICAS (COMPONENTIZADOS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

        <StatCard
          title="Alunos Matriculados"
          value={stats.totalAlunos}
          icon={<GraduationCap size={28} />}
          color="primary"
          onClick={() => setActiveModal('ALUNOS')}
        />

        <StatCard
          title="Professores"
          value={stats.totalProfessores}
          icon={<Users size={28} />}
          color="secondary"
          onClick={() => setActiveModal('PROFESSORES')}
        />

        <StatCard
          title="Turmas Ativas"
          value={stats.turmasAtivas}
          icon={<BookOpen size={28} />}
          color="accent"
          onClick={() => setActiveModal('TURMAS')}
        />

        <StatCard
          title="Alertas de Risco"
          value={stats.alunosEmRisco}
          icon={<AlertTriangle size={28} />}
          color="error"
          onClick={() => setActiveModal('RISCO')}
        />

      </div>

      {/* GRÁFICO DE EVASÃO HISTÓRICA */}
      <EvasionChart data={dadosEvasao} />

      {/* ÁREA INFERIOR MANTIDA PARA AÇÕES RÁPIDAS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card bg-base-100 shadow-sm border border-gray-100">
          <div className="card-body">
            <h3 className="card-title text-base-content mb-4 flex items-center gap-2">
              <Settings size={20} /> Gestão Acadêmica
            </h3>

            <div className="flex flex-col gap-3">
              <ActionButton
                title="Gerenciar Turmas"
                description="Criar turmas e configurar geolocalização"
                variant="outline"
                icon={<BookOpen size={20} />}
                showChevron={true}
                onClick={() => console.log('Abrir turmas')}
              />

              <ActionButton
                title="Cadastrar Docentes"
                description="Adicionar novos professores ao sistema"
                variant="outline"
                icon={<Users size={20} />}
                showChevron={true}
                onClick={() => console.log('Abrir professores')}
              />

              <ActionButton
                title="Relatórios Gerais"
                description="Exportar dados de presença e faltas"
                variant="outline"
                icon={<FileText size={20} />}
                showChevron={true}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAIS DE DETALHAMENTO (AGORA COMPONENTIZADOS E LINDOS!) */}
      {/* ========================================================= */}

      {/* 1. Modal de ALUNOS */}
      <Modal
        isOpen={activeModal === 'ALUNOS'}
        onClose={() => setActiveModal(null)}
        title={<><GraduationCap /> Lista de Alunos Matriculados</>}
        headerColor="primary"
        maxWidth="max-w-5xl"
      >
        {/* Cole aqui apenas a <table className="table table-zebra..."> dos alunos */}
      </Modal>

      {/* 2. Modal de PROFESSORES */}
      <Modal
        isOpen={activeModal === 'PROFESSORES'}
        onClose={() => setActiveModal(null)}
        title={<><Users /> Corpo Docente</>}
        headerColor="secondary"
        maxWidth="max-w-4xl"
      >
        {/* Cole aqui apenas a <table className="table table-zebra..."> dos professores */}
      </Modal>

      {/* 3. Modal de TURMAS */}
      <Modal
        isOpen={activeModal === 'TURMAS'}
        onClose={() => setActiveModal(null)}
        title={<><BookOpen /> Turmas Ativas</>}
        headerColor="accent"
        maxWidth="max-w-6xl"
      >
        {/* Cole aqui apenas a <table className="table table-zebra..."> das turmas */}
      </Modal>

      {/* 4. Modal de ALUNOS EM RISCO */}
      <Modal
        isOpen={activeModal === 'RISCO'}
        onClose={() => setActiveModal(null)}
        title={<><AlertTriangle /> Alertas de Frequência (&lt; 75%)</>}
        headerColor="error"
        maxWidth="max-w-5xl"
      >
        {/* Cole aqui apenas a <table className="table table-zebra..."> dos alunos em risco */}
      </Modal>
    </div>
  );
}