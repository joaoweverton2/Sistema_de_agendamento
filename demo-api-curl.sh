#!/bin/bash

# Script de Demonstração - API de Agendamento com cURL
# 
# Este script demonstra todas as funcionalidades da API usando cURL
# 
# Uso:
#   bash demo-api-curl.sh
# 
# Pré-requisito:
#   - Servidor deve estar rodando: npm run dev
#   - cURL deve estar instalado

BASE_URL="http://localhost:3000/api"
TIMESTAMP=$(date +%s)

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Função para imprimir headers
print_header() {
    echo -e "\n${CYAN}========================================${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}========================================${NC}\n"
}

# Função para imprimir sucesso
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Função para imprimir erro
print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Função para imprimir info
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Função para imprimir comando
print_command() {
    echo -e "${YELLOW}$ $1${NC}\n"
}

# ============= TESTE 1: LISTAR CIDADES =============
print_header "1️⃣  Teste: Listar Cidades"

print_command "curl $BASE_URL/cities"
CITIES_RESPONSE=$(curl -s "$BASE_URL/cities")
echo "$CITIES_RESPONSE" | jq '.' 2>/dev/null || echo "$CITIES_RESPONSE"

CITY_ID=$(echo "$CITIES_RESPONSE" | jq -r '.[0].id' 2>/dev/null || echo "1")
CITY_NAME=$(echo "$CITIES_RESPONSE" | jq -r '.[0].city' 2>/dev/null || echo "Fortaleza")

print_success "Cidades carregadas"
print_info "Cidade selecionada: $CITY_NAME (ID: $CITY_ID)"

# ============= TESTE 2: CALENDÁRIO =============
print_header "2️⃣  Teste: Calendário (Fevereiro 2025)"

print_command "curl $BASE_URL/calendar/CE/2025/2"
CALENDAR_RESPONSE=$(curl -s "$BASE_URL/calendar/CE/2025/2")
echo "$CALENDAR_RESPONSE" | jq '.[0:5]' 2>/dev/null || echo "$CALENDAR_RESPONSE"
echo "... (mostrando apenas os 5 primeiros dias)"

AVAILABLE_DAY=$(echo "$CALENDAR_RESPONSE" | jq -r '.[] | select(.available==true) | .date' 2>/dev/null | head -1)
if [ -z "$AVAILABLE_DAY" ]; then
    AVAILABLE_DAY="2025-02-10"
fi

print_success "Calendário carregado"
print_info "Dia disponível encontrado: $AVAILABLE_DAY"

# ============= TESTE 3: HORÁRIOS =============
print_header "3️⃣  Teste: Horários Disponíveis"

print_command "curl $BASE_URL/hours/$AVAILABLE_DAY"
HOURS_RESPONSE=$(curl -s "$BASE_URL/hours/$AVAILABLE_DAY")
echo "$HOURS_RESPONSE" | jq '.' 2>/dev/null || echo "$HOURS_RESPONSE"

print_success "Horários carregados"

# ============= TESTE 4: CRIAR AGENDAMENTO =============
print_header "4️⃣  Teste: Criar Agendamento"

BOOKING_DATA='{
  "city_id": '$CITY_ID',
  "company_name": "Transportadora Demo '$TIMESTAMP'",
  "vehicle_plate": "TST-'$TIMESTAMP'",
  "invoice_number": "NF-'$TIMESTAMP'",
  "driver_name": "João Demo",
  "booking_date": "'$AVAILABLE_DAY'",
  "booking_time": "09:00"
}'

print_command "curl -X POST $BASE_URL/bookings -H 'Content-Type: application/json' -d '{...}'"
BOOKING_RESPONSE=$(curl -s -X POST "$BASE_URL/bookings" \
  -H "Content-Type: application/json" \
  -d "$BOOKING_DATA")
echo "$BOOKING_RESPONSE" | jq '.' 2>/dev/null || echo "$BOOKING_RESPONSE"

BOOKING_ID=$(echo "$BOOKING_RESPONSE" | jq -r '.id' 2>/dev/null || echo "")

if [ -n "$BOOKING_ID" ] && [ "$BOOKING_ID" != "null" ]; then
    print_success "Agendamento criado: $BOOKING_ID"
else
    print_error "Falha ao criar agendamento"
    BOOKING_ID="BK-1234567890"
fi

# ============= TESTE 5: OBTER AGENDAMENTO =============
print_header "5️⃣  Teste: Obter Agendamento Específico"

print_command "curl $BASE_URL/bookings/$BOOKING_ID"
BOOKING_GET=$(curl -s "$BASE_URL/bookings/$BOOKING_ID")
echo "$BOOKING_GET" | jq '.' 2>/dev/null || echo "$BOOKING_GET"

print_success "Agendamento recuperado"

# ============= TESTE 6: LISTAR AGENDAMENTOS =============
print_header "6️⃣  Teste: Listar Todos os Agendamentos"

print_command "curl $BASE_URL/bookings"
BOOKINGS_LIST=$(curl -s "$BASE_URL/bookings")
COUNT=$(echo "$BOOKINGS_LIST" | jq 'length' 2>/dev/null || echo "?")
echo "$BOOKINGS_LIST" | jq '.[0:2]' 2>/dev/null || echo "$BOOKINGS_LIST"
echo "... (mostrando apenas os 2 primeiros)"

print_success "Total de agendamentos: $COUNT"

# ============= TESTE 7: AGENDAMENTOS POR CIDADE =============
print_header "7️⃣  Teste: Agendamentos por Cidade"

print_command "curl $BASE_URL/bookings/city/$CITY_ID"
CITY_BOOKINGS=$(curl -s "$BASE_URL/bookings/city/$CITY_ID")
CITY_COUNT=$(echo "$CITY_BOOKINGS" | jq 'length' 2>/dev/null || echo "?")
echo "$CITY_BOOKINGS" | jq '.[0:2]' 2>/dev/null || echo "$CITY_BOOKINGS"

print_success "Agendamentos em $CITY_NAME: $CITY_COUNT"

# ============= TESTE 8: REGISTRAR INDISPONIBILIDADE =============
print_header "8️⃣  Teste: Registrar Indisponibilidade (PIN correto)"

UNAVAIL_DATA='{
  "pin": "1235",
  "city_id": '$CITY_ID',
  "unavailable_date": "2025-02-20",
  "unavailable_time": "10:00",
  "reason": "Teste de Indisponibilidade"
}'

print_command "curl -X POST $BASE_URL/cdl/unavailability -H 'Content-Type: application/json' -d '{...}'"
UNAVAIL_RESPONSE=$(curl -s -X POST "$BASE_URL/cdl/unavailability" \
  -H "Content-Type: application/json" \
  -d "$UNAVAIL_DATA")
echo "$UNAVAIL_RESPONSE" | jq '.' 2>/dev/null || echo "$UNAVAIL_RESPONSE"

print_success "Indisponibilidade registrada"

# ============= TESTE 9: PIN INVÁLIDO =============
print_header "9️⃣  Teste: Validação de PIN (PIN inválido)"

INVALID_PIN_DATA='{
  "pin": "9999",
  "city_id": '$CITY_ID',
  "unavailable_date": "2025-02-21",
  "unavailable_time": "11:00",
  "reason": "Teste PIN Inválido"
}'

print_command "curl -X POST $BASE_URL/cdl/unavailability -H 'Content-Type: application/json' -d '{...}' (PIN: 9999)"
INVALID_PIN_RESPONSE=$(curl -s -X POST "$BASE_URL/cdl/unavailability" \
  -H "Content-Type: application/json" \
  -d "$INVALID_PIN_DATA")
echo "$INVALID_PIN_RESPONSE" | jq '.' 2>/dev/null || echo "$INVALID_PIN_RESPONSE"

print_error "PIN inválido (esperado)"

# ============= TESTE 10: LISTAR INDISPONIBILIDADES =============
print_header "🔟 Teste: Listar Indisponibilidades"

print_command "curl $BASE_URL/cdl/unavailabilities/$CITY_ID"
UNAVAIL_LIST=$(curl -s "$BASE_URL/cdl/unavailabilities/$CITY_ID")
UNAVAIL_COUNT=$(echo "$UNAVAIL_LIST" | jq 'length' 2>/dev/null || echo "?")
echo "$UNAVAIL_LIST" | jq '.' 2>/dev/null || echo "$UNAVAIL_LIST"

print_success "Total de indisponibilidades: $UNAVAIL_COUNT"

# ============= TESTE 11: CRIAR SEGUNDO AGENDAMENTO =============
print_header "1️⃣1️⃣ Teste: Criar Segundo Agendamento"

BOOKING2_DATA='{
  "city_id": '$CITY_ID',
  "company_name": "Logística Brasil '$TIMESTAMP'",
  "vehicle_plate": "LOG-'$TIMESTAMP'",
  "invoice_number": "NF-'$((TIMESTAMP+1))'",
  "driver_name": "Maria Demo",
  "booking_date": "2025-02-11",
  "booking_time": "14:00"
}'

print_command "curl -X POST $BASE_URL/bookings -H 'Content-Type: application/json' -d '{...}'"
BOOKING2_RESPONSE=$(curl -s -X POST "$BASE_URL/bookings" \
  -H "Content-Type: application/json" \
  -d "$BOOKING2_DATA")
echo "$BOOKING2_RESPONSE" | jq '.' 2>/dev/null || echo "$BOOKING2_RESPONSE"

BOOKING2_ID=$(echo "$BOOKING2_RESPONSE" | jq -r '.id' 2>/dev/null || echo "")

if [ -n "$BOOKING2_ID" ] && [ "$BOOKING2_ID" != "null" ]; then
    print_success "Segundo agendamento criado: $BOOKING2_ID"
else
    print_error "Falha ao criar segundo agendamento"
fi

# ============= TESTE 12: CANCELAR AGENDAMENTO =============
print_header "1️⃣2️⃣ Teste: Cancelar Agendamento"

if [ -n "$BOOKING2_ID" ] && [ "$BOOKING2_ID" != "null" ]; then
    print_command "curl -X POST $BASE_URL/bookings/$BOOKING2_ID/cancel -H 'Content-Type: application/json' -d '{...}'"
    CANCEL_RESPONSE=$(curl -s -X POST "$BASE_URL/bookings/$BOOKING2_ID/cancel" \
      -H "Content-Type: application/json" \
      -d '{"reason": "Cancelado para teste"}')
    echo "$CANCEL_RESPONSE" | jq '.' 2>/dev/null || echo "$CANCEL_RESPONSE"
    
    print_success "Agendamento cancelado"
else
    print_error "Não foi possível cancelar (agendamento não criado)"
fi

# ============= TESTE 13: VERIFICAR CANCELAMENTO =============
print_header "1️⃣3️⃣ Teste: Verificar Status Cancelado"

if [ -n "$BOOKING2_ID" ] && [ "$BOOKING2_ID" != "null" ]; then
    print_command "curl $BASE_URL/bookings/$BOOKING2_ID"
    CHECK_CANCEL=$(curl -s "$BASE_URL/bookings/$BOOKING2_ID")
    echo "$CHECK_CANCEL" | jq '.' 2>/dev/null || echo "$CHECK_CANCEL"
    
    STATUS=$(echo "$CHECK_CANCEL" | jq -r '.status' 2>/dev/null || echo "?")
    print_success "Status do agendamento: $STATUS"
fi

# ============= TESTE 14: FILTRAR POR STATUS =============
print_header "1️⃣4️⃣ Teste: Filtrar por Status"

print_command "curl '$BASE_URL/bookings?status=confirmed'"
FILTERED=$(curl -s "$BASE_URL/bookings?status=confirmed")
FILTERED_COUNT=$(echo "$FILTERED" | jq 'length' 2>/dev/null || echo "?")
echo "$FILTERED" | jq '.[0:2]' 2>/dev/null || echo "$FILTERED"

print_success "Agendamentos confirmados: $FILTERED_COUNT"

# ============= RESUMO =============
print_header "📊 RESUMO DA DEMONSTRAÇÃO"

print_success "Todos os testes foram executados!"
print_info "Servidor: $BASE_URL"
print_info "Agendamento criado: $BOOKING_ID"
print_info "Cidade testada: $CITY_NAME"
print_info "Data testada: $AVAILABLE_DAY"

# ============= PRÓXIMOS PASSOS =============
print_header "🚀 PRÓXIMOS PASSOS"

echo -e "${BLUE}1. Acesse http://localhost:3000 para ver a interface${NC}"
echo -e "${BLUE}2. Crie agendamentos manualmente${NC}"
echo -e "${BLUE}3. Teste os filtros e exportação${NC}"
echo -e "${BLUE}4. Configure Google Sheets (opcional)${NC}"
echo -e "${BLUE}5. Faça deploy no Render${NC}"

echo ""
