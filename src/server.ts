// src/server.ts
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { PrismaClient } from '@prisma/client';
import { getDistanceFromLatLonInMeters } from './utils/geo';
import cron from 'node-cron';
import { addMonths } from 'date-fns';

const app = Fastify({ logger: true });
const prisma = new PrismaClient();

// Permite que o Frontend (React) acesse este servidor
app.register(cors, { 
  origin: true // Em produção, mude para o domínio do seu site
});

// Rota de Login Simples
app.post('/login', async (req: any, reply) => {
  const { email, senha } = req.body;

  const user = await prisma.user.findUnique({
    where: { email }
  });

  // Validação simples (em produção usaríamos bcrypt para hash de senha)
  if (!user || user.senha !== senha) {
    return reply.status(401).send({ error: 'Email ou senha inválidos' });
  }

  // Retorna os dados do usuário para o frontend salvar
  return {
    id: user.id,
    nome: user.nome,
    perfil: user.perfil,
    ra: user.ra
  };
});

// Rota POST: O app manda JSON com { alunoId, turmaId, lat, long }
app.post('/registrar-presenca', async (req: any, reply) => {
  try {
    const { alunoId, turmaId, lat, long } = req.body;

    console.log(`📡 Recebendo solicitação... Lat: ${lat}, Long: ${long}`);

    // 1. Buscar a Turma no banco para saber onde ela fica
    const turma = await prisma.turma.findUnique({ where: { id: turmaId } });
    
    if (!turma) {
      return reply.status(404).send({ error: 'Turma não encontrada' });
    }

    // 2. Calcular distância
    const distancia = getDistanceFromLatLonInMeters(lat, long, turma.latitude, turma.longitude);
    console.log(`📏 Distância calculada: ${distancia.toFixed(2)} metros. Limite: ${turma.raioMetros}m`);
    
    // 3. Validar se está dentro da cerca
    if (distancia > turma.raioMetros) {
      return reply.status(400).send({ 
        error: 'Fora do raio permitido', 
        distancia: `${distancia.toFixed(2)}m`, 
        limite: `${turma.raioMetros}m`,
        mensagem: 'Você está muito longe da sala de aula.'
      });
    }

    // 4. Salvar Presença (Com regra de LGPD: expira em 6 meses)
    const log = await prisma.attendanceLog.create({
      data: {
        userId: alunoId,
        turmaId: turmaId,
        latitude: lat,
        longitude: long,
        statusSiga: 'PENDENTE', // Vai para a fila do Robô
        dataExclusao: addMonths(new Date(), 6) // Daqui a 6 meses será deletado
      }
    });

    console.log(`✅ Presença salva! ID: ${log.id}`);
    return { success: true, logId: log.id, message: 'Presença registrada para processamento.' };

  } catch (error) {
    console.error(error);
    return reply.status(500).send({ error: 'Erro interno no servidor' });
  }
});

// CRON JOB: O "Faxineiro" da LGPD (Roda todo dia às 03:00 AM)
cron.schedule('0 3 * * *', async () => {
  console.log('💀 Faxineiro LGPD iniciado...');
  const deleted = await prisma.attendanceLog.deleteMany({
    where: {
      dataExclusao: { lte: new Date() } // Data de exclusão <= Agora
    }
  });
  if (deleted.count > 0) {
    console.log(`💀 LGPD: ${deleted.count} registros antigos foram apagados.`);
  }
});

// Rota Dashboard do Aluno
app.get('/aluno/:id/dashboard', async (req: any, reply) => {
  const { id } = req.params;

  // Busca o aluno e suas turmas
  const aluno = await prisma.user.findUnique({
    where: { id },
    include: {
      turmas: {
        include: {
          // Para cada turma, traga os logs DESTE aluno
          logs: {
            where: { userId: id }
          }
        }
      }
    }
  });

  if (!aluno) return reply.status(404).send({ error: 'Aluno não encontrado' });

  // Formata os dados para o Front-end
  const dashboardData = aluno.turmas.map(turma => {
    const presencas = turma.logs.length;
    const total = turma.totalAulas;
    const frequencia = Math.round((presencas / total) * 100);
    const faltas = total - presencas;

    return {
      turmaId: turma.id,
      nome: turma.nome,
      presencas,
      faltas,
      totalAulas: total,
      frequencia, // Ex: 75
      status: frequencia >= 75 ? 'aprovado' : 'reprovado'
    };
  });

  return dashboardData;
});

// Rota: Turmas do Professor
app.get('/professor/:id/turmas', async (req: any, reply) => {
  const { id } = req.params;
  const turmas = await prisma.turma.findMany({
    where: { professorId: id },
    include: { _count: { select: { alunos: true } } } // Conta quantos alunos tem
  });
  return turmas;
});

// Rota: Relatório de Presenças da Turma (Quem veio hoje?)
app.get('/turma/:id/presencas', async (req: any, reply) => {
  const { id } = req.params;
  
  // Pega logs das últimas 24h
  const ontem = new Date();
  ontem.setHours(0,0,0,0);

  const logs = await prisma.attendanceLog.findMany({
    where: { 
      turmaId: id,
      dataHora: { gte: ontem } 
    },
    include: { user: true }, // Traz o nome do aluno
    orderBy: { dataHora: 'desc' }
  });

  return logs.map(log => ({
    logId: log.id,
    aluno: log.user.nome,
    ra: log.user.ra,
    horario: log.dataHora,
    status: log.statusSiga
  }));
});

// --- ROTAS DO COORDENADOR ---

// 1. Dashboard & Análise de Evasão
app.get('/coordenador/dashboard', async (req, reply) => {
  // Totais Gerais
  const totalAlunos = await prisma.user.count({ where: { perfil: 'ALUNO' } });
  const totalTurmas = await prisma.turma.count();

  // Análise de Risco (Quem está com < 75% de frequência)
  // Trazemos os alunos e suas turmas para calcular na hora
  const alunos = await prisma.user.findMany({
    where: { perfil: 'ALUNO' },
    include: {
      turmas: {
        include: { logs: true }
      }
    }
  });

  const listaRisco: any[] = [];

  alunos.forEach(aluno => {
    aluno.turmas.forEach(turma => {
      // Filtra logs apenas deste aluno nesta turma
      const presencas = turma.logs.filter(l => l.userId === aluno.id).length;
      const frequencia = (presencas / turma.totalAulas) * 100;

      if (frequencia < 75) {
        listaRisco.push({
          id: aluno.id,
          nome: aluno.nome,
          ra: aluno.ra,
          turma: turma.nome,
          frequencia: Math.round(frequencia),
          faltas: turma.totalAulas - presencas
        });
      }
    });
  });

  return {
    totalAlunos,
    totalTurmas,
    alunosEmRisco: listaRisco.length,
    detalhesRisco: listaRisco
  };
});

// 2. Lista simples de professores (Para o formulário de criar turma)
app.get('/lista-professores', async () => {
  return await prisma.user.findMany({
    where: { perfil: 'PROFESSOR' },
    select: { id: true, nome: true }
  });
});

// 3. Cadastrar Nova Turma (Importante para definir o Geofence)
app.post('/turmas', async (req: any, reply) => {
  const { nome, professorId, lat, long, totalAulas } = req.body;
  
  try {
    const novaTurma = await prisma.turma.create({
      data: {
        nome,
        professorId, // Vincula ao professor
        latitude: parseFloat(lat),
        longitude: parseFloat(long),
        totalAulas: parseInt(totalAulas),
        raioMetros: 50 // Padrão fixo por enquanto
      }
    });
    return novaTurma;
  } catch (e) {
    console.error(e);
    return reply.status(500).send({ error: "Erro ao criar turma" });
  }
});

// Iniciar o servidor
const start = async () => {
  try {
    await app.listen({ port: 3000, host: '0.0.0.0' }); 
    console.log('🚀 Servidor rodando na porta 3000');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};
start();