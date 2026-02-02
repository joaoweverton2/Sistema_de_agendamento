# Instruções de Implantação e Acesso

Este documento detalha os passos necessários para implantar o sistema atualizado e como acessar as novas funcionalidades.

## 1. Preparação do Ambiente

O sistema foi desenvolvido em **Node.js** com **TypeScript** e utiliza **SQLite** para armazenamento local e **Google Sheets** para sincronização e backup.

### Requisitos:
- Node.js (v18 ou superior)
- NPM ou PNPM
- Conta no Google Cloud (para API do Google Sheets)

## 2. Configuração do Google Sheets

Para que a resiliência e a sincronização funcionem corretamente:
1. Crie um projeto no [Google Cloud Console](https://console.cloud.google.com/).
2. Ative a **Google Sheets API**.
3. Crie uma **Conta de Serviço** e baixe o arquivo de credenciais JSON.
4. Renomeie o arquivo para `credentials.json` e coloque-o na raiz do projeto.
5. Crie uma nova planilha no Google Sheets e compartilhe-a com o e-mail da Conta de Serviço (com permissão de Editor).
6. Copie o ID da planilha (presente na URL: `https://docs.google.com/spreadsheets/d/ID_AQUI/edit`).

## 3. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto baseando-se no `.env.example`:

```env
PORT=3000
GOOGLE_SHEETS_SPREADSHEET_ID=seu_id_da_planilha_aqui
GOOGLE_SHEETS_CREDENTIALS_PATH=./credentials.json
GOOGLE_SHEETS_BOOKINGS_SHEET=Agendamentos
GOOGLE_SHEETS_UNAVAILABILITIES_SHEET=Indisponibilidades
ALWAYS_RESTORE_SHEETS=true
```

## 4. Instalação e Execução

No terminal, execute os seguintes comandos:

```bash
# Instalar dependências
npm install

# Compilar o projeto (TypeScript para JavaScript)
npm run build

# Iniciar o servidor
npm start
```

## 5. Acesso às Funcionalidades

### Tela de Agendamento (Público)
- **URL:** `http://seu-dominio.com/`
- **Novidades:**
  - Campo **Fornecedor** adicionado acima da NF.
  - Campo **Placa** agora permite livre preenchimento.
  - Calendário bloqueia datas retroativas e o próprio dia (disponível apenas **D+1**).
  - Rodapé dinâmico exibe endereço e contato do CD ao selecionar a UF.

### Visão Gerencial (Interno)
- **URL:** `http://seu-dominio.com/manager`
- **Funcionalidades:**
  - Visualização estilo **Microsoft Teams** (grade semanal).
  - Filtro por **UF** para visão específica de cada CD.
  - Botão **Baixar Planilha** para exportar todos os agendamentos em formato CSV (compatível com Excel).
  - **Acesso separado:** A página de Visão Gerencial é uma rota distinta, sem acesso direto a partir da tela de agendamento pública.

### Resiliência (Automático)
- Em caso de queda do Render ou reinicialização do sistema, o servidor verificará automaticamente a planilha do Google Sheets.
- Se o banco de dados local estiver vazio, ele restaurará todos os agendamentos e indisponibilidades contidos no Sheets, garantindo que o sistema retorne exatamente ao estado anterior.

## 6. Links de Acesso

Após a implantação no Render ou outro serviço de hospedagem, os links seguirão o padrão:
- **Sistema Principal (Público):** `https://seu-app.onrender.com`
- **Visão Gerencial (Interno):** `https://seu-app.onrender.com/manager`
