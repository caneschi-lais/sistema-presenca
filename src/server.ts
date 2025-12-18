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