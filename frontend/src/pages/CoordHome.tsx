import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, BookOpen, AlertTriangle, GraduationCap, BarChart3, Settings, LogOut, ChevronRight, X, MapPin
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-base-200"><span className="loading loading-spinner loading-lg text-primary"></span></div>;

  return (
    <div className="min-h-screen bg-base-200 pb-10">
      {/* NAVBAR */}
      <div className="navbar bg-neutral text-neutral-content shadow-lg px-4 sm:px-8">
        <div className="flex-1 flex items-center gap-3">
          <img src="/logo.png" className="h-10 w-auto brightness-0 invert" alt="GeoClass" />
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            GeoClass <span className="badge badge-warning text-warning-content font-bold border-none">Gestão</span>
          </h1>
        </div>
        <div className="flex-none gap-4">
          <span className="hidden md:inline text-sm font-medium">Olá, Coordenador(a)</span>
          <button onClick={handleLogout} className="btn btn-ghost btn-circle text-error"><LogOut size={20} /></button>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-base-content flex items-center gap-2">
            <BarChart3 className="text-primary" size={28} /> Visão Geral da Instituição
          </h2>
          <p className="text-gray-500 mt-1">Clique nos cartões abaixo para ver os relatórios detalhados.</p>
        </div>

        {/* CARDS DE ESTATÍSTICAS (AGORA CLICÁVEIS) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          <div 
            onClick={() => setActiveModal('ALUNOS')}
            className="card bg-base-100 shadow-sm border-l-4 border-primary cursor-pointer hover:bg-base-300 hover:shadow-md transition-all"
          >
            <div className="card-body p-6 flex flex-row items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase">Alunos Matriculados</p>
                <p className="text-3xl font-bold text-base-content mt-1">{stats.totalAlunos}</p>
              </div>
              <div className="bg-primary/10 p-3 rounded-xl text-primary"><GraduationCap size={28} /></div>
            </div>
          </div>

          <div 
            onClick={() => setActiveModal('PROFESSORES')}
            className="card bg-base-100 shadow-sm border-l-4 border-secondary cursor-pointer hover:bg-base-300 hover:shadow-md transition-all"
          >
            <div className="card-body p-6 flex flex-row items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase">Professores</p>
                <p className="text-3xl font-bold text-base-content mt-1">{stats.totalProfessores}</p>
              </div>
              <div className="bg-secondary/10 p-3 rounded-xl text-secondary"><Users size={28} /></div>
            </div>
          </div>

          <div 
            onClick={() => setActiveModal('TURMAS')}
            className="card bg-base-100 shadow-sm border-l-4 border-accent cursor-pointer hover:bg-base-300 hover:shadow-md transition-all"
          >
            <div className="card-body p-6 flex flex-row items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase">Turmas Ativas</p>
                <p className="text-3xl font-bold text-base-content mt-1">{stats.turmasAtivas}</p>
              </div>
              <div className="bg-accent/10 p-3 rounded-xl text-accent"><BookOpen size={28} /></div>
            </div>
          </div>

          <div 
            onClick={() => setActiveModal('RISCO')}
            className="card bg-base-100 shadow-sm border-l-4 border-error cursor-pointer hover:bg-base-300 hover:shadow-md transition-all"
          >
            <div className="card-body p-6 flex flex-row items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase">Alertas de Risco</p>
                <p className="text-3xl font-bold text-error mt-1">{stats.alunosEmRisco}</p>
              </div>
              <div className="bg-error/10 p-3 rounded-xl text-error"><AlertTriangle size={28} /></div>
            </div>
          </div>

        </div>

        {/* GRÁFICO DE EVASÃO HISTÓRICA */}
        <div className="card bg-base-100 shadow-sm mb-8 border border-base-200">
          <div className="card-body">
            <h3 className="card-title text-base-content mb-6 flex items-center gap-2">
              <BarChart3 className="text-primary" /> Histórico de Evasão (Taxa Geral FATEC)
            </h3>
            
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dadosEvasao} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="semestre" stroke="#6b7280" fontStyle="bold" />
                  <YAxis unit="%" stroke="#6b7280" />
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'Taxa de Evasão']}
                    labelStyle={{ fontWeight: 'bold', color: '#374151' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="taxa" 
                    stroke="#ef4444" 
                    strokeWidth={4} 
                    dot={{ r: 6, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' }} 
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="text-sm text-gray-500 mt-4 text-center">
              *A taxa de evasão considera alunos que abandonaram o curso ou estouraram o limite de 25% de faltas.
            </div>
          </div>
        </div>

        {/* ÁREA INFERIOR MANTIDA PARA AÇÕES RÁPIDAS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           {/* Deixei o quadro de ações rápidas aqui, você pode adicionar outras funções no futuro */}
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAIS DE DETALHAMENTO */}
      {/* ========================================================= */}

      {/* 1. Modal de ALUNOS */}
      {activeModal === 'ALUNOS' && (
        <div className="modal modal-open bg-black/50 backdrop-blur-sm z-50">
          <div className="modal-box w-11/12 max-w-5xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-2xl flex items-center gap-2"><GraduationCap className="text-primary"/> Lista de Alunos</h3>
              <button className="btn btn-ghost btn-circle" onClick={() => setActiveModal(null)}><X /></button>
            </div>
            <div className="overflow-x-auto max-h-[60vh]">
              <table className="table table-zebra w-full">
                <thead className="bg-base-200 sticky top-0">
                  <tr><th>RA</th><th>Nome</th><th>Email</th><th>Matérias</th><th>Freq. Geral</th></tr>
                </thead>
                <tbody>
                  {detalhes.alunos.map((aluno: any) => (
                    <tr key={aluno.id}>
                      <td className="font-mono">{aluno.ra}</td>
                      <td className="font-bold">{aluno.nome}</td>
                      <td>{aluno.email}</td>
                      <td><div className="badge badge-neutral">{aluno.qtdMaterias} matriculadas</div></td>
                      <td><span className="text-success font-bold">{aluno.frequenciaGeral}%</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal de PROFESSORES */}
      {activeModal === 'PROFESSORES' && (
        <div className="modal modal-open bg-black/50 backdrop-blur-sm z-50">
          <div className="modal-box w-11/12 max-w-4xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-2xl flex items-center gap-2"><Users className="text-secondary"/> Corpo Docente</h3>
              <button className="btn btn-ghost btn-circle" onClick={() => setActiveModal(null)}><X /></button>
            </div>
            <div className="overflow-x-auto max-h-[60vh]">
              <table className="table table-zebra w-full">
                <thead className="bg-base-200 sticky top-0">
                  <tr><th>Nome</th><th>Email</th><th>Carga Horária</th></tr>
                </thead>
                <tbody>
                  {detalhes.professores.map((prof: any) => (
                    <tr key={prof.id}>
                      <td className="font-bold">{prof.nome}</td>
                      <td>{prof.email}</td>
                      <td><div className="badge badge-secondary">{prof.qtdMaterias} matérias lecionadas</div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. Modal de TURMAS */}
      {activeModal === 'TURMAS' && (
        <div className="modal modal-open bg-black/50 backdrop-blur-sm z-50">
          <div className="modal-box w-11/12 max-w-6xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-2xl flex items-center gap-2"><BookOpen className="text-accent"/> Turmas Ativas</h3>
              <button className="btn btn-ghost btn-circle" onClick={() => setActiveModal(null)}><X /></button>
            </div>
            <div className="overflow-x-auto max-h-[60vh]">
              <table className="table table-zebra w-full text-sm">
                <thead className="bg-base-200 sticky top-0">
                  <tr><th>Disciplina</th><th>Professor</th><th>Horário</th><th>Alunos</th><th>Geolocalização</th></tr>
                </thead>
                <tbody>
                  {detalhes.turmas.map((turma: any) => (
                    <tr key={turma.id}>
                      <td className="font-bold">{turma.nome}<br/><span className="text-xs font-normal text-gray-500">{turma.totalAulas} aulas no semestre</span></td>
                      <td>{turma.professor}</td>
                      <td>{turma.diaSemana !== undefined ? diasSemana[turma.diaSemana] : '-'} às {turma.horarioInicio}</td>
                      <td><div className="badge badge-accent">{turma.qtdAlunos} matriculados</div></td>
                      <td>
                        <div className="flex flex-col text-xs text-gray-500">
                          <span className="flex items-center gap-1"><MapPin size={12}/> Raio: 50m</span>
                          <span>Lat: {turma.lat?.toString().substring(0,8)}</span>
                          <span>Lon: {turma.long?.toString().substring(0,8)}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. Modal de ALUNOS EM RISCO */}
      {activeModal === 'RISCO' && (
        <div className="modal modal-open bg-black/50 backdrop-blur-sm z-50">
          <div className="modal-box w-11/12 max-w-5xl border-t-8 border-error">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-2xl flex items-center gap-2 text-error"><AlertTriangle/> Alertas de Frequência (&lt; 75%)</h3>
              <button className="btn btn-ghost btn-circle" onClick={() => setActiveModal(null)}><X /></button>
            </div>
            <div className="overflow-x-auto max-h-[60vh]">
              <table className="table table-zebra w-full">
                <thead className="bg-base-200 sticky top-0">
                  <tr><th>RA</th><th>Aluno</th><th>Email</th><th>Disciplina</th><th>Frequência</th></tr>
                </thead>
                <tbody>
                  {detalhes.risco.map((risco: any) => (
                    <tr key={risco.id}>
                      <td className="font-mono">{risco.ra}</td>
                      <td className="font-bold">{risco.nome}</td>
                      <td>{risco.email}</td>
                      <td>{risco.turma}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <progress className="progress progress-error w-16" value={risco.frequencia} max="100"></progress>
                          <span className="text-error font-bold text-sm">{risco.frequencia}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {detalhes.risco.length === 0 && (
                    <tr><td colSpan={5} className="text-center py-8 text-success font-bold">Nenhum aluno em risco no momento! 🎉</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}