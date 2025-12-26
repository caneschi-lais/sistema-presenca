import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, AlertTriangle, BookOpen, LogOut, Clock, Smartphone } from 'lucide-react'; // Add Smartphone icon
import { toast } from 'react-toastify';
// 1. Importar a biblioteca de segurança
import FingerprintJS from '@fingerprintjs/fingerprintjs';

export default function StudentHome() {
  const user = JSON.parse(localStorage.getItem('geoClassUser') || '{}');
  const navigate = useNavigate();
  
  const [materias, setMaterias] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  // 2. Estado para guardar a digital do celular
  const [deviceId, setDeviceId] = useState('');

  useEffect(() => {
    if (!user.id) return;
    
    // Carrega Dashboard
    fetch(`http://localhost:3000/aluno/${user.id}/dashboard`)
      .then(res => res.json())
      .then(data => setMaterias(data))
      .catch(err => console.error("Erro dashboard", err));

    // 3. Gera a Digital do Dispositivo (Fingerprint)
    const carregarSeguranca = async () => {
      const fp = await FingerprintJS.load();
      const { visitorId } = await fp.get();
      setDeviceId(visitorId);
      console.log("Device ID:", visitorId); // Para você ver no console
    };
    carregarSeguranca();

  }, [user.id]);

  const handleLogout = () => {
    localStorage.removeItem('geoClassUser');
    navigate('/'); 
  };

  const registrarPresenca = (turmaId: string) => {
    setLoading(true);
    const toastId = toast.loading("Validando dispositivo e local...");

    if (!navigator.geolocation) {
      toast.update(toastId, { render: "GPS desligado.", type: "error", isLoading: false, autoClose: 3000 });
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const response = await fetch('http://localhost:3000/registrar-presenca', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              alunoId: user.id,
              turmaId: turmaId,
              lat: pos.coords.latitude,
              long: pos.coords.longitude,
              deviceId: deviceId // 4. Envia o ID do celular
            })
          });
          
          const data = await response.json();

          if (response.ok) {
            toast.update(toastId, { 
              render: "Presença Registrada! 🎉", type: "success", isLoading: false, autoClose: 3000 
            });
            setTimeout(() => window.location.reload(), 2000);
          } else {
            // Tratamento de Erros Específicos
            if (data.fraude) {
              toast.update(toastId, { 
                render: "⛔ BLOQUEIO DE SEGURANÇA: Este aparelho já registrou presença para outro aluno.", 
                type: "error", isLoading: false, autoClose: 6000 
              });
            } else if (data.atraso) {
              toast.update(toastId, { 
                render: "Falta por Atraso (>15min).", type: "error", isLoading: false, autoClose: 5000 
              });
            } else {
              toast.update(toastId, { 
                render: data.error || "Erro.", type: "warning", isLoading: false, autoClose: 4000 
              });
            }
          }
        } catch (e) {
          toast.update(toastId, { render: "Erro de conexão.", type: "error", isLoading: false, autoClose: 3000 });
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        toast.update(toastId, { render: "Erro de Permissão GPS.", type: "error", isLoading: false, autoClose: 3000 });
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // ... O return (JSX) continua igual ao anterior ...
  // Apenas certifique-se de manter o return do passo anterior (StudentHome)
  return (
    <div className="min-h-screen bg-base-200 pb-10">
      {/* ... (Cabeçalho igual) ... */}
      <div className="navbar bg-base-100 shadow-md px-6">
        <div className="flex-1"><img src="/logo.png" className="h-10 mr-2" /></div>
        <div className="flex-none gap-2">
            <div className="text-right mr-2 hidden sm:block">
                <p className="font-bold text-sm">{user.nome}</p>
                <p className="text-xs text-gray-500">RA: {user.ra}</p>
            </div>
            <div className="avatar placeholder">
                <div className="bg-neutral text-neutral-content rounded-full w-10"><span>{user.nome?.charAt(0)}</span></div>
            </div>
            <button onClick={handleLogout} className="btn btn-ghost btn-circle text-error ml-2"><LogOut size={20} /></button>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><BookOpen /> Minhas Matérias</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materias.map((materia) => (
            <div key={materia.turmaId} className="card bg-base-100 shadow-xl border border-gray-100">
              <div className="card-body">
                <div className="flex justify-between items-start">
                    <h3 className="card-title text-primary">{materia.nome}</h3>
                    {deviceId && <div className="badge badge-success badge-outline badge-xs gap-1"><Smartphone size={10}/> Seguro</div>}
                </div>
                <div className="divider my-1"></div>
                {/* ... (Resto do card igual: alertas, progresso, botão) ... */}
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Presenças: <strong>{materia.presencas}</strong></span>
                  <span>Faltas: <strong>{materia.faltas}</strong></span>
                </div>
                <div className="w-full">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-bold">Frequência</span>
                    <span className={`text-xs font-bold ${materia.frequencia < 75 ? 'text-error' : 'text-success'}`}>{materia.frequencia}%</span>
                  </div>
                  <progress className={`progress w-full h-3 ${materia.frequencia < 75 ? 'progress-error' : 'progress-success'}`} value={materia.frequencia} max="100"></progress>
                </div>
                
                {/* Botão de Ação */}
                <div className="card-actions justify-end mt-4">
                    <button className="btn btn-primary w-full gap-2" onClick={() => registrarPresenca(materia.turmaId)} disabled={loading}>
                      <MapPin size={18} /> {loading ? 'Validando...' : 'Registrar Presença'}
                    </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}