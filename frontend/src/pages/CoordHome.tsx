import { useState, useEffect } from 'react';
// 1. Importe useNavigate e LogOut
import { useNavigate } from 'react-router-dom';
import { BarChart, AlertTriangle, PlusCircle, Save, Map, LogOut } from 'lucide-react';

export default function CoordHome() {
  const user = JSON.parse(localStorage.getItem('geoClassUser') || '{}');
  const navigate = useNavigate(); // 2. Inicialize o hook de navegação
  
  // ... (seus estados existentes: stats, loading, professores, novaTurma...)
  // MANTENHA TODO O CÓDIGO DE ESTADOS E EFEITOS IGUAL

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [professores, setProfessores] = useState<any[]>([]);
  const [novaTurma, setNovaTurma] = useState({
    nome: '', professorId: '', lat: '', long: '', totalAulas: 40
  });
  const [msgForm, setMsgForm] = useState('');

  useEffect(() => { carregarDashboard(); carregarProfessores(); }, []);

  const carregarDashboard = () => {
    fetch('http://localhost:3000/coordenador/dashboard')
      .then(res => res.json())
      .then(data => { setStats(data); setLoading(false); });
  };

  const carregarProfessores = () => {
    fetch('http://localhost:3000/lista-professores')
      .then(res => res.json())
      .then(data => setProfessores(data));
  };

  const handleCriarTurma = async (e: React.FormEvent) => {
    // ... (MANTENHA A LÓGICA DE CRIAR TURMA IGUAL)
    e.preventDefault();
    setMsgForm('Salvando...');
    try {
      const res = await fetch('http://localhost:3000/turmas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novaTurma)
      });
      if (res.ok) {
        setMsgForm('✅ Turma criada com sucesso!');
        setNovaTurma({ nome: '', professorId: '', lat: '', long: '', totalAulas: 40 });
        carregarDashboard();
      } else { setMsgForm('❌ Erro ao criar.'); }
    } catch (error) { setMsgForm('❌ Erro de conexão.'); }
  };

  // 3. FUNÇÃO DE LOGOUT
  const handleLogout = () => {
    localStorage.removeItem('geoClassUser'); // Apaga o usuário
    navigate('/'); // Manda de volta para o Login
  };

  if (loading) return <div className="p-10 text-center text-primary font-bold">Carregando GeoClass...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="navbar bg-white shadow-sm px-6 border-b border-primary/20">
        <div className="flex-1">
          <img src="/logo.png" className="h-10 mr-2" />
          <span className="font-bold text-xl text-primary">
            Geo<span className="text-success">Class</span> 
            <span className="text-gray-400 font-normal text-sm ml-2">| Gestão Acadêmica</span>
          </span>
        </div>
        <div className="flex-none gap-3">
          <div className="text-right hidden sm:block">
            <p className="font-bold text-sm text-gray-700">{user.nome}</p>
            <p className="text-xs text-success font-bold">Coordenador</p>
          </div>
          <div className="avatar placeholder">
            <div className="bg-primary text-primary-content rounded-full w-10">
              <span>{user.nome?.charAt(0)}</span>
            </div>
          </div>

          {/* 4. BOTÃO DE SAIR */}
          <button 
            onClick={handleLogout} 
            className="btn btn-ghost btn-circle text-error tooltip tooltip-bottom" 
            data-tip="Sair"
          >
            <LogOut size={20} />
          </button>

        </div>
      </div>

      {/* ... (O RESTO DO CONTEÚDO DA PÁGINA CONTINUA IGUAL) ... */}
      <div className="container mx-auto px-4 mt-8">
         {/* Cole aqui o resto do código da tela (KPI Cards, Formulários etc) que você já tem */}
         {/* Para economizar espaço, não repeti os cards aqui, mas eles devem continuar lá */}
         
         {/* KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="stats shadow bg-white border-b-4 border-primary">
            <div className="stat">
              <div className="stat-figure text-primary"><BarChart size={32}/></div>
              <div className="stat-title">Total de Alunos</div>
              <div className="stat-value text-primary">{stats.totalAlunos}</div>
              <div className="stat-desc">Matriculados no sistema</div>
            </div>
          </div>
          <div className="stats shadow bg-white border-b-4 border-success">
            <div className="stat">
              <div className="stat-figure text-success"><Map size={32}/></div>
              <div className="stat-title">Turmas Monitoradas</div>
              <div className="stat-value text-success">{stats.totalTurmas}</div>
              <div className="stat-desc">Com geofencing ativo</div>
            </div>
          </div>
          <div className="stats shadow bg-white border-b-4 border-error">
            <div className="stat">
              <div className="stat-figure text-error"><AlertTriangle size={32}/></div>
              <div className="stat-title text-error">Risco de Evasão</div>
              <div className="stat-value text-error">{stats.alunosEmRisco}</div>
              <div className="stat-desc">Alunos com freq &lt; 75%</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card bg-white shadow-xl border border-gray-100">
            <div className="card-body">
              <h3 className="card-title text-gray-700 mb-4 flex items-center gap-2">
                <AlertTriangle className="text-error" /> Radar de Evasão
              </h3>
              <div className="overflow-x-auto h-80">
                <table className="table table-compact w-full">
                  <thead>
                    <tr><th>Aluno</th><th>Disciplina</th><th>Freq</th><th>Situação</th></tr>
                  </thead>
                  <tbody>
                    {stats.detalhesRisco.map((item: any, idx: number) => (
                      <tr key={idx}>
                        <td><div className="font-bold text-gray-700">{item.nome}</div><div className="text-xs opacity-50">RA: {item.ra}</div></td>
                        <td className="text-xs">{item.turma}</td>
                        <td className="font-bold text-error">{item.frequencia}%</td>
                        <td><span className="badge badge-error badge-outline badge-xs">Crítico</span></td>
                      </tr>
                    ))}
                    {stats.detalhesRisco.length === 0 && (
                      <tr><td colSpan={4} className="text-center py-10 text-success font-bold">Nenhum aluno em risco no momento! 👏</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="card bg-white shadow-xl border border-gray-100">
            <div className="card-body">
              <h3 className="card-title text-success mb-4 flex items-center gap-2">
                <PlusCircle className="text-success" /> Cadastrar Nova Turma
              </h3>
              <form onSubmit={handleCriarTurma} className="flex flex-col gap-3">
                <div className="form-control">
                  <label className="label"><span className="label-text">Nome da Disciplina</span></label>
                  <input type="text" placeholder="Ex: Algoritmos II" className="input input-bordered focus:input-success" 
                    value={novaTurma.nome} onChange={e => setNovaTurma({...novaTurma, nome: e.target.value})} required />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Professor Responsável</span></label>
                  <select className="select select-bordered focus:select-success" 
                    value={novaTurma.professorId} onChange={e => setNovaTurma({...novaTurma, professorId: e.target.value})} required>
                    <option value="">Selecione...</option>
                    {professores.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label"><span className="label-text">Latitude (Centro)</span></label>
                    <input type="number" step="any" placeholder="-23.09..." className="input input-bordered focus:input-success" 
                      value={novaTurma.lat} onChange={e => setNovaTurma({...novaTurma, lat: e.target.value})} required />
                  </div>
                  <div className="form-control">
                    <label className="label"><span className="label-text">Longitude (Centro)</span></label>
                    <input type="number" step="any" placeholder="-47.25..." className="input input-bordered focus:input-success" 
                      value={novaTurma.long} onChange={e => setNovaTurma({...novaTurma, long: e.target.value})} required />
                  </div>
                </div>
                <div className="text-xs text-gray-400 mt-1">* Dica: Use o Google Maps, clique com botão direito no local e copie as coordenadas.</div>
                <button type="submit" className="btn btn-success text-white mt-4 gap-2 font-bold hover:scale-105 transition-transform">
                  <Save size={18} /> Salvar Turma
                </button>
                {msgForm && <p className="text-center font-bold text-sm mt-2 text-primary">{msgForm}</p>}
              </form>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}