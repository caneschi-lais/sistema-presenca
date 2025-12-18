import { useState } from 'react';

function App() {
  const [status, setStatus] = useState('Aguardando...');
  const [loading, setLoading] = useState(false);

  // Simulação de IDs (No sistema real, viriam do Login)
  const ALUNO_ID_TESTE = "id-do-aluno-criado-no-banco";
  const TURMA_ID_TESTE = "id-da-turma-criada-no-banco";

  const registrarPresenca = () => {
    setLoading(true);
    setStatus("Obtendo localização...");

    if (!navigator.geolocation) {
      setStatus("Geolocalização não suportada no seu navegador.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setStatus(`Localização obtida! Enviando... (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);

        try {
          // Substitua localhost pela URL do seu backend na nuvem depois
          const response = await fetch('http://localhost:3000/registrar-presenca', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              alunoId: ALUNO_ID_TESTE,
              turmaId: TURMA_ID_TESTE,
              lat: latitude,
              long: longitude
            })
          });

          const data = await response.json();

          if (response.ok) {
            setStatus("✅ Presença Registrada com Sucesso!");
          } else {
            setStatus(`❌ Erro: ${data.error} (Distância: ${data.distancia})`);
          }
        } catch (error) {
          setStatus("❌ Erro de conexão com o servidor.");
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        setStatus("Erro ao obter GPS: " + error.message);
        setLoading(false);
      },
      { enableHighAccuracy: true } // Importante para geofencing preciso
    );
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-base-200 p-4">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body items-center text-center">
          <h2 className="card-title">Registro de Presença</h2>
          <p>Disciplina: Desenvolvimento Web</p>
          
          <div className="my-4">
            <p className="text-sm font-bold text-gray-500">Status:</p>
            <p className="text-lg">{status}</p>
          </div>

          <div className="card-actions">
            <button 
              className={`btn btn-primary btn-wide ${loading ? 'loading' : ''}`}
              onClick={registrarPresenca}
              disabled={loading}
            >
              {loading ? 'Processando...' : '📍 Registrar Presença'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;