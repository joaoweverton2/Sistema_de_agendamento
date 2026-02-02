# 🎬 Script de Demonstração - Sistema de Agendamento

Um guia passo a passo completo para demonstrar todas as funcionalidades do sistema de agendamento de mercadorias.

---

## 📋 Índice

1. [Preparação Inicial](#preparação-inicial)
2. [Demonstração 1: Novo Agendamento](#demonstração-1-novo-agendamento)
3. [Demonstração 2: Visualizar Calendário](#demonstração-2-visualizar-calendário)
4. [Demonstração 3: Histórico e Filtros](#demonstração-3-histórico-e-filtros)
5. [Demonstração 4: Cancelamento](#demonstração-4-cancelamento)
6. [Demonstração 5: Exportação](#demonstração-5-exportação)
7. [Demonstração 6: CDL Management](#demonstração-6-cdl-management)
8. [Demonstração 7: Google Sheets](#demonstração-7-google-sheets)
9. [Demonstração 8: API Direta](#demonstração-8-api-direta)

---

## 🚀 Preparação Inicial

### Passo 1: Instalar Dependências

```bash
cd agendamento_simples
npm install
```

**Esperado:**
```
added 345 packages in 25s
```

### Passo 2: Iniciar o Servidor

```bash
npm run dev
```

**Esperado:**
```
╔════════════════════════════════════════════════════════════╗
║  🚀 Servidor de Agendamento de Mercadorias                ║
║  Rodando em: http://localhost:3000                      ║
║  Banco de dados: SQLite                                    ║
║  Google Sheets: Integrado                                  ║
╚════════════════════════════════════════════════════════════╝

✅ Conectado ao SQLite: ./data/agendamento.db
✅ Banco de dados inicializado com sucesso
```

### Passo 3: Abrir no Navegador

Acesse: **http://localhost:3000**

**Esperado:**
- Página com 3 abas: "Novo Agendamento", "Meus Agendamentos", "Gerenciamento CDL"
- Dropdown com 8 estados
- Calendário vazio (aguardando seleção de estado)

---

## 🎯 Demonstração 1: Novo Agendamento

### Objetivo
Criar um novo agendamento de recebimento de mercadorias.

### Passo 1: Selecionar Estado

1. Na aba "Novo Agendamento"
2. Clique no dropdown "Estado (UF)"
3. Selecione **"Ceará - Fortaleza"**

**Esperado:**
- Calendário aparece com 2 meses (atual + próximo)
- Dias passados, fins de semana e feriados aparecem cinzas/opacos
- Dias disponíveis aparecem em branco/clicáveis

### Passo 2: Selecionar Data

1. No calendário, procure um dia **verde/disponível** (não cinza)
2. Clique nele (ex: próxima segunda-feira)

**Esperado:**
- Dia fica com fundo azul (selecionado)
- Dropdown "Horário" fica habilitado
- Tooltip mostra os 8 horários disponíveis

### Passo 3: Selecionar Horário

1. Clique no dropdown "Horário"
2. Selecione **"09:00"**

**Esperado:**
- Horário aparece selecionado
- Campo "Empresa/Transportadora" fica habilitado

### Passo 4: Preencher Dados

Preencha os campos:

| Campo | Valor de Exemplo |
|-------|------------------|
| Empresa/Transportadora | Transportadora XYZ Ltda |
| Placa do Veículo | ABC-1234 |
| Número da Nota Fiscal | NF-000001 |
| Nome do Motorista | João Silva Santos |

**Esperado:**
- Botão "Confirmar Agendamento" fica azul e habilitado

### Passo 5: Confirmar Agendamento

1. Clique em "Confirmar Agendamento"

**Esperado:**
- Mensagem verde: "✅ Agendamento confirmado! ID: BK-1234567890"
- Formulário limpa automaticamente
- Calendário desaparece

### Passo 6: Verificar Banco de Dados

```bash
# Em outro terminal
sqlite3 data/agendamento.db
SELECT * FROM bookings;
```

**Esperado:**
```
BK-1234567890|1|Transportadora XYZ Ltda|ABC-1234|NF-000001|João Silva Santos|2025-02-10|09:00|confirmed|2025-01-26 11:45:00|NULL
```

---

## 📅 Demonstração 2: Visualizar Calendário

### Objetivo
Demonstrar as funcionalidades do calendário interativo.

### Passo 1: Dias Desabilitados

1. Selecione novamente "Ceará - Fortaleza"
2. Observe o calendário

**Esperado - Dias Cinzas (Desabilitados):**
- ✅ Todos os dias passados (antes de hoje)
- ✅ Todos os sábados e domingos
- ✅ Feriados nacionais (ex: 25/12 - Natal)
- ✅ Feriados estaduais (ex: 19/03 - São José em CE)

**Esperado - Dias Brancos (Disponíveis):**
- ✅ Dias úteis futuros que não são feriados

### Passo 2: Horas Passadas do Dia Atual

1. Se for durante o horário comercial (08:00-16:00)
2. Clique em "Hoje" (se disponível)
3. Passe o mouse sobre o dia

**Esperado:**
- Tooltip mostra apenas horários futuros
- Ex: Se for 14:00, mostra apenas: 15:00, 16:00
- Horários passados (08:00, 09:00, etc) não aparecem

### Passo 3: Tooltip com Horários

1. Passe o mouse sobre qualquer dia disponível

**Esperado:**
- Tooltip aparece com todos os 8 horários:
  ```
  08:00 09:00 10:00 11:00
  13:00 14:00 15:00 16:00
  ```

### Passo 4: Dois Meses

1. Role para baixo no calendário
2. Observe que há 2 meses exibidos

**Esperado:**
- Mês atual completo
- Próximo mês completo
- Permite agendamentos até 2 meses à frente

---

## 📊 Demonstração 3: Histórico e Filtros

### Objetivo
Demonstrar busca, filtros e visualização de agendamentos.

### Passo 1: Criar Múltiplos Agendamentos

Crie 3 agendamentos em diferentes cidades:

**Agendamento 1:**
- Estado: Ceará - Fortaleza
- Data: Próxima segunda-feira
- Hora: 09:00
- Empresa: Transportadora ABC
- Placa: XYZ-5678
- NF: NF-000002
- Motorista: Maria Silva

**Agendamento 2:**
- Estado: São Paulo - Ourinhos
- Data: Próxima terça-feira
- Hora: 14:00
- Empresa: Logística Brasil
- Placa: DEF-9012
- NF: NF-000003
- Motorista: Pedro Costa

**Agendamento 3:**
- Estado: Minas Gerais - Poços de Caldas
- Data: Próxima quarta-feira
- Hora: 10:00
- Empresa: Transportadora XYZ
- Placa: GHI-3456
- NF: NF-000004
- Motorista: Ana Santos

### Passo 2: Acessar Histórico

1. Clique na aba "Meus Agendamentos"

**Esperado:**
- Tabela com 3 agendamentos
- Colunas: ID, Empresa, Nota Fiscal, Motorista, Data, Horário, Status, Ações
- Todos com status "Confirmado" (verde)

### Passo 3: Buscar por Nota Fiscal

1. No campo "Buscar por NF, Empresa ou Motorista"
2. Digite: **"NF-000002"**

**Esperado:**
- Tabela filtra para mostrar apenas 1 agendamento
- Agendamento da Transportadora ABC aparece

### Passo 4: Buscar por Empresa

1. Limpe o campo de busca
2. Digite: **"Logística"**

**Esperado:**
- Tabela filtra para mostrar apenas o agendamento de "Logística Brasil"

### Passo 5: Buscar por Motorista

1. Limpe o campo de busca
2. Digite: **"Ana"**

**Esperado:**
- Tabela filtra para mostrar apenas o agendamento de Ana Santos

### Passo 6: Filtrar por Status

1. No dropdown "Todos os Status"
2. Selecione **"Confirmado"**

**Esperado:**
- Tabela mostra apenas agendamentos confirmados (todos os 3)

### Passo 7: Limpar Filtros

1. Clique em "Limpar Filtros"

**Esperado:**
- Campo de busca limpa
- Dropdown volta para "Todos os Status"
- Tabela mostra todos os 3 agendamentos

### Passo 8: Resumo

Observe no topo da tabela:
- "Mostrando 3 de 3 agendamentos"

**Esperado:**
- Número de agendamentos filtrados vs total

---

## ❌ Demonstração 4: Cancelamento

### Objetivo
Demonstrar o cancelamento de agendamentos com validação de 24 horas.

### Passo 1: Tentar Cancelar Agendamento Próximo

1. Na aba "Meus Agendamentos"
2. Procure um agendamento para **amanhã**
3. Clique no botão "Cancelar"

**Esperado:**
- Dialog de confirmação aparece
- Mensagem: "Tem certeza que deseja cancelar este agendamento?"

### Passo 2: Confirmar Cancelamento

1. Clique em "Sim" ou "Confirmar"

**Esperado:**
- Mensagem verde: "✅ Agendamento cancelado com sucesso"
- Status do agendamento muda para "Cancelado" (vermelho)
- Botão "Cancelar" desaparece

### Passo 3: Tentar Cancelar Agendamento Muito Próximo

1. Crie um novo agendamento para **hoje** (se possível)
2. Tente cancelar

**Esperado:**
- Mensagem vermelha: "❌ Erro: Cancelamento deve ser feito com pelo menos 24 horas de antecedência"
- Agendamento não é cancelado

### Passo 4: Verificar Banco de Dados

```bash
sqlite3 data/agendamento.db
SELECT id, status, cancelled_at FROM bookings WHERE status = 'cancelled';
```

**Esperado:**
```
BK-1234567890|cancelled|2025-01-26 12:00:00
```

---

## 📥 Demonstração 5: Exportação

### Objetivo
Demonstrar exportação de dados em CSV e PDF.

### Passo 1: Preparar Dados

1. Certifique-se de ter pelo menos 3 agendamentos na aba "Meus Agendamentos"

### Passo 2: Exportar CSV

1. Clique em "Exportar CSV"

**Esperado:**
- Arquivo `agendamentos_2025-01-26.csv` é baixado
- Abre em editor de texto ou Excel

**Conteúdo esperado:**
```csv
ID,Empresa,Nota Fiscal,Motorista,Data,Horário,Status,Data Criação
BK-1234567890,"Transportadora ABC","NF-000002","Maria Silva",2025-02-10,09:00,confirmed,2025-01-26T11:45:00Z
BK-1234567891,"Logística Brasil","NF-000003","Pedro Costa",2025-02-11,14:00,confirmed,2025-01-26T11:46:00Z
BK-1234567892,"Transportadora XYZ","NF-000004","Ana Santos",2025-02-12,10:00,cancelled,2025-01-26T11:47:00Z
```

### Passo 3: Exportar PDF

1. Clique em "Exportar PDF"

**Esperado:**
- Arquivo `agendamentos_2025-01-26.txt` é baixado (formato texto)
- Contém cabeçalho com data de geração
- Lista todos os agendamentos em formato tabular

**Conteúdo esperado:**
```
RELATÓRIO DE AGENDAMENTOS
Data: 26/01/2025

ID | Empresa | NF | Motorista | Data | Horário | Status
...
```

---

## 🔐 Demonstração 6: CDL Management

### Objetivo
Demonstrar o gerenciamento de indisponibilidades com PIN.

### Passo 1: Acessar CDL Management

1. Clique na aba "Gerenciamento CDL"

**Esperado:**
- Formulário com campos:
  - PIN de Acesso CDL (password)
  - Estado (dropdown)
  - Data Indisponível (date picker)
  - Horário (dropdown com 8 horários + "Dia inteiro")
  - Motivo (textarea)

### Passo 2: Registrar Indisponibilidade com PIN Correto

1. **PIN**: Digite **1235**
2. **Estado**: Selecione **Ceará**
3. **Data**: Selecione uma data futura (ex: 2025-02-15)
4. **Horário**: Selecione **09:00**
5. **Motivo**: Digite **"Manutenção de equipamento"**
6. Clique em "Registrar Indisponibilidade"

**Esperado:**
- Mensagem verde: "✅ Indisponibilidade registrada com sucesso"
- Formulário limpa

### Passo 3: Tentar com PIN Incorreto

1. **PIN**: Digite **9999**
2. **Estado**: Selecione **São Paulo - Ourinhos**
3. **Data**: Selecione uma data futura
4. **Horário**: Deixe em branco (dia inteiro)
5. Clique em "Registrar Indisponibilidade"

**Esperado:**
- Mensagem vermelha: "❌ Erro: PIN inválido"
- Indisponibilidade não é registrada

### Passo 4: Registrar Dia Inteiro Indisponível

1. **PIN**: Digite **1235**
2. **Estado**: Selecione **Paraíba**
3. **Data**: Selecione uma data futura
4. **Horário**: Deixe em branco (dia inteiro)
5. **Motivo**: Digite **"Feriado municipal"**
6. Clique em "Registrar Indisponibilidade"

**Esperado:**
- Mensagem verde: "✅ Indisponibilidade registrada com sucesso"

### Passo 5: Verificar Banco de Dados

```bash
sqlite3 data/agendamento.db
SELECT * FROM unavailabilities;
```

**Esperado:**
```
1|1|2025-02-15|09:00|Manutenção de equipamento|2025-01-26 12:05:00
2|2|2025-02-20||Feriado municipal|2025-01-26 12:06:00
```

---

## 📊 Demonstração 7: Google Sheets

### Objetivo
Demonstrar sincronização automática com Google Sheets.

### Pré-requisito
Você deve ter configurado o Google Sheets conforme GOOGLE_SHEETS_SETUP.md

### Passo 1: Verificar Configuração

1. Verifique se `credentials.json` existe na raiz do projeto
2. Verifique se `.env` tem `GOOGLE_SHEETS_SPREADSHEET_ID` preenchido

```bash
cat .env | grep GOOGLE_SHEETS
```

**Esperado:**
```
GOOGLE_SHEETS_SPREADSHEET_ID=ABC123XYZ...
GOOGLE_SHEETS_CREDENTIALS_PATH=./credentials.json
```

### Passo 2: Criar Novo Agendamento

1. Crie um novo agendamento normalmente
2. Observe a mensagem de sucesso

**Esperado:**
```
✅ Agendamento confirmado! ID: BK-1234567890
```

### Passo 3: Verificar Google Sheets

1. Abra a planilha Google Sheets no navegador
2. Vá para a aba "Agendamentos"
3. Procure pela última linha

**Esperado:**
- Dados aparecem automaticamente:
  ```
  BK-1234567890 | Transportadora ABC | ABC-1234 | NF-000002 | Maria Silva | 2025-02-10 | 09:00 | Fortaleza | confirmed | 2025-01-26T11:45:00Z
  ```

### Passo 4: Cancelar Agendamento

1. Cancele um agendamento na interface
2. Observe a mensagem de sucesso

### Passo 5: Verificar Atualização no Google Sheets

1. Volte à planilha Google Sheets
2. Procure pelo agendamento cancelado
3. Coluna "Status" deve estar atualizada

**Esperado:**
```
Status: cancelled
```

### Passo 6: Verificar Logs

No terminal onde o servidor está rodando:

**Esperado:**
```
✅ Agendamento BK-1234567890 sincronizado com Google Sheets
✅ Status do agendamento BK-1234567890 atualizado para cancelled
```

---

## 🔌 Demonstração 8: API Direta

### Objetivo
Demonstrar as rotas API usando curl ou Postman.

### Passo 1: Listar Cidades

```bash
curl http://localhost:3000/api/cities
```

**Esperado:**
```json
[
  {"id": 1, "state": "CE", "city": "Fortaleza"},
  {"id": 2, "state": "PB", "city": "João Pessoa"},
  {"id": 3, "state": "RN", "city": "Natal"},
  {"id": 4, "state": "BA", "city": "Eunápolis"},
  {"id": 5, "state": "MG", "city": "Poços de Caldas"},
  {"id": 6, "state": "SP-Ourinhos", "city": "Ourinhos"},
  {"id": 7, "state": "SP-Itupeva", "city": "Itupeva"},
  {"id": 8, "state": "SP-Registro", "city": "Registro"}
]
```

### Passo 2: Obter Calendário

```bash
curl http://localhost:3000/api/calendar/CE/2025/2
```

**Esperado:**
```json
[
  {"day": 1, "date": "2025-02-01", "available": false, "isPast": false, "isWeekend": true, "isHoliday": false, "dayOfWeek": "sab"},
  {"day": 2, "date": "2025-02-02", "available": false, "isPast": false, "isWeekend": true, "isHoliday": false, "dayOfWeek": "dom"},
  {"day": 3, "date": "2025-02-03", "available": true, "isPast": false, "isWeekend": false, "isHoliday": false, "dayOfWeek": "seg"},
  ...
]
```

### Passo 3: Obter Horários Disponíveis

```bash
curl http://localhost:3000/api/hours/2025-02-10
```

**Esperado:**
```json
{
  "date": "2025-02-10",
  "hours": ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"]
}
```

### Passo 4: Criar Agendamento via API

```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "city_id": 1,
    "company_name": "Transportadora Teste",
    "vehicle_plate": "TST-1234",
    "invoice_number": "NF-999999",
    "driver_name": "Teste Driver",
    "booking_date": "2025-02-10",
    "booking_time": "09:00"
  }'
```

**Esperado:**
```json
{
  "id": "BK-1234567890",
  "message": "Agendamento criado com sucesso"
}
```

### Passo 5: Listar Todos os Agendamentos

```bash
curl http://localhost:3000/api/bookings
```

**Esperado:**
```json
[
  {
    "id": "BK-1234567890",
    "city_id": 1,
    "company_name": "Transportadora Teste",
    "vehicle_plate": "TST-1234",
    "invoice_number": "NF-999999",
    "driver_name": "Teste Driver",
    "booking_date": "2025-02-10",
    "booking_time": "09:00",
    "status": "confirmed",
    "created_at": "2025-01-26 12:10:00",
    "cancelled_at": null,
    "city": "Fortaleza",
    "state": "CE"
  }
]
```

### Passo 6: Obter Agendamento Específico

```bash
curl http://localhost:3000/api/bookings/BK-1234567890
```

**Esperado:**
```json
{
  "id": "BK-1234567890",
  "city_id": 1,
  "company_name": "Transportadora Teste",
  "vehicle_plate": "TST-1234",
  "invoice_number": "NF-999999",
  "driver_name": "Teste Driver",
  "booking_date": "2025-02-10",
  "booking_time": "09:00",
  "status": "confirmed",
  "created_at": "2025-01-26 12:10:00",
  "cancelled_at": null,
  "city": "Fortaleza",
  "state": "CE"
}
```

### Passo 7: Cancelar Agendamento via API

```bash
curl -X POST http://localhost:3000/api/bookings/BK-1234567890/cancel \
  -H "Content-Type: application/json" \
  -d '{"reason": "Cancelado via API"}'
```

**Esperado:**
```json
{
  "message": "Agendamento cancelado com sucesso"
}
```

### Passo 8: Registrar Indisponibilidade via API

```bash
curl -X POST http://localhost:3000/api/cdl/unavailability \
  -H "Content-Type: application/json" \
  -d '{
    "pin": "1235",
    "city_id": 1,
    "unavailable_date": "2025-02-15",
    "unavailable_time": "09:00",
    "reason": "Manutenção"
  }'
```

**Esperado:**
```json
{
  "message": "Indisponibilidade registrada"
}
```

---

## 📝 Roteiro de Apresentação (15 minutos)

### Tempo: 0-2 minutos
**Introdução**
- Apresentar o problema: agendamento manual em CDLs
- Apresentar a solução: sistema automático

### Tempo: 2-5 minutos
**Demonstração 1: Novo Agendamento**
- Selecionar estado
- Visualizar calendário inteligente
- Criar agendamento
- Mostrar confirmação

### Tempo: 5-8 minutos
**Demonstração 2: Histórico e Filtros**
- Criar 2-3 agendamentos
- Demonstrar busca
- Demonstrar filtros
- Exportar CSV

### Tempo: 8-10 minutos
**Demonstração 3: Cancelamento**
- Cancelar um agendamento
- Mostrar validação de 24 horas
- Mostrar status atualizado

### Tempo: 10-12 minutos
**Demonstração 4: Google Sheets**
- Criar novo agendamento
- Mostrar sincronização em tempo real
- Abrir Google Sheets
- Mostrar dados sincronizados

### Tempo: 12-14 minutos
**Demonstração 5: CDL Management**
- Registrar indisponibilidade
- Mostrar validação de PIN
- Demonstrar dia inteiro indisponível

### Tempo: 14-15 minutos
**Conclusão**
- Resumir funcionalidades
- Mencionar deployment no Render
- Abrir para perguntas

---

## ✅ Checklist de Demonstração

Antes de apresentar, verifique:

- [ ] Servidor está rodando (`npm run dev`)
- [ ] Navegador aberto em `http://localhost:3000`
- [ ] Pelo menos 1 agendamento criado
- [ ] Google Sheets configurado (opcional)
- [ ] Terminal visível para mostrar logs
- [ ] Banco de dados SQLite acessível
- [ ] Conexão com internet (para Google Sheets)
- [ ] Áudio/vídeo testado (se apresentação remota)

---

## 🐛 Troubleshooting Durante Demonstração

### Problema: Calendário não aparece
**Solução:** Verifique se selecionou um estado no dropdown

### Problema: Agendamento não é criado
**Solução:** Verifique se todos os campos estão preenchidos

### Problema: Google Sheets não sincroniza
**Solução:** Verifique se `credentials.json` existe e está correto

### Problema: Cancelamento não funciona
**Solução:** Verifique se o agendamento é para mais de 24 horas no futuro

### Problema: Servidor não inicia
**Solução:** Verifique se porta 3000 está livre: `lsof -ti:3000 | xargs kill -9`

---

## 📚 Recursos Adicionais

- **README.md** - Documentação completa
- **QUICKSTART.md** - Guia rápido
- **GOOGLE_SHEETS_SETUP.md** - Integração Google Sheets
- **RENDER_DEPLOY.md** - Deployment

---

**Pronto para demonstrar! 🎉**
