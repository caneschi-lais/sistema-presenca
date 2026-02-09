import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Search, GraduationCap, ChevronLeft, ChevronRight, MoreVertical, Mail, FileBadge 
} from 'lucide-react';

export default function StudentList() {
  const navigate = useNavigate();
  
  // Estados
  const [alunos, setAlunos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados de Controle
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [busca, setBusca] = useState('');
  const [totalAlunos, setTotalAlunos] = useState(0);

  // Debounce para não buscar a cada letra digitada (opcional, mas bom)
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      carregarAlunos();
    }, 500); // Espera 0.5s após parar de digitar
    return () => clearTimeout(delayDebounce);
  }, [busca, page]);

  const carregarAlunos = () => {
    setLoading(true);
    // Chama a API passando a página e a busca
    fetch(`http://localhost:3000/alunos?page=${page}&limit=10&search=${busca}`)
      .then(res => res.json())
      .then(data => {
        setAlunos(data.data);
        setTotalPages(data.totalPages);
        setTotalAlunos(data.total);
        setLoading(false);
      });
  };

  const mudarPagina = (novaPagina: number) => {
    if (novaPagina >= 1 && novaPagina <= totalPages) {
      setPage(novaPagina);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Navbar Simples */}
      <div className="bg-white shadow-sm px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="btn btn-circle btn-ghost btn-sm">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-gray-700 flex items-center gap-2">
          <GraduationCap className="text-primary" /> Corpo Discente (Alunos)
        </h1>
      </div>

      <div className="container mx-auto px-4 mt-8">
        
        {/* Barra de Busca */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full md:w-96">
            <input 
              type="text" 
              placeholder="Buscar por nome ou RA..." 
              className="input input-bordered w-full pl-10 focus:input-primary transition-all"
              value={busca}
              onChange={e => {
                setBusca(e.target.value);
                setPage(1); // Volta pra pág 1 ao filtrar
              }}
            />
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          </div>
          <div className="badge badge-lg badge-ghost font-bold">
            Total: {totalAlunos} Alunos
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20"><span className="loading loading-spinner loading-lg text-primary"></span></div>
        ) : (
          <div className="card bg-white shadow-xl overflow-hidden border border-gray-100 flex flex-col min-h-[500px]">
            
            {/* Tabela */}
            <div className="overflow-x-auto flex-grow">
              <table className="table table-zebra w-full">
                <thead className="bg-gray-50 text-gray-600 font-bold uppercase text-xs">
                  <tr>
                    <th>Aluno</th>
                    <th>RA</th>
                    <th>Contato</th>
                    <th>Matrículas</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {alunos.map((aluno) => (
                    <tr key={aluno.id} className="hover">
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="avatar placeholder">
                            <div className="bg-primary text-primary-content rounded-full w-10 h-10 flex items-center justify-center font-bold">
                              {aluno.nome.charAt(0)}
                            </div>
                          </div>
                          <div className="font-bold text-gray-700">{aluno.nome}</div>
                        </div>
                      </td>
                      <td className="font-mono font-medium text-gray-600">{aluno.ra}</td>
                      <td>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Mail size={14}/> {aluno.email}
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-ghost badge-sm gap-1">
                          <FileBadge size={12}/> {aluno._count.turmas} Disciplinas
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-square btn-ghost btn-sm">
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {alunos.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-20 text-gray-400">
                        Nenhum aluno encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Rodapé de Paginação */}
            <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-between items-center">
              <span className="text-xs text-gray-500">
                Página <strong>{page}</strong> de <strong>{totalPages}</strong>
              </span>
              <div className="join">
                <button 
                  className="join-item btn btn-sm" 
                  onClick={() => mudarPagina(page - 1)}
                  disabled={page === 1}
                >
                  <ChevronLeft size={16} /> Anterior
                </button>
                <button className="join-item btn btn-sm btn-active pointer-events-none">
                  {page}
                </button>
                <button 
                  className="join-item btn btn-sm" 
                  onClick={() => mudarPagina(page + 1)}
                  disabled={page === totalPages}
                >
                  Próximo <ChevronRight size={16} />
                </button>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}