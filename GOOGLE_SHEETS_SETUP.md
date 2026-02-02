# Guia de Integração com Google Sheets

Este guia passo a passo mostra como configurar a sincronização automática de agendamentos com Google Sheets.

## 📋 Pré-requisitos

- Conta Google
- Acesso ao Google Cloud Console
- Planilha Google Sheets criada

## 🔧 Passo 1: Criar Projeto no Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Clique em "Selecionar um projeto" no topo
3. Clique em "NOVO PROJETO"
4. Digite o nome: `Agendamento Mercadorias`
5. Clique em "CRIAR"
6. Aguarde a criação (pode levar alguns segundos)

## 🔑 Passo 2: Ativar Google Sheets API

1. Na barra de pesquisa, digite `Google Sheets API`
2. Clique no resultado
3. Clique em "ATIVAR"
4. Aguarde a ativação

## 👤 Passo 3: Criar Conta de Serviço

1. No menu esquerdo, clique em "Credenciais"
2. Clique em "CRIAR CREDENCIAIS"
3. Selecione "Conta de Serviço"
4. Preencha:
   - **Nome da conta de serviço**: `agendamento-bot`
   - **ID da conta de serviço**: Será preenchido automaticamente
5. Clique em "CRIAR E CONTINUAR"
6. Clique em "CONTINUAR" (sem adicionar permissões agora)
7. Clique em "CONCLUÍDO"

## 📄 Passo 4: Gerar Chave JSON

1. Na página de Credenciais, procure a conta de serviço criada
2. Clique no email da conta (agendamento-bot@...)
3. Vá para a aba "CHAVES"
4. Clique em "ADICIONAR CHAVE" → "Criar nova chave"
5. Selecione "JSON"
6. Clique em "CRIAR"
7. O arquivo `credentials.json` será baixado automaticamente

## 📁 Passo 5: Configurar Arquivo de Credenciais

1. Salve o arquivo `credentials.json` na raiz do projeto:
   ```
   agendamento_simples/
   └── credentials.json
   ```

2. Verifique que o arquivo contém:
   ```json
   {
     "type": "service_account",
     "project_id": "seu-projeto-id",
     "private_key_id": "...",
     "private_key": "...",
     "client_email": "agendamento-bot@...",
     "client_id": "...",
     "auth_uri": "...",
     "token_uri": "...",
     "auth_provider_x509_cert_url": "...",
     "client_x509_cert_url": "..."
   }
   ```

## 📊 Passo 6: Criar Planilha Google Sheets

1. Acesse [Google Sheets](https://sheets.google.com)
2. Clique em "Criar nova planilha"
3. Nomeie como `Agendamentos Mercadorias`
4. Na primeira aba, renomeie para `Agendamentos`
5. Crie os cabeçalhos na primeira linha:
   - A1: `ID`
   - B1: `Empresa`
   - C1: `Placa`
   - D1: `Nota Fiscal`
   - E1: `Motorista`
   - F1: `Data`
   - G1: `Horário`
   - H1: `Cidade`
   - I1: `Status`
   - J1: `Data Criação`

## 🔗 Passo 7: Compartilhar Planilha

1. Clique em "Compartilhar" no canto superior direito
2. Copie o email da conta de serviço do arquivo `credentials.json`
3. Cole o email no campo de compartilhamento
4. Selecione "Editor"
5. Desmarque "Notificar pessoas"
6. Clique em "Compartilhar"

## 🆔 Passo 8: Obter ID da Planilha

1. Abra a planilha no navegador
2. A URL será algo como: `https://docs.google.com/spreadsheets/d/ABC123XYZ/edit`
3. Copie a parte entre `/d/` e `/edit`: `ABC123XYZ`
4. Este é o seu `GOOGLE_SHEETS_SPREADSHEET_ID`

## ⚙️ Passo 9: Configurar Variáveis de Ambiente

1. Abra o arquivo `.env` na raiz do projeto
2. Atualize:
   ```
   GOOGLE_SHEETS_SPREADSHEET_ID=ABC123XYZ
   GOOGLE_SHEETS_CREDENTIALS_PATH=./credentials.json
   ```

## ✅ Passo 10: Testar a Integração

1. Inicie o servidor:
   ```bash
   npm run dev
   ```

2. Acesse `http://localhost:3000`

3. Crie um novo agendamento

4. Verifique se os dados aparecem na planilha Google Sheets

5. Se aparecerem, a integração está funcionando! ✅

## 🔄 Sincronização Automática

Quando um agendamento é criado, os dados são automaticamente adicionados à planilha:

```typescript
// Dados sincronizados
{
  id: "BK-1234567890",
  company_name: "Transportadora XYZ",
  vehicle_plate: "ABC-1234",
  invoice_number: "NF-000001",
  driver_name: "João Silva",
  booking_date: "2025-02-10",
  booking_time: "09:00",
  city: "Fortaleza",
  status: "confirmed",
  created_at: "2025-02-05T10:30:00Z"
}
```

## 🐛 Troubleshooting

### Erro: "Não foi possível autenticar com Google Sheets"

**Solução:**
1. Verifique se `credentials.json` existe
2. Verifique se o arquivo contém dados válidos
3. Verifique se a planilha foi compartilhada com o email da conta de serviço

### Erro: "Planilha não encontrada"

**Solução:**
1. Verifique o `GOOGLE_SHEETS_SPREADSHEET_ID`
2. Verifique se a planilha ainda existe
3. Verifique se a conta de serviço tem acesso

### Erro: "Aba 'Agendamentos' não encontrada"

**Solução:**
1. Verifique se a aba existe na planilha
2. Verifique se o nome está exatamente igual (case-sensitive)
3. Crie a aba se não existir

## 📝 Notas Importantes

- **Segurança**: Nunca compartilhe o arquivo `credentials.json`
- **Backup**: O arquivo `credentials.json` está no `.gitignore` por segurança
- **Produção**: Em produção, armazene as credenciais em variáveis de ambiente seguras
- **Limite de API**: Google Sheets tem limites de requisições. Para alto volume, considere usar fila de mensagens

## 🔐 Segurança em Produção

No Render ou outro serviço de hosting:

1. **Não faça upload de `credentials.json`**
2. **Armazene o conteúdo em variável de ambiente:**
   ```
   GOOGLE_SHEETS_CREDENTIALS={"type":"service_account",...}
   ```
3. **Leia da variável de ambiente:**
   ```typescript
   const credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS || '{}');
   ```

---

**Integração configurada com sucesso! 🎉**
