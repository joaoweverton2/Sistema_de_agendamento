# Guia de Deployment no Render

Este guia mostra como fazer deploy do sistema de agendamento no Render.

## 📋 Pré-requisitos

- Conta GitHub com o repositório do projeto
- Conta Render (gratuita em [render.com](https://render.com))
- Git configurado localmente

## 🚀 Passo 1: Preparar Repositório GitHub

### 1.1 Criar repositório

1. Acesse [GitHub](https://github.com)
2. Clique em "New repository"
3. Nome: `agendamento-mercadorias`
4. Descrição: `Sistema de agendamento de recebimento de mercadorias`
5. Selecione "Public" ou "Private"
6. Clique em "Create repository"

### 1.2 Fazer push do código

Na raiz do projeto:

```bash
git init
git add .
git commit -m "Initial commit: Sistema de agendamento simples com SQLite"
git branch -M main
git remote add origin https://github.com/seu-usuario/agendamento-mercadorias.git
git push -u origin main
```

## 🔗 Passo 2: Conectar Render com GitHub

1. Acesse [render.com](https://render.com)
2. Clique em "Sign up" (ou login se já tem conta)
3. Selecione "GitHub" para autenticação
4. Autorize o Render a acessar sua conta GitHub
5. Você será redirecionado para o dashboard do Render

## 🏗️ Passo 3: Criar Web Service

1. No dashboard do Render, clique em "New +"
2. Selecione "Web Service"
3. Conecte seu repositório:
   - Clique em "Connect" ao lado do repositório `agendamento-mercadorias`
   - Autorize o Render a acessar o repositório
   - Selecione o repositório

## ⚙️ Passo 4: Configurar Web Service

Preencha os campos:

| Campo | Valor |
|-------|-------|
| **Name** | `agendamento-mercadorias` |
| **Environment** | `Node` |
| **Region** | `São Paulo (South America)` (ou mais próximo) |
| **Branch** | `main` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Plan** | `Free` (ou pago conforme necessário) |

## 🔐 Passo 5: Adicionar Variáveis de Ambiente

1. Desça até a seção "Environment"
2. Clique em "Add Environment Variable"
3. Adicione cada variável:

```
PORT=3000
NODE_ENV=production
DATABASE_PATH=/var/data/agendamento.db
GOOGLE_SHEETS_SPREADSHEET_ID=seu_id_aqui
GOOGLE_SHEETS_CREDENTIALS={"type":"service_account",...}
CDL_PIN=1235
```

**Para `GOOGLE_SHEETS_CREDENTIALS`:**
1. Abra o arquivo `credentials.json` localmente
2. Copie todo o conteúdo JSON
3. Cole como valor da variável (sem quebras de linha)

## 💾 Passo 6: Configurar Persistência de Dados

O Render oferece discos persistentes para dados. Configure:

1. Na seção "Disk", clique em "Add Disk"
2. Preencha:
   - **Name**: `data`
   - **Mount Path**: `/var/data`
   - **Size**: `1 GB` (suficiente para agendamentos)

3. Atualize a variável de ambiente:
   ```
   DATABASE_PATH=/var/data/agendamento.db
   ```

## 🚀 Passo 7: Deploy

1. Clique em "Create Web Service"
2. O Render iniciará o build automaticamente
3. Você verá o progresso em tempo real
4. Quando terminar, você receberá uma URL como:
   ```
   https://agendamento-mercadorias.onrender.com
   ```

## ✅ Passo 8: Verificar Deploy

1. Acesse a URL fornecida
2. Teste as funcionalidades:
   - Criar novo agendamento
   - Visualizar histórico
   - Exportar dados
   - Registrar indisponibilidade

## 🔄 Passo 9: Configurar Auto-Deploy

O Render faz deploy automaticamente quando você faz push para `main`:

```bash
# Fazer alterações
git add .
git commit -m "Descrição das alterações"
git push origin main

# Render detectará e iniciará o deploy automaticamente
```

## 📊 Monitorar Deploy

1. No dashboard do Render, clique no seu Web Service
2. Veja:
   - **Logs**: Mensagens do servidor
   - **Metrics**: CPU, memória, requisições
   - **Events**: Histórico de deploys

## 🔧 Troubleshooting

### Erro: "Build failed"

**Solução:**
1. Verifique os logs
2. Certifique-se de que `npm run build` funciona localmente
3. Verifique se todas as dependências estão em `package.json`

### Erro: "Application failed to start"

**Solução:**
1. Verifique se `npm start` funciona localmente
2. Verifique as variáveis de ambiente
3. Verifique se o banco de dados está acessível

### Erro: "Database connection failed"

**Solução:**
1. Verifique se o disco persistente foi criado
2. Verifique o caminho `DATABASE_PATH`
3. Verifique as permissões de arquivo

### Erro: "Google Sheets not syncing"

**Solução:**
1. Verifique se `GOOGLE_SHEETS_CREDENTIALS` está correto
2. Verifique se a planilha foi compartilhada com a conta de serviço
3. Verifique se `GOOGLE_SHEETS_SPREADSHEET_ID` está correto

## 📈 Escalabilidade

Para aumentar a capacidade:

1. **Upgrade do plano**: Mude de "Free" para "Starter" ou "Standard"
2. **Aumentar disco**: Aumente o tamanho do disco persistente
3. **Múltiplas instâncias**: Configure réplicas para balanceamento de carga

## 🔐 Segurança em Produção

1. **HTTPS**: Render fornece SSL automaticamente
2. **Variáveis secretas**: Nunca commite `.env` ou `credentials.json`
3. **Backups**: Configure backups regulares do banco de dados
4. **Monitoramento**: Configure alertas para erros e downtime

## 📝 Atualizar Código

Para atualizar o código em produção:

```bash
# Fazer alterações localmente
nano src/server.ts

# Commitar e fazer push
git add .
git commit -m "Descrição das alterações"
git push origin main

# Render fará deploy automaticamente
```

## 🔄 Rollback

Se algo der errado:

1. No dashboard do Render, vá para "Events"
2. Clique no deploy anterior
3. Clique em "Redeploy"

## 📞 Suporte

- **Documentação Render**: https://render.com/docs
- **Status**: https://status.render.com
- **Comunidade**: https://render.com/community

---

**Deploy configurado com sucesso! 🎉**

Seu sistema está agora disponível em produção e pronto para receber agendamentos!
