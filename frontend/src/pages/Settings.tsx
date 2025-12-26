import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Moon, Sun, Bell, Globe, Shield, Smartphone, Monitor 
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function Settings() {
  const navigate = useNavigate();
  
  // Estados para as configurações (Lendo do localStorage ou usando padrão)
  const [theme, setTheme] = useState(localStorage.getItem('geoTheme') || 'geoclass');
  const [pushEnabled, setPushEnabled] = useState(localStorage.getItem('geoPush') === 'true');
  const [emailEnabled, setEmailEnabled] = useState(localStorage.getItem('geoEmail') === 'true');
  const [language, setLanguage] = useState(localStorage.getItem('geoLang') || 'pt-BR');

  // Efeito para aplicar o tema assim que a tela abre ou muda
  useEffect(() => {
    // Aplica o tema na tag HTML
    document.documentElement.setAttribute('data-theme', theme);
    // Salva no navegador
    localStorage.setItem('geoTheme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    // Alterna entre o tema padrão (geoclass) e o modo escuro (dark)
    setTheme(prev => prev === 'geoclass' ? 'dark' : 'geoclass');
    toast.info(`Tema alterado para ${theme === 'geoclass' ? 'Escuro' : 'Claro'}`);
  };

  const handleSaveToggle = (key: string, value: boolean, setter: any, label: string) => {
    setter(value);
    localStorage.setItem(key, String(value));
    if (value) toast.success(`${label} ativadas!`);
    else toast.info(`${label} desativadas.`);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value;
    setLanguage(lang);
    localStorage.setItem('geoLang', lang);
    toast.success("Idioma alterado (Simulação)");
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="card w-full max-w-2xl bg-base-100 shadow-xl overflow-hidden">
        
        {/* Cabeçalho */}
        <div className="bg-gradient-to-r from-primary to-[#0077b6] p-6 text-primary-content flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="btn btn-circle btn-ghost text-white hover:bg-white/20">
            <ArrowLeft />
          </button>
          <div>
            <h2 className="text-2xl font-bold">Configurações</h2>
            <p className="text-xs opacity-80">Personalize sua experiência no GeoClass</p>
          </div>
        </div>

        <div className="card-body gap-6">

          {/* 1. APARÊNCIA */}
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2 text-primary mb-3">
              <Monitor size={20} /> Aparência
            </h3>
            <div className="bg-base-200 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {theme === 'geoclass' ? <Sun className="text-warning" /> : <Moon className="text-primary" />}
                <div>
                  <p className="font-bold">Modo Escuro</p>
                  <p className="text-xs text-gray-500">Altere entre visual claro e noturno</p>
                </div>
              </div>
              <input 
                type="checkbox" 
                className="toggle toggle-primary" 
                checked={theme === 'dark'}
                onChange={handleToggleTheme}
              />
            </div>
          </div>

          {/* 2. NOTIFICAÇÕES */}
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2 text-primary mb-3">
              <Bell size={20} /> Notificações
            </h3>
            <div className="flex flex-col gap-2">
              <div className="form-control">
                <label className="label cursor-pointer justify-start gap-4">
                  <input 
                    type="checkbox" 
                    className="checkbox checkbox-primary" 
                    checked={pushEnabled}
                    onChange={(e) => handleSaveToggle('geoPush', e.target.checked, setPushEnabled, 'Notificações Push')}
                  />
                  <span className="label-text font-medium">Receber alertas de presença (Push)</span>
                </label>
              </div>
              <div className="form-control">
                <label className="label cursor-pointer justify-start gap-4">
                  <input 
                    type="checkbox" 
                    className="checkbox checkbox-primary" 
                    checked={emailEnabled}
                    onChange={(e) => handleSaveToggle('geoEmail', e.target.checked, setEmailEnabled, 'Emails')}
                  />
                  <span className="label-text font-medium">Receber resumo semanal por e-mail</span>
                </label>
              </div>
            </div>
          </div>

          {/* 3. SISTEMA E IDIOMA */}
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2 text-primary mb-3">
              <Globe size={20} /> Região
            </h3>
            <select 
              className="select select-bordered w-full max-w-xs" 
              value={language}
              onChange={handleLanguageChange}
            >
              <option value="pt-BR">🇧🇷 Português (Brasil)</option>
              <option value="en-US">🇺🇸 English (US)</option>
              <option value="es-ES">🇪🇸 Español</option>
            </select>
          </div>

          <div className="divider"></div>

          {/* 4. RODAPÉ / VERSÃO */}
          <div className="text-center text-gray-400 text-xs flex flex-col items-center gap-2">
            <Shield size={16} />
            <p>GeoClass Versão 1.0.2 (Beta)</p>
            <p>Desenvolvido para FATEC Indaiatuba</p>
          </div>

        </div>
      </div>
    </div>
  );
}