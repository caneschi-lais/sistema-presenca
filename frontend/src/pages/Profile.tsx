import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Save, ArrowLeft, FileBadge, KeyRound } from 'lucide-react';
import { toast } from 'react-toastify';

export default function Profile() {
  const userInicial = JSON.parse(localStorage.getItem('geoClassUser') || '{}');
  const [formData, setFormData] = useState({
    nome: userInicial.nome || '',
    email: userInicial.email || '',
    senha: userInicial.senha || '',
    ra: userInicial.ra || '',
    perfil: userInicial.perfil || 'Usuário'
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("Salvando alterações...");

    try {
      const res = await fetch(`http://localhost:3000/usuarios/${userInicial.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: formData.nome,
          email: formData.email,
          senha: formData.senha
        })
      });

      const data = await res.json();

      if (res.ok) {
        const novoUser = { ...userInicial, ...data };
        localStorage.setItem('geoClassUser', JSON.stringify(novoUser));
        toast.update(toastId, { render: "Perfil atualizado com sucesso! 💾", type: "success", isLoading: false, autoClose: 2000 });
      } else {
        toast.update(toastId, { render: "Erro ao atualizar.", type: "error", isLoading: false, autoClose: 3000 });
      }
    } catch (error) {
      toast.update(toastId, { render: "Erro de conexão.", type: "error", isLoading: false, autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

  // Função para pegar as iniciais do nome
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4 py-10">
      
      <div className="card w-full max-w-3xl bg-base-100 shadow-2xl overflow-hidden rounded-2xl">
        {/* Cabeçalho com Gradiente */}
        <div className="bg-gradient-to-r from-primary to-[#0088cc] p-8 text-primary-content relative">
          <button 
            onClick={() => navigate(-1)} 
            className="btn btn-circle btn-ghost btn-sm text-white hover:bg-white/20 absolute top-6 left-6"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="mt-4">
            <h2 className="text-3xl font-bold tracking-tight">Editar Perfil</h2>
            <p className="opacity-90 text-sm mt-1">Mantenha seus dados pessoais atualizados.</p>
          </div>
        </div>

        <div className="card-body p-8 pt-0 relative">
          {/* Avatar Centralizado (Corrigido) */}
          <div className="flex justify-center -mt-16 mb-8 relative z-10">
            <div className="avatar placeholder ring ring-white ring-offset-4 ring-offset-base-100 rounded-full shadow-lg">
              <div className="bg-primary text-primary-content w-32 h-32 rounded-full flex items-center justify-center">
                <span className="text-5xl font-bold tracking-wider">{getInitials(formData.nome)}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSalvar} className="flex flex-col gap-6">
            
            {/* Seção: Informações Pessoais */}
            <div>
              <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2 border-b pb-2">
                <User className="text-primary" size={20} /> Informações Pessoais
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-control">
                  <label className="label font-medium text-gray-600">Nome Completo</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      className="input input-bordered w-full pl-10 focus:input-primary transition-all"
                      value={formData.nome}
                      onChange={e => setFormData({...formData, nome: e.target.value})}
                    />
                    <User className="absolute left-3 top-3 text-gray-400" size={18} />
                  </div>
                </div>
                <div className="form-control">
                  <label className="label font-medium text-gray-600">Email</label>
                  <div className="relative">
                    <input 
                      type="email" 
                      className="input input-bordered w-full pl-10 focus:input-primary transition-all"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                    <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                  </div>
                </div>
              </div>
            </div>

            {/* Seção: Dados Acadêmicos/Função (Desabilitados) */}
            <div>
              <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2 border-b pb-2 mt-4">
                <FileBadge className="text-secondary" size={20} /> Dados da Instituição
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-control">
                  <label className="label font-medium text-gray-600">Função / Cargo</label>
                  <input 
                    type="text" 
                    className="input input-bordered bg-gray-100 text-gray-500 font-medium cursor-not-allowed" 
                    value={formData.perfil.charAt(0).toUpperCase() + formData.perfil.slice(1).toLowerCase()}
                    disabled
                  />
                </div>
                {formData.ra && (
                  <div className="form-control">
                    <label className="label font-medium text-gray-600">RA (Registro Acadêmico)</label>
                    <input 
                      type="text" 
                      className="input input-bordered bg-gray-100 text-gray-500 font-medium font-mono cursor-not-allowed" 
                      value={formData.ra}
                      disabled
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Seção: Segurança */}
            <div>
              <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2 border-b pb-2 mt-4">
                <Lock className="text-accent" size={20} /> Segurança
              </h3>
              <div className="form-control">
                <label className="label font-medium text-gray-600">Alterar Senha</label>
                <div className="relative">
                  <input 
                    type="password" // Agora é password para esconder
                    className="input input-bordered w-full pl-10 focus:input-primary transition-all font-mono tracking-widest"
                    value={formData.senha}
                    onChange={e => setFormData({...formData, senha: e.target.value})}
                    placeholder="••••••"
                  />
                  <KeyRound className="absolute left-3 top-3 text-gray-400" size={18} />
                </div>
                <label className="label">
                  <span className="label-text-alt text-gray-400">Digite uma nova senha para alterar a atual.</span>
                </label>
              </div>
            </div>

            {/* Botão de Salvar */}
            <div className="card-actions justify-end mt-8">
              <button 
                type="submit" 
                className="btn btn-primary btn-wide text-lg normal-case gap-3 shadow-md hover:shadow-xl transition-all"
                disabled={loading}
              >
                {loading ? <span className="loading loading-spinner"></span> : <Save size={20} />}
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}