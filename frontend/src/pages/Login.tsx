import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import { LogIn } from 'lucide-react'; // Ícone removido para ficar igual à referência

export default function Login() {
  // --- MANTENDO A MESMA LÓGICA EXISTENTE ---
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    try {
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('geoClassUser', JSON.stringify(data));
        if (data.perfil === 'ALUNO') navigate('/aluno');
        else if (data.perfil === 'PROFESSOR') navigate('/professor');
        else if (data.perfil === 'COORDENADOR') navigate('/coordenador');
      } else {
        setErro(data.error || 'Erro ao entrar');
      }
    } catch (error) {
      setErro('Erro de conexão com o servidor');
    }
  };
  // --- FIM DA LÓGICA EXISTENTE ---


  // --- NOVO VISUAL ---
  return (
    // Container principal que ocupa toda a tela (flex row)
    <div className="min-h-screen flex bg-base-100">
      
      {/* LADO ESQUERDO - Imagem (Escondido em celulares 'hidden md:flex') */}
      <div className="w-1/2 hidden md:flex relative">
        <img src="/login.jpeg" className="bg-cover bg-center relative" alt="Login" />
         {/* Uma camada escura por cima da imagem para dar um toque profissional */}
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
      </div>

      {/* LADO DIREITO - Formulário */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md">
          
          {/* LOGO */}
          <img src="/logo.png" alt="GeoClass" className="h-32 mb-8 mx-auto" />

          {/* Títulos */}
          <h2 className="text-3xl font-bold mb-2 text-base-content">Bem-vindo de volta!</h2>
          <p className="text-gray-500 mb-8">Por favor, insira suas credenciais para entrar.</p>
          
          {/* Formulário */}
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            
            {/* Campo Email */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium text-base-content">Email</span>
              </label>
              <input 
                type="email" 
                placeholder="Ex: aluno@fatec.sp.gov.br" 
                className="input input-bordered w-full focus:input-primary" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Campo Senha */}
            <div className="form-control w-full">
              <label className="label flex justify-between items-center">
                <span className="label-text font-medium text-base-content">Senha</span>
                {/* Link visual de "Esqueceu a senha" (sem funcionalidade por enquanto) */}
                <a href="#" className="label-text-alt link link-primary link-hover font-medium">
                  Esqueceu a senha?
                </a>
              </label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="input input-bordered w-full focus:input-primary" 
                value={senha}
                onChange={e => setSenha(e.target.value)}
                required
              />
            </div>
            
            {/* Mensagem de Erro */}
            {erro && <div className="alert alert-error text-sm py-2">{erro}</div>}

            {/* Botão de Entrar */}
            <button type="submit" className="btn btn-primary w-full normal-case text-lg font-bold mt-2">
              Entrar
            </button>

            {/* Link de Cadastro */}
            <p className="text-center text-sm text-gray-500 mt-4">
              Não tem uma conta? <a href="#" className="link link-primary link-hover font-bold">Cadastre-se</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}