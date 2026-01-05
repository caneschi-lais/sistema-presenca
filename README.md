# 📍 GeoClass - Sistema de Gestão de Presença via Geolocalização

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/Node.js-v18+-green)
![React](https://img.shields.io/badge/React-v18-blue)
![Prisma](https://img.shields.io/badge/Prisma-ORM-informational)

O **GeoClass** é uma aplicação web desenvolvida para modernizar o processo de chamada em instituições de ensino. Utilizando **Geolocalização (GPS)** e **Geofencing (cerca virtual)**, o sistema permite que alunos registrem presença pelo celular apenas se estiverem dentro do raio da sala de aula e dentro do horário permitido.

O sistema conta com painéis específicos para **Alunos**, **Professores** e **Coordenadores**, além de camadas de segurança contra fraudes e análise de dados para prevenção de evasão escolar.

---

## 🚀 Funcionalidades Principais

### 🎓 Para o Aluno
- **Registro de Presença via GPS:** Validação de raio (ex: 50m) da sala de aula.
- **Histórico Completo:** Visualização de todas as presenças passadas.
- **Painel de Frequência:** Barras de progresso com alertas visuais de reprovação (<75%).
- **Gestão de Perfil:** Edição de dados e senha.

### 👨‍🏫 Para o Professor
- **Chamada em Tempo Real:** Visualiza quem está presente instantaneamente.
- **Gestão de Turmas:** Visualiza suas disciplinas, horários e dias.
- **Segurança:** Identifica se o aluno usou um dispositivo seguro.

### 📊 Para o Coordenador (Gestão)
- **Dashboard de Inteligência:** Gráficos de pontualidade e adesão semanal.
- **Radar de Evasão:** Identifica automaticamente alunos com baixo rendimento.
- **Cadastro de Turmas:** Criação de disciplinas com definição de Geofence (Lat/Long) e Horários.

### 🛡️ Camadas de Segurança
1.  **Geofencing:** Validação física de coordenadas.
2.  **Trava de Horário:** Presença permitida apenas nos primeiros 15 minutos de aula.
3.  **Device Fingerprint:** Bloqueia tentativas de registrar presença para terceiros (Buddy Punching) usando o mesmo dispositivo.

---

## 🛠️ Tecnologias Utilizadas

**Backend:**
- Node.js & TypeScript
- Fastify/Express (API REST)
- Prisma ORM (Gerenciamento de Banco de Dados)
- SQLite (Banco de dados local para desenvolvimento)

**Frontend:**
- React.js + Vite
- TailwindCSS + DaisyUI (Estilização e Temas)
- Recharts (Gráficos e Analytics)
- React Toastify (Notificações)
- FingerprintJS (Segurança de Dispositivo)

---

## ⚙️ Instalação e Execução

Siga os passos abaixo para rodar o projeto em sua máquina local.

### Pré-requisitos
- Node.js instalado (v16 ou superior)
- Git instalado

### 1. Configurando o Backend (Servidor)

```bash
# Clone o repositório
git clone [https://github.com/seu-usuario/geoclass.git](https://github.com/seu-usuario/geoclass.git)

# Entre na pasta do projeto (Raiz)
cd geoclass

# Instale as dependências
npm install

# Crie um arquivo chamado .env na raiz e adicione:
# DATABASE_URL="file:./dev.db"

# Gere o banco de dados e as tabelas
npx prisma generate
npx prisma db push

# Popule o banco com dados de teste (Admin, Prof, Aluno, Turmas)
npx ts-node prisma/seed.ts

# Inicie o servidor
npx ts-node src/server.ts
(O servidor rodará em http://localhost:3000)

### 2. Configurando o Frontend (Interface)

# Abra um novo terminal, navegue até a pasta frontend e rode:

```Bash

# Entre na pasta do frontend
cd frontend

# Instale as dependências
npm install

# Inicie a aplicação
npm run dev
(O frontend rodará em http://localhost:5173)

### 3. Credenciais de Teste

#O script de seed cria automaticamente os seguintes usuários para você testar todas as funcionalidades:
Perfil  Email   Senha
Aluno   aluno@fatec.sp.gov.br  123
Professor   prof@fatec.sp.gov.br    123
Coordenador coord@fatec.sp.gov.br   123

