// teste-api.ts
async function testar() {
  const response = await fetch('http://localhost:3000/registrar-presenca', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      // 1. COLE AQUI O ID DO ALUNO QUE VOCÊ GEROU
      alunoId: "978fd9fa-06ab-4874-b2ef-9c4edc007c5d",
      
      // 2. COLE AQUI O ID DA TURMA QUE VOCÊ GEROU
      turmaId: "3b79616e-88bc-4ab3-b521-897e820f9547",

      // 3. SUAS COORDENADAS REAIS (As mesmas que você colocou no seed)
      // Se você mudar um pouco esses números, verá o erro de "Fora do raio"
      lat: -23.096923, 
      long: -47.259202 
    })
  });

  const data = await response.json();
  console.log("Resposta do Servidor:", data);
}

testar();