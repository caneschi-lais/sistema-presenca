import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
  LayoutDashboard, AlertTriangle, PlusCircle, Save, Map, 
  LogOut, Lightbulb, TrendingUp 
} from 'lucide-react';

export default function CoordHome() {
  const user = JSON.parse(localStorage.getItem('geoClassUser') || '{}');
  const navigate = useNavigate();
  
  const [stats, setStats] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [professores, setProfessores] = useState<any[]>([]);
  const [novaTurma, setNovaTurma] = useState({
    nome: '', professorId: '', lat: '', long: '', totalAulas: 40, diaSemana: '1', horarioInicio: '19:00'
  });
  const [msgForm, setMsgForm] = useState('');

  // Cores do Gráfico (Azul Primary e Verde Success)
  const COLORS = ['#0056b3', '#00a96e']; 

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = () => {
    // 1. Dados Gerais
    fetch('http://localhost:3000/coordenador/dashboard')
      .then(res => res.json())
      .then(setStats);
    
    // 2. Dados de Inteligência (Gráficos)
    fetch('http://localhost:3000/coordenador/analytics')
      .then(res => res.json())
      .then(setAnalytics);

    fetch('http://localhost:3000/lista-professores')
      .then(res => res.json())
      .then(setProfessores);
  };

  const handleCriarTurma = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsgForm('Salvando...');
    try {
      const res = await fetch('http://localhost:3000/turmas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novaTurma)
      });
      if (res.ok) {
        setMsgForm('✅ Turma criada!');
        carregarDados();
        setNovaTurma({...novaTurma, nome: ''});
      } else setMsgForm('❌ Erro.');
    } catch (e) { setMsgForm('❌ Erro Conexão.'); }
  };

  const handleLogout = () => {
    localStorage.removeItem('geoClassUser');
    navigate('/');
  };

  if (!stats || !analytics) return <div className="p-10 text-center text-primary font-bold">Carregando Inteligência...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Navbar */}
      <div className="navbar bg-white shadow-sm px-6 border-b border-primary/20">
        <div className="flex-1">
          <img src="/logo.png" className="h-10 mr-2" />
          <span className="font-bold text-xl text-primary">Geo<span className="text-success">Class</span> | Gestão</span>
        </div>
        <div className="flex-none gap-3">
          <p className="text-sm font-bold text-gray-700 hidden sm:block">Coord. {user.nome}</p>
          <button onClick={handleLogout} className="btn btn-ghost btn-circle text-error" title="Sair"><LogOut size={20}/></button>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8">
        
        {/* 1. SEÇÃO DE INTELIGÊNCIA (INSIGHTS) */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
            <Lightbulb className="text-yellow-500" /> Insights da IA
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {analytics.insights.map((insight: string, idx: number) => (
               <div key={idx} className="alert bg-white shadow-sm border-l-4 border-success">
                 <div>
                   <TrendingUp className="stroke-current flex-shrink-0 h-6 w-6 text-success" />
                   <span className="text-gray-700 font-medium">{insight}</span>
                 </div>
               </div>
             ))}
          </div>
        </div>

        {/* 2. GRÁFICOS E ESTATÍSTICAS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            
            {/* Gráfico de Barras: Adesão Semanal */}
            <div className="card bg-white shadow-xl lg:col-span-2">
              <div className="card-body">
                <h3 className="card-title text-gray-700 text-sm">Frequência Semanal (Presenças Totais)</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.graficoDias}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="presencas" fill="#0056b3" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Gráfico de Pizza: Pontualidade */}
            <div className="card bg-white shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-gray-700 text-sm">Análise de Pontualidade</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.graficoPontualidade}
                        cx="50%" cy="50%"
                        innerRadius={60} outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {analytics.graficoPontualidade.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-center text-xs text-gray-400 mt-2">
                  Baseado nos registros de hoje
                </div>
              </div>
            </div>
        </div>

        {/* 3. OPERACIONAL (Tabela de Risco e Cadastro) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Radar de Evasão */}
          <div className="card bg-white shadow-xl border border-gray-100">
            <div className="card-body">
              <h3 className="card-title text-gray-700 mb-4 flex items-center gap-2">
                <AlertTriangle className="text-error" /> Radar de Evasão
              </h3>
              <div className="overflow-x-auto h-64">
                <table className="table table-compact w-full">
                  <thead>
                    <tr><th>Aluno</th><th>Freq</th><th>Situação</th></tr>
                  </thead>
                  <tbody>
                    {stats.detalhesRisco.map((item: any, idx: number) => (
                      <tr key={idx}>
                        <td>{item.nome}</td>
                        <td className="font-bold text-error">{item.frequencia}%</td>
                        <td><span className="badge badge-error badge-xs">Crítico</span></td>
                      </tr>
                    ))}
                    {stats.detalhesRisco.length === 0 && <tr><td colSpan={3} className="text-center text-success">Nenhum risco detectado!</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Cadastro de Turma (Atualizado com Horário) */}
          <div className="card bg-white shadow-xl border border-gray-100">
            <div className="card-body">
              <h3 className="card-title text-success mb-2 flex items-center gap-2">
                <PlusCircle /> Nova Turma
              </h3>
              <form onSubmit={handleCriarTurma} className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Nome da Matéria" className="input input-bordered col-span-2 input-sm" 
                  value={novaTurma.nome} onChange={e => setNovaTurma({...novaTurma, nome: e.target.value})} required />
                
                <select className="select select-bordered select-sm" value={novaTurma.professorId} onChange={e => setNovaTurma({...novaTurma, professorId: e.target.value})} required>
                  <option value="">Professor...</option>
                  {professores.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                </select>

                <input type="time" className="input input-bordered input-sm" value={novaTurma.horarioInicio} onChange={e => setNovaTurma({...novaTurma, horarioInicio: e.target.value})} required />

                <input type="number" placeholder="Lat" className="input input-bordered input-sm" value={novaTurma.lat} onChange={e => setNovaTurma({...novaTurma, lat: e.target.value})} required />
                <input type="number" placeholder="Long" className="input input-bordered input-sm" value={novaTurma.long} onChange={e => setNovaTurma({...novaTurma, long: e.target.value})} required />

                <button type="submit" className="btn btn-success btn-sm text-white col-span-2 gap-2">
                  <Save size={16} /> Salvar Turma
                </button>
              </form>
              <p className="text-center text-xs text-primary mt-2">{msgForm}</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}