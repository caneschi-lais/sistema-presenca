import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log("🧹 Limpando banco de dados antigo...")
  
  // 1. Limpar dados na ordem correta (para não dar erro de vínculo/Foreign Key)
  await prisma.attendanceLog.deleteMany({}) 
  await prisma.user.deleteMany({})
  await prisma.turma.deleteMany({})

  console.log("🌱 Criando novos usuários...")

  // 2. ALUNO
  const aluno = await prisma.user.create({
    data: {
      nome: 'Aluno Exemplo',
      email: 'aluno@fatec.sp.gov.br',
      senha: '123',
      perfil: 'ALUNO',
      ra: '123456'
    }
  })

  // 3. PROFESSOR
  const prof = await prisma.user.create({
    data: {
      nome: 'Prof. Michel',
      email: 'prof@fatec.sp.gov.br',
      senha: '123',
      perfil: 'PROFESSOR'
    }
  })

  // 4. COORDENADOR
  const coord = await prisma.user.create({
    data: {
      nome: 'Coord. Archimedes',
      email: 'coord@fatec.sp.gov.br',
      senha: '123',
      perfil: 'COORDENADOR'
    }
  })

  // 4. TURMA (Com matrícula do aluno)
  const turma = await prisma.turma.create({
    data: {
      nome: 'Laboratório de Hardware',
      latitude: -23.096923, // <--- SUAS COORDENADAS
      longitude: -47.259202, // <--- SUAS COORDENADAS
      raioMetros: 50,
      totalAulas: 40,
      alunos: { connect: { id: aluno.id } }, // Matricula o aluno
      professor: { connect: { id: prof.id } } // <--- VINCULA O PROFESSOR
    }
  })
  
  // Vamos criar umas presenças falsas para testar o gráfico
  await prisma.attendanceLog.create({
    data: {
        userId: aluno.id,
        turmaId: turma.id,
        latitude: -23.00, longitude: -47.00,
        statusSiga: 'SINCRONIZADO',
        dataExclusao: new Date()
    }
  })

  console.log(`✅ Dados atualizados com Matrícula!`)
  console.log(`✅ Dados recriados com sucesso!`)
  console.log(`👨‍🎓 Aluno ID: ${aluno.id}`)
  console.log(`🏫 Turma ID: ${turma.id}`)
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1) })