# 🚀 Guia Rápido - Sistema de Agendamento

Comece em **3 passos simples**:

## 1️⃣ Instalar Dependências

```bash
npm install
```

## 2️⃣ Iniciar Servidor

```bash
npm run dev
```

Você verá:
```
╔════════════════════════════════════════════════════════════╗
║  🚀 Servidor de Agendamento de Mercadorias                ║
║  Rodando em: http://localhost:3000                      ║
║  Banco de dados: SQLite                                    ║
║  Google Sheets: Integrado                                  ║
╚════════════════════════════════════════════════════════════╝
```

## 3️⃣ Acessar no Navegador

Abra: **http://localhost:3000**

---

## 📋 Funcionalidades Disponíveis

### 📅 Novo Agendamento
1. Selecione o estado (UF)
2. Escolha a data no calendário (2 meses)
3. Selecione o horário (08:00-11:00 ou 13:00-16:00)
4. Preencha os dados da transportadora
5. Confirme o agendamento

### 📊 Meus Agendamentos
- Visualize todos os seus agendamentos
- Busque por NF, Empresa ou Motorista
- Filtre por status (Confirmado/Cancelado)
- Cancele até 24h antes
- Exporte em CSV ou PDF

### 🔐 Gerenciamento CDL
- PIN: **1235**
- Registre indisponibilidades
- Marque dias/horários indisponíveis

---

## 🧪 Testar

```bash
npm test
```

Resultado esperado:
```
✓ src/holidays.test.ts  (18 tests)
Test Files  1 passed (1)
Tests  18 passed (18)
```

---

## 🏗️ Build para Produção

```bash
npm run build
npm start
```

---

## 📚 Documentação Completa

- **README.md** - Documentação detalhada
- **GOOGLE_SHEETS_SETUP.md** - Integração com Google Sheets
- **RENDER_DEPLOY.md** - Deploy no Render

---

## 🆘 Problemas Comuns

### Porta 3000 já está em uso?
```bash
lsof -ti:3000 | xargs kill -9
npm run dev
```

### Banco de dados não foi criado?
```bash
mkdir -p data
npm run dev
```

### Google Sheets não sincroniza?
- Verifique se `credentials.json` existe
- Verifique se a planilha foi compartilhada
- Veja GOOGLE_SHEETS_SETUP.md

---

## 🎯 Estrutura das 8 Cidades

| UF | Cidade | Horários |
|----|--------|----------|
| CE | Fortaleza | 08:00-11:00, 13:00-16:00 |
| PB | João Pessoa | 08:00-11:00, 13:00-16:00 |
| RN | Natal | 08:00-11:00, 13:00-16:00 |
| BA | Eunápolis | 08:00-11:00, 13:00-16:00 |
| MG | Poços de Caldas | 08:00-11:00, 13:00-16:00 |
| SP | Ourinhos | 08:00-11:00, 13:00-16:00 |
| SP | Itupeva | 08:00-11:00, 13:00-16:00 |
| SP | Registro | 08:00-11:00, 13:00-16:00 |

---

## 🚀 Próximo: Deploy no Render

Quando estiver pronto para produção:

1. Faça push para GitHub
2. Siga RENDER_DEPLOY.md
3. Seu sistema estará online em minutos!

---

**Pronto para começar? Execute `npm install && npm run dev` agora! 🎉**
