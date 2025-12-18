// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 1. Limpar banco antigo (opcional, para evitar duplicidade em testes)
  // await prisma.attendanceLog.deleteMany({})
  // await prisma.turma.deleteMany({})
  // await prisma.user.deleteMany({})

  console.log("🌱 Iniciando o plantio de dados (Seed)...")

  // 2. Criar um Aluno para você usar no login
  const aluno = await prisma.user.create({
    data: {
      nome: 'Aluno Teste',
      email: 'aluno@fatec.sp.gov.br',
      senha: '123', // Em produção usaríamos hash, mas para teste ok
      perfil: 'ALUNO',
      ra: '123456' // Guarde este RA
    }
  })

  // 3. Criar a Turma usando as coordenadas DA SUA CASA
  // (Senão o teste vai falhar dizendo que você está longe)
  const turma = await prisma.turma.create({
    data: {
      nome: 'Laboratório de Hardware (Teste)',
      // COLOQUE SUAS COORDENADAS AQUI:
      latitude: -23.096923477335636,  
      longitude: -47.2592022465833, 
      raioMetros: 50 // 50 metros de margem de erro
    }
  })

  console.log(`✅ Dados criados!`)
  console.log(`🆔 ID do Aluno: ${aluno.id}`)
  console.log(`🆔 ID da Turma: ${turma.id}`)
  console.log(`📍 Use esses IDs no seu Front-end/Postman para testar.`)
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => { 
    console.error(e)
    await prisma.$disconnect()
    process.exit(1) 
  })