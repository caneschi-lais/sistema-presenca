import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { LogOut, User, Settings as SettingsIcon } from 'lucide-react';

export default function Layout() {
  const navigate = useNavigate();
  const userString = localStorage.getItem('geoClassUser');
  const user = userString ? JSON.parse(userString) : null;

  useEffect(() => {
    // Se não houver usuário logado, expulsa para o login
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  if (!user) return null;

  return (
    // Fundo principal branco
    <div className="min-h-screen bg-gray-50">

      {/* NAVBAR FIXA: Usando o padrão DaisyUI para alinhar sem encavalar */}
      <div className="navbar bg-[#0077b6] text-white shadow-lg px-4 sm:px-8 relative z-50">

        {/* ESQUERDA: Saudação e Info */}
        <div className="navbar-start flex-col items-start justify-center w-full sm:w-1/3">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm md:text-base whitespace-nowrap">
              Olá, {user.nome?.split(' ')[0]}
            </span>

            {/* Badges de Gestão/Docente (Ajustei o padding para não esticar a barra) */}
            {user.perfil === 'PROFESSOR' && (
              <span className="badge bg-[#06d6a0] text-white border-none text-xs font-bold py-3 shadow-sm">Docente</span>
            )}
            {user.perfil === 'COORDENADOR' && (
              <span className="badge bg-[#06d6a0] text-white border-none text-xs font-bold py-3 shadow-sm">Gestão</span>
            )}
          </div>

          {/* RA abaixo do nome se for aluno */}
          {user.perfil === 'ALUNO' && (
            <span className="text-xs text-blue-200 mt-0.5 font-mono">RA: {user.ra}</span>
          )}
        </div>

        {/* CENTRO: Logo (Escondida em telas de celular para não faltar espaço) */}
        <div className="navbar-center hidden md:flex items-center justify-center gap-2 pointer-events-none w-1/3">
          <img src="/logo.png" className="h-7 sm:h-9 w-auto" alt="GeoClass Logo" />
          <h1 className="text-lg sm:text-xl font-bold tracking-tight">GeoClass</h1>
        </div>

        {/* DIREITA: Perfil e Botão Sair */}
        <div className="navbar-end flex justify-end items-center gap-1 sm:gap-4 w-full sm:w-1/3">

          {/* Dropdown da Foto do Perfil */}
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar hover:ring-2 hover:ring-[#06d6a0] transition-all">
              <div className="w-10 rounded-full ring ring-white/30 ring-offset-[#0077b6] ring-offset-2">
                <div className="bg-white/20 text-white w-full h-full flex items-center justify-center font-bold text-lg">
                  {user.nome?.charAt(0)}
                </div>
              </div>
            </div>
            <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow-xl menu menu-sm dropdown-content bg-base-100 rounded-box w-52 text-base-content font-medium">
              <li><a onClick={() => navigate('/perfil')}><User size={16} /> Meu Perfil</a></li>
              <li><a onClick={() => navigate('/configuracoes')}><SettingsIcon size={16} /> Configurações</a></li>
            </ul>
          </div>

          {/* Botão de Sair Fixo ao Lado */}
          <button onClick={handleLogout} title="Sair" className="btn btn-ghost btn-circle text-white hover:bg-red-500/80 ml-2">
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* AQUI É ONDE AS PÁGINAS VÃO APARECER */}
      <main className="pb-10 pt-6">
        <Outlet />
      </main>

    </div>
  );
}