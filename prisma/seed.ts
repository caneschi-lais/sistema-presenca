import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log("🧹 Limpando banco...")
  await prisma.attendanceLog.deleteMany({}) 
  await prisma.user.deleteMany({})
  await prisma.turma.deleteMany({})

  console.log("🌱 Criando usuários...")

  // 1. ALUNO
  const aluno = await prisma.user.create({
    data: { nome: 'Aluno Exemplo', email: 'aluno@fatec.sp.gov.br', senha: '123', perfil: 'ALUNO', ra: '123456' }
  })

  // 2. PROFESSOR
  const prof = await prisma.user.create({
    data: { nome: 'Prof. Michel', email: 'prof@fatec.sp.gov.br', senha: '123', perfil: 'PROFESSOR' }
  })

  // 3. COORDENADOR
  const coord = await prisma.user.create({
    data: { nome: 'Coord. Archimedes', email: 'coord@fatec.sp.gov.br', senha: '123', perfil: 'COORDENADOR' }
  })

  // --- LÓGICA PARA TESTE ---
  // Pega a hora AGORA e define o inicio da aula para 5 minutos atrás
  // Assim você consegue testar a presença com sucesso.
  const agora = new Date();
  const horaInicio = `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes() - 5).padStart(2, '0')}`;
  const diaHoje = agora.getDay(); 

  // 4. TURMA CONFIGURADA PARA HOJE
  const turma = await prisma.turma.create({
    data: {
      nome: 'Laboratório de Hardware',
      latitude: -23.096923, // <--- CONFIRA SE ESTÁ CERTO
      longitude: -47.259202, // <--- CONFIRA SE ESTÁ CERTO
      raioMetros: 100, // Aumentei um pouco para facilitar o teste
      totalAulas: 40,
      diaSemana: diaHoje,    // Define aula para HOJE
      horarioInicio: horaInicio, // Define aula começando 5 min atrás
      alunos: { connect: { id: aluno.id } },
      professor: { connect: { id: prof.id } }
    }
  })

  console.log(`✅ Aula criada para hoje (Dia ${diaHoje}) às ${horaInicio}`)
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1) })