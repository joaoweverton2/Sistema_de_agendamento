#!/usr/bin/env node

/**
 * Script de Teste Automatizado - API de Agendamento
 * 
 * Este script testa todas as funcionalidades da API de forma automatizada.
 * 
 * Uso:
 *   node demo-api-test.mjs
 * 
 * Pré-requisito:
 *   - Servidor deve estar rodando: npm run dev
 *   - Porta 3000 deve estar disponível
 */

const BASE_URL = 'http://localhost:3000/api';
let testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

// Cores para output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function header(title) {
  console.log('\n' + '='.repeat(70));
  log(title, 'cyan');
  console.log('='.repeat(70) + '\n');
}

function test(name, passed, message = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  const color = passed ? 'green' : 'red';
  log(`${status}: ${name}`, color);
  if (message) log(`   ${message}`, 'yellow');
  
  testResults.tests.push({ name, passed, message });
  if (passed) testResults.passed++;
  else testResults.failed++;
}

async function apiCall(method, endpoint, body = null) {
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();
    
    return { status: response.status, data };
  } catch (error) {
    return { status: 0, error: error.message };
  }
}

async function runTests() {
  header('🧪 TESTES DE API - SISTEMA DE AGENDAMENTO');
  
  // ============= TESTE 1: LISTAR CIDADES =============
  header('1️⃣ Teste: Listar Cidades');
  
  const citiesRes = await apiCall('GET', '/cities');
  test(
    'GET /api/cities',
    citiesRes.status === 200 && Array.isArray(citiesRes.data) && citiesRes.data.length === 8,
    `Status: ${citiesRes.status}, Cidades: ${citiesRes.data?.length || 0}`
  );
  
  const cityId = citiesRes.data?.[0]?.id;
  log(`\n📍 Cidade selecionada para testes: ${citiesRes.data?.[0]?.city} (ID: ${cityId})`, 'blue');
  
  // ============= TESTE 2: CALENDÁRIO =============
  header('2️⃣ Teste: Calendário');
  
  const calendarRes = await apiCall('GET', '/calendar/CE/2025/2');
  test(
    'GET /api/calendar/CE/2025/2',
    calendarRes.status === 200 && Array.isArray(calendarRes.data),
    `Status: ${calendarRes.status}, Dias: ${calendarRes.data?.length || 0}`
  );
  
  // Encontrar um dia disponível
  const availableDay = calendarRes.data?.find(d => d.available);
  if (availableDay) {
    log(`\n📅 Dia disponível encontrado: ${availableDay.date}`, 'blue');
  }
  
  // ============= TESTE 3: HORÁRIOS =============
  header('3️⃣ Teste: Horários Disponíveis');
  
  const hoursRes = await apiCall('GET', `/hours/${availableDay?.date || '2025-02-10'}`);
  test(
    `GET /api/hours/${availableDay?.date || '2025-02-10'}`,
    hoursRes.status === 200 && Array.isArray(hoursRes.data?.hours),
    `Status: ${hoursRes.status}, Horários: ${hoursRes.data?.hours?.length || 0}`
  );
  
  // ============= TESTE 4: CRIAR AGENDAMENTO =============
  header('4️⃣ Teste: Criar Agendamento');
  
  const bookingData = {
    city_id: cityId,
    company_name: 'Transportadora Teste Demo',
    vehicle_plate: 'TST-0001',
    invoice_number: `NF-${Date.now()}`,
    driver_name: 'João Demo',
    booking_date: availableDay?.date || '2025-02-10',
    booking_time: '09:00'
  };
  
  const createRes = await apiCall('POST', '/bookings', bookingData);
  test(
    'POST /api/bookings',
    createRes.status === 201 && createRes.data?.id,
    `Status: ${createRes.status}, ID: ${createRes.data?.id}`
  );
  
  const bookingId = createRes.data?.id;
  log(`\n🎫 Agendamento criado: ${bookingId}`, 'blue');
  
  // ============= TESTE 5: OBTER AGENDAMENTO =============
  header('5️⃣ Teste: Obter Agendamento Específico');
  
  const getRes = await apiCall('GET', `/bookings/${bookingId}`);
  test(
    `GET /api/bookings/${bookingId}`,
    getRes.status === 200 && getRes.data?.id === bookingId,
    `Status: ${getRes.status}, Empresa: ${getRes.data?.company_name}`
  );
  
  // ============= TESTE 6: LISTAR AGENDAMENTOS =============
  header('6️⃣ Teste: Listar Todos os Agendamentos');
  
  const listRes = await apiCall('GET', '/bookings');
  test(
    'GET /api/bookings',
    listRes.status === 200 && Array.isArray(listRes.data),
    `Status: ${listRes.status}, Total: ${listRes.data?.length || 0}`
  );
  
  // ============= TESTE 7: AGENDAMENTOS POR CIDADE =============
  header('7️⃣ Teste: Agendamentos por Cidade');
  
  const cityBookingsRes = await apiCall('GET', `/bookings/city/${cityId}`);
  test(
    `GET /api/bookings/city/${cityId}`,
    cityBookingsRes.status === 200 && Array.isArray(cityBookingsRes.data),
    `Status: ${cityBookingsRes.status}, Agendamentos: ${cityBookingsRes.data?.length || 0}`
  );
  
  // ============= TESTE 8: REGISTRAR INDISPONIBILIDADE =============
  header('8️⃣ Teste: Registrar Indisponibilidade');
  
  const unavailabilityData = {
    pin: '1235',
    city_id: cityId,
    unavailable_date: '2025-02-20',
    unavailable_time: '10:00',
    reason: 'Teste de Indisponibilidade'
  };
  
  const unavailRes = await apiCall('POST', '/cdl/unavailability', unavailabilityData);
  test(
    'POST /api/cdl/unavailability (PIN correto)',
    unavailRes.status === 201,
    `Status: ${unavailRes.status}`
  );
  
  // ============= TESTE 9: PIN INVÁLIDO =============
  header('9️⃣ Teste: Validação de PIN');
  
  const invalidPinData = {
    pin: '9999',
    city_id: cityId,
    unavailable_date: '2025-02-21',
    unavailable_time: '11:00',
    reason: 'Teste PIN Inválido'
  };
  
  const invalidPinRes = await apiCall('POST', '/cdl/unavailability', invalidPinData);
  test(
    'POST /api/cdl/unavailability (PIN inválido)',
    invalidPinRes.status === 401,
    `Status: ${invalidPinRes.status}, Erro esperado`
  );
  
  // ============= TESTE 10: LISTAR INDISPONIBILIDADES =============
  header('🔟 Teste: Listar Indisponibilidades');
  
  const unavailListRes = await apiCall('GET', `/cdl/unavailabilities/${cityId}`);
  test(
    `GET /api/cdl/unavailabilities/${cityId}`,
    unavailListRes.status === 200 && Array.isArray(unavailListRes.data),
    `Status: ${unavailListRes.status}, Total: ${unavailListRes.data?.length || 0}`
  );
  
  // ============= TESTE 11: CRIAR SEGUNDO AGENDAMENTO =============
  header('1️⃣1️⃣ Teste: Criar Segundo Agendamento');
  
  const booking2Data = {
    city_id: cityId,
    company_name: 'Logística Brasil Demo',
    vehicle_plate: 'LOG-0002',
    invoice_number: `NF-${Date.now() + 1}`,
    driver_name: 'Maria Demo',
    booking_date: availableDay?.date || '2025-02-11',
    booking_time: '14:00'
  };
  
  const create2Res = await apiCall('POST', '/bookings', booking2Data);
  test(
    'POST /api/bookings (segundo)',
    create2Res.status === 201 && create2Res.data?.id,
    `Status: ${create2Res.status}, ID: ${create2Res.data?.id}`
  );
  
  const bookingId2 = create2Res.data?.id;
  
  // ============= TESTE 12: CANCELAR AGENDAMENTO =============
  header('1️⃣2️⃣ Teste: Cancelar Agendamento');
  
  const cancelRes = await apiCall('POST', `/bookings/${bookingId2}/cancel`, {
    reason: 'Cancelado para teste'
  });
  
  test(
    `POST /api/bookings/${bookingId2}/cancel`,
    cancelRes.status === 200,
    `Status: ${cancelRes.status}`
  );
  
  // ============= TESTE 13: VERIFICAR CANCELAMENTO =============
  header('1️⃣3️⃣ Teste: Verificar Status Cancelado');
  
  const checkCancelRes = await apiCall('GET', `/bookings/${bookingId2}`);
  test(
    'Verificar status = cancelled',
    checkCancelRes.data?.status === 'cancelled',
    `Status: ${checkCancelRes.data?.status}`
  );
  
  // ============= TESTE 14: FILTRAR POR STATUS =============
  header('1️⃣4️⃣ Teste: Filtrar por Status');
  
  const filterRes = await apiCall('GET', '/bookings?status=confirmed');
  test(
    'GET /api/bookings?status=confirmed',
    filterRes.status === 200 && Array.isArray(filterRes.data),
    `Status: ${filterRes.status}, Confirmados: ${filterRes.data?.length || 0}`
  );
  
  // ============= RESUMO =============
  header('📊 RESUMO DOS TESTES');
  
  const total = testResults.passed + testResults.failed;
  const percentage = Math.round((testResults.passed / total) * 100);
  
  log(`Total de testes: ${total}`, 'cyan');
  log(`✅ Passou: ${testResults.passed}`, 'green');
  log(`❌ Falhou: ${testResults.failed}`, testResults.failed > 0 ? 'red' : 'green');
  log(`📈 Taxa de sucesso: ${percentage}%`, percentage === 100 ? 'green' : 'yellow');
  
  if (testResults.failed === 0) {
    log('\n🎉 TODOS OS TESTES PASSARAM!', 'green');
  } else {
    log('\n⚠️  Alguns testes falharam. Verifique acima.', 'yellow');
  }
  
  // ============= DETALHES =============
  header('📋 DETALHES DOS TESTES');
  
  testResults.tests.forEach((t, i) => {
    const icon = t.passed ? '✅' : '❌';
    const color = t.passed ? 'green' : 'red';
    log(`${i + 1}. ${icon} ${t.name}`, color);
    if (t.message) log(`   ${t.message}`, 'yellow');
  });
  
  // ============= PRÓXIMOS PASSOS =============
  header('🚀 PRÓXIMOS PASSOS');
  
  log('1. Acesse http://localhost:3000 para ver a interface', 'blue');
  log('2. Crie agendamentos manualmente', 'blue');
  log('3. Teste os filtros e exportação', 'blue');
  log('4. Configure Google Sheets (opcional)', 'blue');
  log('5. Faça deploy no Render', 'blue');
  
  console.log('\n');
}

// Executar testes
runTests().catch(error => {
  log(`\n❌ Erro ao executar testes: ${error.message}`, 'red');
  process.exit(1);
});
