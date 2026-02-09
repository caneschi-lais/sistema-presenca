import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Search, Users, Shield, Briefcase, Mail, MoreVertical 
} from 'lucide-react';

export default function TeamList() {
  const navigate = useNavigate();
  const [equipe, setEquipe] = useState<any[]>([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3000/equipe')
      .then(res => res.json())
      .then(data => {
        setEquipe(data);
        setLoading(false);
      });
  }, []);

  // Filtro de busca (Nome ou Email)
  const equipeFiltrada = equipe.filter(user => 
    user.nome.toLowerCase().includes(busca.toLowerCase()) ||
    user.email.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Navbar Simples */}
      <div className="bg-white shadow-sm px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="btn btn-circle btn-ghost btn-sm">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-gray-700 flex items-center gap-2">
          <Users className="text-secondary" /> Gestão de Equipe Acadêmica
        </h1>
      </div>

      <div className="container mx-auto px-4 mt-8">
        
        {/* Barra de Ferramentas */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full md:w-96">
            <input 
              type="text" 
              placeholder="Buscar por nome ou email..." 
              className="input input-bordered w-full pl-10"
              value={busca}
              onChange={e => setBusca(e.target.value)}
            />
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          </div>
          <div className="flex gap-2">
             <div className="badge badge-lg badge-ghost">Total: {equipeFiltrada.length}</div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20"><span className="loading loading-spinner loading-lg text-secondary"></span></div>
        ) : (
          <div className="card bg-white shadow-xl overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead className="bg-gray-50 text-gray-600 font-bold uppercase text-xs">
                  <tr>
                    <th>Profissional</th>
                    <th>Cargo / Perfil</th>
                    <th>Contato</th>
                    <th>Carga Horária</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {equipeFiltrada.map((user) => (
                    <tr key={user.id} className="hover">
                      <td>
                        <div className="flex items-center gap-3">
                          <div className={`avatar placeholder`}>
                            <div className={`rounded-full w-10 h-10 flex items-center justify-center text-white font-bold ${user.perfil === 'COORDENADOR' ? 'bg-secondary' : 'bg-primary'}`}>
                              {user.nome.charAt(0)}
                            </div>
                          </div>
                          <div>
                            <div className="font-bold text-gray-700">{user.nome}</div>
                          </div>
                        </div>
                      </td>
                      
                      <td>
                        {user.perfil === 'COORDENADOR' ? (
                          <div className="badge badge-secondary badge-outline gap-1 font-bold">
                             <Shield size={12} /> Coordenador
                          </div>
                        ) : (
                          <div className="badge badge-primary badge-outline gap-1 font-bold">
                             <Briefcase size={12} /> Professor
                          </div>
                        )}
                      </td>

                      <td>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail size={14} /> {user.email}
                        </div>
                      </td>

                      <td>
                        {user.perfil === 'PROFESSOR' ? (
                           <span className="text-sm font-medium">
                             {user._count?.turmasLecionadas || 0} Turmas Ativas
                           </span>
                        ) : (
                           <span className="text-xs text-gray-400">Administrativo</span>
                        )}
                      </td>

                      <td>
                        <button className="btn btn-square btn-ghost btn-sm">
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {equipeFiltrada.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-gray-400">
                        Nenhum membro encontrado.
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