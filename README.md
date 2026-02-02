# Sistema de Agendamento de Recebimento de Mercadorias

Um sistema simples, direto e funcional para agendamento de recebimento de mercadorias em CDLs (Centros de Distribuição Logística) em 8 cidades brasileiras.

## 🎯 Características

- **Calendário Interativo**: Visualiza 2 meses (atual + próximo) com dias disponíveis/indisponíveis
- **Horários Inteligentes**: 08:00-11:00 e 13:00-16:00 (8 horários exatos)
- **Feriados Automáticos**: Desabilita feriados nacionais e estaduais
- **Horas Passadas Desabilitadas**: Horários passados do dia atual ficam cinzas
- **8 Cidades**: CE (Fortaleza), PB (João Pessoa), RN (Natal), BA (Eunápolis), MG (Poços de Caldas), SP-Ourinhos, SP-Itupeva, SP-Registro
- **Cancelamento**: Até 24 horas antes do agendamento
- **Histórico**: Busca, filtros e exportação (CSV/PDF)
- **Google Sheets**: Sincronização automática de agendamentos
- **CDL Management**: Registro de indisponibilidades com PIN (1235)

## 🛠️ Stack Tecnológico

- **Backend**: TypeScript + Express 4 + SQLite
- **Frontend**: HTML + CSS + JavaScript (sem frameworks)
- **Banco de Dados**: SQLite (arquivo local)
- **Integração**: Google Sheets API
- **Testes**: Vitest

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Git (para versionamento)

## 🚀 Instalação Rápida

### 1. Clone ou extraia o projeto

```bash
cd agendamento_simples
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o ambiente

```bash
cp .env.example .env
```

Edite `.env` com suas variáveis:
```
PORT=3000
NODE_ENV=development
DATABASE_PATH=./data/agendamento.db
GOOGLE_SHEETS_SPREADSHEET_ID=seu_id_aqui
GOOGLE_SHEETS_CREDENTIALS_PATH=./credentials.json
```

### 4. Configure Google Sheets (Opcional)

Se deseja sincronizar com Google Sheets:

1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Crie um novo projeto
3. Ative a API Google Sheets
4. Crie uma conta de serviço
5. Baixe o arquivo JSON de credenciais
6. Salve como `credentials.json` na raiz do projeto
7. Compartilhe sua planilha com o email da conta de serviço

### 5. Inicie o servidor

```bash
npm run dev
```

O servidor estará disponível em `http://localhost:3000`

## 📁 Estrutura do Projeto

```
agendamento_simples/
├── src/
│   ├── server.ts              # Servidor Express com rotas API
│   ├── database.ts            # Inicialização SQLite
│   ├── holidays.ts            # Lógica de feriados
│   ├── googleSheets.ts        # Integração Google Sheets
│   └── holidays.test.ts       # Testes unitários
├── public/
│   ├── index.html             # Página principal
│   ├── styles.css             # Estilos
│   └── app.js                 # Lógica frontend
├── data/
│   └── agendamento.db         # Banco de dados SQLite (criado automaticamente)
├── package.json               # Dependências
├── tsconfig.json              # Configuração TypeScript
├── .env.example               # Variáveis de ambiente
├── .gitignore                 # Arquivos ignorados
└── README.md                  # Este arquivo
```

## 🔌 Rotas API

### Cidades
- `GET /api/cities` - Lista todas as cidades

### Calendário
- `GET /api/calendar/:state/:year/:month` - Calendário com dias disponíveis

### Horários
- `GET /api/hours/:date` - Horários disponíveis para uma data

### Agendamentos
- `POST /api/bookings` - Criar novo agendamento
- `GET /api/bookings` - Listar todos os agendamentos
- `GET /api/bookings/:id` - Detalhes de um agendamento
- `GET /api/bookings/city/:cityId` - Agendamentos de uma cidade
- `POST /api/bookings/:id/cancel` - Cancelar agendamento

### CDL Management
- `POST /api/cdl/unavailability` - Registrar indisponibilidade
- `GET /api/cdl/unavailabilities/:cityId` - Listar indisponibilidades

## 🧪 Testes

Execute os testes unitários:

```bash
npm test
```

## 🏗️ Build para Produção

```bash
npm run build
npm start
```

## 📦 Deployment no Render

### 1. Prepare o repositório

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/seu-usuario/agendamento_simples.git
git push -u origin main
```

### 2. Crie um novo Web Service no Render

1. Acesse [render.com](https://render.com)
2. Clique em "New +" → "Web Service"
3. Conecte seu repositório GitHub
4. Configure:
   - **Name**: agendamento-mercadorias
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free (ou pago conforme necessário)

### 3. Configure variáveis de ambiente

No painel do Render, adicione:
```
PORT=3000
NODE_ENV=production
DATABASE_PATH=/var/data/agendamento.db
GOOGLE_SHEETS_SPREADSHEET_ID=seu_id
GOOGLE_SHEETS_CREDENTIALS_PATH=/var/data/credentials.json
CDL_PIN=1235
```

### 4. Deploy

O Render fará deploy automaticamente ao fazer push para `main`

## 🔐 Segurança

- **PIN CDL**: Padrão é `1235` (altere em produção)
- **Banco de Dados**: Use variáveis de ambiente para credenciais
- **CORS**: Configure domínios permitidos em produção
- **HTTPS**: Render fornece SSL automaticamente

## 📝 Exemplo de Uso

### 1. Novo Agendamento

```javascript
const booking = {
  city_id: 1,
  company_name: "Transportadora XYZ",
  vehicle_plate: "ABC-1234",
  invoice_number: "NF-000001",
  driver_name: "João Silva",
  booking_date: "2025-02-10",
  booking_time: "09:00"
};

const response = await fetch('/api/bookings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(booking)
});
```

### 2. Cancelar Agendamento

```javascript
const response = await fetch('/api/bookings/BK-1234567890/cancel', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ reason: 'Cancelado pelo cliente' })
});
```

### 3. Registrar Indisponibilidade

```javascript
const unavailability = {
  pin: "1235",
  city_id: 1,
  unavailable_date: "2025-02-10",
  unavailable_time: "09:00",
  reason: "Manutenção de equipamento"
};

const response = await fetch('/api/cdl/unavailability', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(unavailability)
});
```

## 🐛 Troubleshooting

### Erro: "ENOENT: no such file or directory, open 'agendamento.db'"

O banco de dados será criado automaticamente. Verifique se a pasta `data/` existe:
```bash
mkdir -p data
npm run dev
```

### Erro: "Google Sheets não sincronizado"

Verifique se:
1. `credentials.json` existe na raiz do projeto
2. A planilha foi compartilhada com o email da conta de serviço
3. As variáveis de ambiente estão corretas

### Erro: "PIN inválido"

O PIN padrão é `1235`. Altere em produção nas variáveis de ambiente.

## 📞 Suporte

Para dúvidas ou problemas, consulte a documentação ou abra uma issue no repositório.

## 📄 Licença

MIT License - Veja LICENSE.md para detalhes

---

**Desenvolvido com ❤️ para CDLs brasileiros**
