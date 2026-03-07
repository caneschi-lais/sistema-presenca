// src/server.ts
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
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

// --- ROTA DE REGISTO (CRIAR NOVO UTILIZADOR) ---
app.post('/registro', async (req: any, reply) => {
  const { nome, email, senha, perfil, ra } = req.body;

  try {
    // 1. Verifica se o email ou RA já existem
    const userExists = await prisma.user.findFirst({
      where: { OR: [{ email }, { ra: ra || undefined }] }
    });

    if (userExists) {
      return reply.status(400).send({ error: 'Email ou RA já cadastrado' });
    }

    // 2. Encripta a senha antes de salvar no banco
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(senha, saltRounds);

    // 3. Salva no MongoDB
    const newUser = await prisma.user.create({
      data: {
        nome,
        email,
        senha: hashedPassword,
        perfil, // 'ALUNO', 'PROFESSOR', 'COORDENADOR'
        ra
      }
    });

    return reply.status(201).send({ 
      success: true, 
      message: 'Usuário criado com sucesso!',
      userId: newUser.id 
    });

  } catch (error) {
    console.error(error);
    return reply.status(500).send({ error: 'Erro ao criar usuário' });
  }
});

// --- ROTA DE LOGIN SEGURA COM JWT ---
app.post('/login', async (req: any, reply) => {
  const { email, senha } = req.body;

  try {
    // 1. Busca o usuário pelo email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    // 2. Se não existir ou a senha estiver errada
    if (!user) {
      return reply.status(401).send({ error: 'Email ou senha inválidos' });
    }

    // 3. Compara a senha digitada com a senha encriptada do banco
    const isPasswordValid = await bcrypt.compare(senha, user.senha);
    if (!isPasswordValid) {
      return reply.status(401).send({ error: 'Email ou senha inválidos' });
    }

    // 4. Gera o Token de Acesso (Crachá digital)
    const secret = process.env.JWT_SECRET || 'fallback_secret';
    const token = jwt.sign(
      { userId: user.id, perfil: user.perfil }, 
      secret, 
      { expiresIn: '7d' } // O aluno fica logado por 7 dias sem precisar pôr a senha de novo
    );

    // 5. Retorna os dados e o token para o frontend
    return {
      token, // O frontend vai salvar isto (ex: no localStorage)
      user: {
        id: user.id,
        nome: user.nome,
        perfil: user.perfil,
        ra: user.ra
      }
    };
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ error: 'Erro interno ao fazer login' });
  }
});

// Rota POST: O app manda JSON com { alunoId, turmaId, lat, long }
// Rota Inteligente: Valida Distância E Horário
app.post('/registrar-presenca', async (req: any, reply) => {
  try {
const { alunoId, turmaId, lat, long, deviceId } = req.body; // Recebendo deviceId

    // 1. Busca Turma ... (código existente)
    const turma = await prisma.turma.findUnique({ where: { id: turmaId } });
    if (!turma) return reply.status(404).send({ error: 'Turma não encontrada' });

    // --- NOVA VALIDAÇÃO DE HORÁRIO ---
    const agora = new Date();
    
    // A. Verifica o Dia da Semana
    if (agora.getDay() !== turma.diaSemana) {
      return reply.status(400).send({ error: 'Não há aula desta matéria hoje.' });
    }

    // B. Verifica o Horário (Janela de 15 minutos)
    const [horaAula, minAula] = turma.horarioInicio.split(':').map(Number);
    const dataInicioAula = new Date();
    dataInicioAula.setHours(horaAula, minAula, 0, 0);

    const diferencaMinutos = (agora.getTime() - dataInicioAula.getTime()) / 1000 / 60;

    // Se tentar antes da aula começar (ex: 10 min antes)
    if (diferencaMinutos < -10) {
      return reply.status(400).send({ error: 'A aula ainda não começou.' });
    }

    // A REGRA DE OURO: Se passou de 15 minutos
    if (diferencaMinutos > 15) {
      // Aqui poderíamos salvar como "FALTA" automaticamente, 
      // mas por enquanto vamos bloquear o registro.
      return reply.status(400).send({ 
        error: 'Você chegou atrasado (>15min). Presença não permitida.',
        atraso: true // Flag para o frontend saber que foi atraso
      });
    }
    // ----------------------------------

    if (deviceId) {
      // Define janela da aula (ex: últimas 2 horas)
      const janelaTempo = new Date();
      janelaTempo.setHours(janelaTempo.getHours() - 2);

      const usoSuspeito = await prisma.attendanceLog.findFirst({
        where: {
          turmaId: turmaId,        // Na mesma turma
          deviceId: deviceId,      // Com o mesmo celular
          userId: { not: alunoId }, // Mas usuário DIFERENTE
          dataHora: { gte: janelaTempo } // Recentemente
        }
      });

      if (usoSuspeito) {
        console.log(`🚨 FRAUDE DETECTADA! Device ${deviceId} tentou marcar para ${alunoId} mas já marcou para outro.`);
        return reply.status(403).send({ 
          error: 'Este dispositivo já registrou presença para outro aluno nesta aula.',
          fraude: true 
        });
      }
    }

    // 2. Validação de Distância (GeoFencing)
    const distancia = getDistanceFromLatLonInMeters(lat, long, turma.latitude, turma.longitude);
    
    if (distancia > turma.raioMetros) {
      return reply.status(400).send({ 
        error: 'Você está muito longe da sala de aula.',
        distancia: distancia.toFixed(2),
        limite: turma.raioMetros
      });
    }

    const log = await prisma.attendanceLog.create({
      data: {
        userId: alunoId,
        turmaId: turmaId,
        latitude: lat,
        longitude: long,
        deviceId: deviceId, // <--- SALVANDO O ID AQUI
        dataExclusao: new Date()
      }
    });

    return { success: true, logId: log.id, mensagem: 'Presença garantida!' };

  } catch (error) {
    console.error(error);
    return reply.status(500).send({ error: "Erro interno no servidor" });
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

// Rota: Histórico Completo do Aluno
app.get('/aluno/:id/historico', async (req: any, reply) => {
  const { id } = req.params;
  
  const logs = await prisma.attendanceLog.findMany({
    where: { userId: id },
    include: { 
      turma: {
        select: { nome: true } // Só precisamos do nome da matéria
      } 
    },
    orderBy: { dataHora: 'desc' } // Mais recentes primeiro
  });

  return logs.map(log => ({
    id: log.id,
    disciplina: log.turma.nome,
    data: log.dataHora,
    status: log.statusSiga,
    deviceId: log.deviceId // Para mostrar se foi seguro
  }));
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

// Rota: Listar TODAS as turmas (Para o Coordenador)
app.get('/turmas', async (req, reply) => {
  const turmas = await prisma.turma.findMany({
    include: {
      professor: {
        select: { nome: true } // Traz o nome do professor responsável
      },
      _count: {
        select: { alunos: true } // Traz quantos alunos estão matriculados
      }
    },
    orderBy: { nome: 'asc' }
  });
  return turmas;
});

// Rota: Listar Equipe (Professores e Coordenadores)
app.get('/equipe', async (req, reply) => {
  const users = await prisma.user.findMany({
    where: {
      perfil: { in: ['PROFESSOR', 'COORDENADOR'] }
    },
    select: {
      id: true,
      nome: true,
      email: true,
      perfil: true,
      _count: {
        select: { turmasLecionadas: true } // Conta quantas turmas ele dá aula
      }
    },
    orderBy: { nome: 'asc' }
  });
  return users;
});

// Rota: Listar Alunos com Paginação e Busca
app.get('/alunos', async (req: any, reply) => {
  const { page = 1, limit = 10, search = '' } = req.query;
  
  const p = Number(page);
  const l = Number(limit);
  const skip = (p - 1) * l;

  // Filtro dinâmico (Nome ou RA)
  const where = {
    perfil: 'ALUNO',
    OR: search ? [
      { nome: { contains: search } }, // No Postgres use mode: 'insensitive' se precisar
      { ra: { contains: search } }
    ] : undefined
  };

  // 1. Busca os alunos dessa página
  const alunos = await prisma.user.findMany({
    where,
    skip,
    take: l,
    select: {
      id: true, nome: true, email: true, ra: true,
      _count: { select: { turmas: true } } // Quantas matérias cursa
    },
    orderBy: { nome: 'asc' }
  });

  // 2. Conta o total (para saber quantas páginas existem)
  const total = await prisma.user.count({ where });

  return {
    data: alunos,
    total,
    page: p,
    totalPages: Math.ceil(total / l)
  };
});

// Rota: Listar Alunos de uma Turma Específica (Com Paginação)
app.get('/turma/:id/alunos', async (req: any, reply) => {
  const { id } = req.params;
  const { page = 1, limit = 10, search = '' } = req.query;
  
  const skip = (Number(page) - 1) * Number(limit);

  // Filtro: Alunos desta turma + Busca Opcional
  const where = {
    turmas: { some: { id } }, // A mágica do Prisma: "Alunos que têm esta turma"
    OR: search ? [
      { nome: { contains: search } }, // Adicione mode: 'insensitive' se estiver usando Postgres
      { ra: { contains: search } }
    ] : undefined
  };

  try {
    const alunos = await prisma.user.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { nome: 'asc' },
      select: { id: true, nome: true, ra: true, email: true }
    });

    const total = await prisma.user.count({ where });

    return { 
      data: alunos, 
      total, 
      page: Number(page), 
      totalPages: Math.ceil(total / Number(limit)) 
    };
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ error: "Erro ao buscar alunos da turma." });
  }
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
  // Agora recebemos diaSemana e horarioInicio
  const { nome, professorId, lat, long, totalAulas, diaSemana, horarioInicio } = req.body;
  
  try {
    const novaTurma = await prisma.turma.create({
      data: {
        nome,
        professorId,
        latitude: parseFloat(lat),
        longitude: parseFloat(long),
        totalAulas: parseInt(totalAulas),
        raioMetros: 50,
        // Novos campos obrigatórios
        diaSemana: parseInt(diaSemana), 
        horarioInicio: horarioInicio 
      }
    });
    return novaTurma;
  } catch (e) {
    console.error(e);
    return reply.status(500).send({ error: "Erro ao criar turma" });
  }
});

// --- ROTA DE INTELIGÊNCIA DE DADOS ---
app.get('/coordenador/analytics', async (req, reply) => {
  // 1. Frequência por Dia da Semana (0=Dom, 1=Seg...)
  // Vamos contar quantas faltas/presenças ocorreram em cada dia
  const logs = await prisma.attendanceLog.findMany({
    include: { turma: true }
  });

  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const frequenciaPorDia = [0, 0, 0, 0, 0, 0, 0];

  logs.forEach(log => {
    const dia = new Date(log.dataHora).getDay();
    frequenciaPorDia[dia]++;
  });

  // Formata para o gráfico
  const graficoDias = diasSemana.map((dia, index) => ({
    name: dia,
    presencas: frequenciaPorDia[index]
  }));

  // 2. Análise de Pontualidade (Chegou nos primeiros 5min ou no sufoco?)
  let pontuais = 0; // Chegaram em até 5 min
  let atrasados = 0; // Chegaram entre 5 e 15 min

  logs.forEach(log => {
    // Pega a hora que o aluno chegou
    const horaLog = new Date(log.dataHora);
    // Pega a hora que a aula começava (Baseado no cadastro da turma)
    const [h, m] = log.turma.horarioInicio.split(':').map(Number);
    const horaAula = new Date(log.dataHora);
    horaAula.setHours(h, m, 0, 0);

    const diffMinutos = (horaLog.getTime() - horaAula.getTime()) / 1000 / 60;

    if (diffMinutos <= 5) pontuais++;
    else if (diffMinutos > 5) atrasados++;
  });

  // 3. Gerador de Insights (IA Simples)
  const insights = [];
  
  // Insight de Sexta-feira
  if (frequenciaPorDia[5] < frequenciaPorDia[1]) { // Se Sex tem menos que Seg
    insights.push("📉 Baixa adesão detectada às sextas-feiras. Evite agendar avaliações importantes.");
  }

  // Insight de Pontualidade
  const total = pontuais + atrasados;
  if (total > 0 && (atrasados / total) > 0.3) { // Se 30% chega atrasado
    insights.push("⚠️ 30% da turma chega após o início da aula. Considere tolerância ou reforço de horário.");
  } else {
    insights.push("✅ A pontualidade da turma está excelente. A maioria chega nos primeiros 5 minutos.");
  }

  return {
    graficoDias,
    graficoPontualidade: [
      { name: 'Pontuais (<5min)', value: pontuais },
      { name: 'No Limite (5-15min)', value: atrasados }
    ],
    insights
  };
});

// Rota para Atualizar Perfil
app.put('/usuarios/:id', async (req: any, reply) => {
  const { id } = req.params;
  const { nome, email, senha } = req.body;

  try {
    const usuarioAtualizado = await prisma.user.update({
      where: { id },
      data: { nome, email, senha }
    });

    return usuarioAtualizado;
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ error: "Erro ao atualizar perfil." });
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