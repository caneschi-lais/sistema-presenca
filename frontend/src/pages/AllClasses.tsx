import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Search, MapPin, Calendar, Clock, 
  Users, BookOpen, MoreVertical 
} from 'lucide-react';

export default function AllClasses() {
  const navigate = useNavigate();
  const [turmas, setTurmas] = useState<any[]>([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);

  // Helper para dias da semana
  const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  useEffect(() => {
    fetch('http://localhost:3000/turmas')
      .then(res => res.json())
      .then(data => {
        setTurmas(data);
        setLoading(false);
      });
  }, []);

  // Filtro de busca
  const turmasFiltradas = turmas.filter(t => 
    t.nome.toLowerCase().includes(busca.toLowerCase()) ||
    t.professor?.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Navbar Simples */}
      <div className="bg-white shadow-sm px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="btn btn-circle btn-ghost btn-sm">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-gray-700 flex items-center gap-2">
          <BookOpen className="text-primary" /> Grade Curricular Completa
        </h1>
      </div>

      <div className="container mx-auto px-4 mt-8">
        
        {/* Barra de Ferramentas */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full md:w-96">
            <input 
              type="text" 
              placeholder="Buscar por matéria ou professor..." 
              className="input input-bordered w-full pl-10"
              value={busca}
              onChange={e => setBusca(e.target.value)}
            />
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          </div>
          <div className="badge badge-lg badge-primary badge-outline font-bold">
            Total: {turmasFiltradas.length} Disciplinas
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20"><span className="loading loading-spinner loading-lg text-primary"></span></div>
        ) : (
          <div className="card bg-white shadow-xl overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead className="bg-gray-50 text-gray-600 font-bold uppercase text-xs">
                  <tr>
                    <th>Disciplina</th>
                    <th>Professor</th>
                    <th>Horário</th>
                    <th>Localização (GPS)</th>
                    <th>Alunos</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {turmasFiltradas.map((turma) => (
                    <tr key={turma.id} className="hover">
                      <td>
                        <div className="font-bold text-primary text-base">{turma.nome}</div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="avatar placeholder">
                            <div className="bg-neutral-focus text-neutral-content rounded-full w-8 h-8 flex items-center justify-center bg-gray-200 text-xs">
                              {turma.professor?.nome.charAt(0)}
                            </div>
                          </div>
                          <span className="font-medium">{turma.professor?.nome || 'Sem prof.'}</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex flex-col gap-1 text-sm">
                          <span className="badge badge-ghost badge-sm gap-1">
                            <Calendar size={10} /> {dias[turma.diaSemana]}
                          </span>
                          <span className="badge badge-ghost badge-sm gap-1 font-mono">
                            <Clock size={10} /> {turma.horarioInicio}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1 text-xs text-gray-500" title={`Lat: ${turma.latitude}, Long: ${turma.longitude}`}>
                          <MapPin size={14} className="text-secondary" />
                          {turma.latitude.toFixed(4)}, {turma.longitude.toFixed(4)}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1 font-bold text-gray-600">
                          <Users size={16} /> {turma._count.alunos}
                        </div>
                      </td>
                      <td>
                        <button className="btn btn-square btn-ghost btn-sm">
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {turmasFiltradas.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-gray-400">
                        Nenhuma disciplina encontrada.
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