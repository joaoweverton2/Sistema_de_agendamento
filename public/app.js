// ============= CONSTANTES =============
const API_URL = '/api';
const HOURS = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];
const CITIES = {
    'CE': { id: 1, name: 'Fortaleza', state: 'CE', address: 'Parque Empresarial BR 116 CE-402, 25300 - Parque Iracema, Fortaleza/CE | CEP 60824-116', manager: 'Jéssica Portela', contact: '(21) 96552-5960' },
    'PB': { id: 2, name: 'João Pessoa', state: 'PB', address: 'Rua Virginia Maria de Oliveira, 131 - Água Fria, João Pessoa/PB | CEP 58053-006', manager: 'Pierre Silva', contact: '(83) 9 9401-2453' },
    'RN': { id: 3, name: 'Natal', state: 'RN', address: 'Rua Professor Francisco Luciano de Oliveira, 2458 - Calendária, Natal/RN | CEP 59080-000', manager: 'Clenilson Oliveira', contact: '(84) 9 9997-7346' },
    'BA': { id: 4, name: 'Eunápolis', state: 'BA', address: 'Av Alcides Lacerda, 476 - Arivaldo Reis, Eunápolis/BA | CEP 45826-204', manager: 'Lazaro Santos', contact: '(73) 9 8173-4045' },
    'MG': { id: 5, name: 'Poços de Caldas', state: 'MG', address: 'Rua Julia Scassiotti, 220 - Jardim Paraiso, Poços de Caldas/MG | CEP 37706-142', manager: 'Guilherme Alexandre', contact: '(35) 9 9959-2932' },
    'SP-Ourinhos': { id: 6, name: 'Ourinhos', state: 'SP', address: 'Avenida Luiz Saldanha Rodrigues, 2751 - Nova Ourinhos, Ourinhos/SP | CEP 19907-510', manager: 'Gustavo Rosa', contact: '(14) 9 9801-2496' },
    'SP-Itupeva': { id: 7, name: 'Itupeva', state: 'SP', address: 'Rua Pref. José Carlos, 321 - Bairro do Pinheirinho, Itupeva/SP | CEP 13295-620', manager: 'Fernanda Figueiredo', contact: '(35) 9 9948-4369' },
    'SP-Registro': { id: 8, name: 'Registro', state: 'SP', address: 'Rua Amapá, 142 - Vila Cabral, Registro/SP | CEP 11900-971', manager: 'Gustavo Rosa', contact: '(14) 9 9801-2496' }
};

// ============= ESTADO GLOBAL =============
let state = {
    selectedState: null,
    selectedDate: null,
    selectedTime: null,
    currentBookings: [],
    unavailabilities: []
};

// ============= INICIALIZAÇÃO =============
document.addEventListener('DOMContentLoaded', () => {
    loadBookings();
});

// ============= FUNÇÕES AUXILIARES DE DATA =============
function formatBrazilianDate(dateStr) {
    // dateStr está no formato YYYY-MM-DD
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-').map(Number);
    // Criar data no fuso horário local para evitar problemas
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function formatBrazilianDateTime(dateStr, timeStr = '') {
    // dateStr está no formato YYYY-MM-DD
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-').map(Number);
    // Criar data no fuso horário local para evitar problemas
    const date = new Date(year, month - 1, day);
    
    const dateFormatted = date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    
    if (timeStr) {
        return `${dateFormatted} às ${timeStr}`;
    }
    return dateFormatted;
}

function formatBrazilianDateLong(dateStr) {
    // dateStr está no formato YYYY-MM-DD
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-').map(Number);
    // Criar data no fuso horário local para evitar problemas
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// ============= CALENDÁRIO =============
function onStateChange() {
    const stateSelect = document.getElementById('state-select');
    state.selectedState = stateSelect.value;
    state.selectedDate = null;
    state.selectedTime = null;
    
    if (state.selectedState) {
        // Ponto 8: Atualizar rodapé com dados do CD
        const cdData = CITIES[state.selectedState];
        document.getElementById('cd-address').textContent = cdData.address;
        document.getElementById('cd-manager').textContent = cdData.manager;
        document.getElementById('cd-contact').textContent = cdData.contact;
        document.getElementById('cd-footer-info').classList.add('active');

        // Carregar agendamentos e indisponibilidades antes de renderizar
        Promise.all([
            fetch(`${API_URL}/bookings`).then(res => res.json()),
            fetch(`${API_URL}/cdl/unavailabilities/${CITIES[state.selectedState].id}`).then(res => res.json())
        ]).then(([bookings, unavailabilities]) => {
            state.currentBookings = bookings;
            state.unavailabilities = unavailabilities;
            renderCalendar();
        }).catch(err => {
            console.error('Erro ao carregar dados:', err);
            renderCalendar();
        });
    } else {
        document.getElementById('calendar-container').innerHTML = '';
        document.getElementById('cd-footer-info').classList.remove('active');
    }
}

function renderCalendar() {
    const container = document.getElementById('calendar-container');
    container.innerHTML = '';
    
    const today = new Date();
    // Ponto 5: Agendamentos sempre em D+1
    const minDate = new Date(today);
    minDate.setDate(today.getDate() + 1);
    
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Renderizar 2 meses
    for (let monthOffset = 0; monthOffset < 2; monthOffset++) {
        const month = (currentMonth + monthOffset) % 12;
        const year = currentYear + Math.floor((currentMonth + monthOffset) / 12);
        
        const monthGrid = createMonthGrid(year, month);
        container.appendChild(monthGrid);
    }
}

function createMonthGrid(year, month) {
    const monthDiv = document.createElement('div');
    monthDiv.className = 'calendar-grid';
    
    // Cabeçalho com mês/ano
    const monthHeader = document.createElement('div');
    monthHeader.style.gridColumn = '1 / -1';
    monthHeader.style.fontSize = '18px';
    monthHeader.style.fontWeight = '600';
    monthHeader.style.padding = '15px 0';
    monthHeader.style.textAlign = 'center';
    monthHeader.style.color = '#2c3e50';
    monthHeader.textContent = new Date(year, month).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    monthDiv.appendChild(monthHeader);
    
    // Dias da semana
    const weekdays = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
    weekdays.forEach(day => {
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-weekday';
        dayEl.textContent = day;
        monthDiv.appendChild(dayEl);
    });
    
    // Dias do mês
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    
    // Dias vazios antes do primeiro dia
    for (let i = 0; i < firstDay; i++) {
        const emptyDiv = document.createElement('div');
        monthDiv.appendChild(emptyDiv);
    }
    
    // Dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dayEl = createDayElement(date, today);
        monthDiv.appendChild(dayEl);
    }
    
    return monthDiv;
}

function createDayElement(date, today) {
    const dayEl = document.createElement('div');
    dayEl.className = 'calendar-day';
    
    const dayNumber = date.getDate();
    const dayOfWeek = date.toLocaleDateString('pt-BR', { weekday: 'short' });
    
    // Criar data no formato correto sem problemas de fuso horário
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    console.log(`Data clicada: ${date.toDateString()}, DateStr: ${dateStr}, Day: ${dayNumber}`);
    
    // Ponto 5: Agendamentos sempre em D+1
    const minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const isPast = dateStart < minDate;
    
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const isHoliday = checkHoliday(date);
    const isUnavailable = checkUnavailability(dateStr);
    
    const isDisabled = isPast || isWeekend || isHoliday || isUnavailable;
    
    if (isDisabled) {
        dayEl.classList.add('unavailable');
    }
    
    // Conteúdo do dia
    const dayNumberEl = document.createElement('div');
    dayNumberEl.className = 'calendar-day-number';
    dayNumberEl.textContent = dayNumber;
    
    const dayWeekdayEl = document.createElement('div');
    dayWeekdayEl.className = 'calendar-day-weekday';
    dayWeekdayEl.textContent = dayOfWeek.toUpperCase();
    
    dayEl.appendChild(dayNumberEl);
    dayEl.appendChild(dayWeekdayEl);
    
    // Tooltip com horários
    if (!isDisabled) {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        
        const hoursDiv = document.createElement('div');
        hoursDiv.className = 'tooltip-hours';
        
        HOURS.forEach(hour => {
            const hourEl = document.createElement('div');
            hourEl.className = 'tooltip-hour';
            
            // Verificar se o horário já passou para o dia de hoje
            const [h, m] = hour.split(':').map(Number);
            const hourDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), h, m);
            const todayHour = new Date(today.getFullYear(), today.getMonth(), today.getDate(), today.getHours(), today.getMinutes());
            const isPastHour = hourDate < todayHour;
            
            // Verificar se o horário já está agendado para esta cidade/data
            const cityId = CITIES[state.selectedState].id;
            const isBooked = state.currentBookings.some(b => 
                b.city_id === cityId && 
                b.booking_date === dateStr && 
                b.booking_time === hour &&
                b.status === 'confirmed'
            );
            
            if (isPastHour) {
                hourEl.classList.add('past');
            } else if (isBooked) {
                hourEl.classList.add('booked');
            }
            
            hourEl.textContent = hour;
            hourEl.onclick = (e) => {
                e.stopPropagation();
                if (!isPastHour && !isBooked) {
                    selectDateTime(dateStr, hour);
                }
            };
            hoursDiv.appendChild(hourEl);
        });
        
        tooltip.appendChild(hoursDiv);
        dayEl.appendChild(tooltip);
    }
    
    return dayEl;
}

function checkHoliday(date) {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // Feriados nacionais
    const nationalHolidays = [
        [1, 1],   // Ano Novo
        [4, 21],  // Tiradentes
        [5, 1],   // Dia do Trabalho
        [9, 7],   // Independência
        [10, 12], // Nossa Senhora Aparecida
        [11, 2],  // Finados
        [11, 20], // Consciência Negra
        [12, 25]  // Natal
    ];
    
    // Feriados estaduais
    const stateHolidays = {
        'CE': [[3, 19]], // São José
        'PB': [[8, 5]], // Nossa Senhora das Neves
        'RN': [[12, 3]], // Santo Antônio
        'BA': [[11, 2]], // Finados
        'MG': [[12, 8]], // Nossa Senhora da Conceição
        'SP': [[11, 20]] // Consciência Negra
    };
    
    // Verificar feriados nacionais
    for (const [m, d] of nationalHolidays) {
        if (m === month && d === day) return true;
    }
    
    // Verificar feriados estaduais
    const stateCode = state.selectedState?.split('-')[0];
    if (stateCode && stateHolidays[stateCode]) {
        for (const [m, d] of stateHolidays[stateCode]) {
            if (m === month && d === day) return true;
        }
    }
    
    return false;
}

function checkUnavailability(dateStr) {
    return state.unavailabilities.some(u => u.unavailable_date === dateStr);
}

function selectDateTime(dateStr, time) {
    console.log(`selectDateTime chamado com: ${dateStr} ${time}`);
    
    state.selectedDate = dateStr;
    state.selectedTime = time;
    
    // Usar a função auxiliar para formatar corretamente
    const dateFormatted = formatBrazilianDateTime(dateStr, time);
    
    document.getElementById('selected-datetime').textContent = dateFormatted;
    
    // Resetar o select de turno para a opção de hora
    document.getElementById('shift-select').value = 'hour';
    
    // Mostrar formulário
    showSection('booking-form-section');
}

// ============= FORMULÁRIO DE AGENDAMENTO =============
function updateShiftDisplay() {
    const shiftSelect = document.getElementById('shift-select').value;
    const selectedDatetimeDiv = document.getElementById('selected-datetime');
    
    if (!state.selectedDate) return;
    
    // Usar a função auxiliar para formatar corretamente
    const dateFormatted = formatBrazilianDate(state.selectedDate);
    
    if (shiftSelect === 'morning') {
        selectedDatetimeDiv.innerHTML = `${dateFormatted} - Turno da Manhã (08:00 - 11:00)`;
    } else if (shiftSelect === 'afternoon') {
        selectedDatetimeDiv.innerHTML = `${dateFormatted} - Turno da Tarde (13:00 - 16:00)`;
    } else if (shiftSelect === 'hour') {
        selectedDatetimeDiv.innerHTML = `${dateFormatted} às ${state.selectedTime}`;
    }
}

function submitBooking(event) {
    event.preventDefault();
    
    const companyName = document.getElementById('company-name').value;
    const supplier = document.getElementById('supplier').value;
    const vehiclePlate = document.getElementById('vehicle-plate').value;
    const invoiceNumber = document.getElementById('invoice-number').value;
    const driverName = document.getElementById('driver-name').value;
    const shiftSelect = document.getElementById('shift-select').value;
    
    const cityId = CITIES[state.selectedState].id;
    
    // Debug: verificar os valores antes de enviar
    console.log('Data selecionada:', state.selectedDate);
    console.log('Horário selecionado:', state.selectedTime);
    console.log('Turno selecionado:', shiftSelect);
    
    // Determinar qual horário reservar baseado no turno selecionado
    let bookingTimes = [];
    if (shiftSelect === 'morning') {
        bookingTimes = ['08:00', '09:00', '10:00', '11:00'];
    } else if (shiftSelect === 'afternoon') {
        bookingTimes = ['13:00', '14:00', '15:00', '16:00'];
    } else if (shiftSelect === 'hour') {
        bookingTimes = [state.selectedTime];
    }
    
    // Criar agendamentos para cada horário do turno
    const bookingPromises = bookingTimes.map(time => {
        const bookingData = {
            city_id: cityId,
            company_name: companyName,
            supplier: supplier,
            vehicle_plate: vehiclePlate,
            invoice_number: invoiceNumber,
            driver_name: driverName,
            booking_date: state.selectedDate,
            booking_time: time
        };
        
        console.log('Enviando dados:', bookingData);
        
        return fetch(`${API_URL}/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingData)
        }).then(res => res.json());
    });
    
    Promise.all(bookingPromises)
        .then(results => {
            const firstResult = results[0];
            if (firstResult.id) {
                showProtocolModal(firstResult.protocol);
                document.getElementById('booking-form').reset();
                
                fetch(`${API_URL}/bookings`)
                    .then(res => res.json())
                    .then(bookings => {
                        state.currentBookings = bookings;
                        renderCalendar();
                    });
            } else {
                showNotification('Erro ao criar agendamento', 'error');
            }
        })
        .catch(err => {
            console.error('Erro:', err);
            showNotification('Erro ao conectar com o servidor', 'error');
        });
    return;
}

function generateProtocol(date, time, bookingId) {
    // Esta função agora é usada apenas para exibição se o protocolo não estiver no objeto booking
    // O protocolo real é gerado no servidor com letras aleatórias (Ponto 6)
    const dateStr = date.replace(/-/g, '');
    const timeStr = time.replace(':', '');
    return `BK-${dateStr}-${timeStr}`;
}

function showProtocolModal(protocol) {
    document.getElementById('protocol-number').textContent = protocol;
    document.getElementById('protocol-modal').classList.remove('hidden');
}

function closeProtocolModal() {
    document.getElementById('protocol-modal').classList.add('hidden');
    goBackToCalendar();
}

// ============= NAVEGAÇÃO =============
function goBackToCalendar() {
    showSection('calendar-section');
    state.selectedDate = null;
    state.selectedTime = null;
}

function goToMyBookings() {
    showSection('my-bookings-section');
    loadBookings();
}

function showSection(sectionId) {
    // Esconder todas as seções
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Mostrar seção desejada
    document.getElementById(sectionId).classList.add('active');
    
    // Resetar o select de turnos se for para o calendário
    if (sectionId === 'calendar-section') {
        document.getElementById('shift-select').value = '';
    }
}

// ============= MEUS AGENDAMENTOS =============
function loadBookings() {
    fetch(`${API_URL}/bookings`)
        .then(res => res.json())
        .then(data => {
            state.currentBookings = data;
            // Não renderizar automaticamente - esperar pelo termo de busca
            const searchTerm = document.getElementById('search-protocol').value.trim();
            if (searchTerm) {
                searchBookings(); // Se já há um termo de busca, refazer a busca
            } else {
                renderBookings([]); // Caso contrário, mostrar mensagem padrão
            }
        })
        .catch(err => console.error(err));
}

function renderBookings(bookings) {
    const list = document.getElementById('bookings-list');
    const searchTerm = document.getElementById('search-protocol').value.trim();
    
    // Se não há termo de busca, mostrar mensagem
    if (!searchTerm) {
        list.innerHTML = '<p style="padding: 40px; text-align: center; color: #7f8c8d;">Digite o número do protocolo para visualizar seu agendamento.</p>';
        return;
    }
    
    // Se bookings é um array vazio (não encontrou resultados)
    if (!bookings || bookings.length === 0) {
        list.innerHTML = '<p style="padding: 40px; text-align: center; color: #e74c3c; font-weight: 600;">Nenhum agendamento encontrado para este protocolo.</p>';
        return;
    }
    
    // Se chegou aqui, bookings contém os resultados filtrados
    list.innerHTML = bookings.map(booking => {
        const protocol = booking.protocol || generateProtocol(booking.booking_date, booking.booking_time, booking.id);
        // Usar formatação consistente
        const date = formatBrazilianDate(booking.booking_date);
        const canCancel = canCancelBooking(booking.created_at);
        
        return `
            <div class="booking-card">
                <div class="booking-info">
                    <div class="booking-protocol">Protocolo: ${protocol}</div>
                    <div class="booking-company">${booking.company_name}</div>
                    <div class="booking-details">
                        Fornecedor: ${booking.supplier || 'N/A'} | NF: ${booking.invoice_number} | Motorista: ${booking.driver_name} | 
                        ${date} às ${booking.booking_time}
                    </div>
                </div>
                <div class="booking-status ${booking.status}">
                    ${booking.status === 'confirmed' ? 'Confirmado' : 'Cancelado'}
                </div>
                <div class="booking-actions">
                    ${booking.status === 'confirmed' && canCancel ? `
                        <button class="btn-action btn-cancel" onclick="cancelBooking('${booking.id}')">
                            Cancelar
                        </button>
                        <button class="btn-action btn-edit" onclick="editBooking('${booking.id}')">
                            Alterar
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

function searchBookings() {
    const searchTerm = document.getElementById('search-protocol').value.trim().toLowerCase();
    
    if (!searchTerm) {
        renderBookings([]);
        return;
    }
    
    // Filtrar APENAS os agendamentos que correspondem ao protocolo buscado
    const filtered = state.currentBookings.filter(booking => {
        const protocol = booking.protocol || generateProtocol(booking.booking_date, booking.booking_time, booking.id);
        // Busca exata para maior segurança
        return protocol.toLowerCase() === searchTerm;
    });
    
    renderBookings(filtered);
}

function canCancelBooking(createdAt) {
    // Ponto 4: Remover o tempo para alteração dos agendamentos
    return true;
}

function cancelBooking(bookingId) {
    if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
        fetch(`${API_URL}/bookings/${bookingId}/cancel`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reason: 'Cancelado pelo fornecedor' })
        })
        .then(res => res.json())
        .then(data => {
            showNotification('Agendamento cancelado com sucesso', 'success');
            
            // Atualizar a lista de agendamentos local
            const index = state.currentBookings.findIndex(b => b.id == bookingId);
            if (index !== -1) {
                state.currentBookings[index].status = 'cancelled';
            }
            
            // Re-renderizar APENAS os agendamentos filtrados
            const searchTerm = document.getElementById('search-protocol').value.trim().toLowerCase();
            if (searchTerm) {
                const filtered = state.currentBookings.filter(booking => {
                    const protocol = booking.protocol || generateProtocol(booking.booking_date, booking.booking_time, booking.id);
                    return protocol.toLowerCase() === searchTerm;
                });
                renderBookings(filtered);
            } else {
                renderBookings([]);
            }
        })
        .catch(err => {
            console.error(err);
            showNotification('Erro ao cancelar agendamento', 'error');
        });
    }
}

function editBooking(bookingId) {
    if (confirm('Para alterar, você criará um novo agendamento. O agendamento atual será CANCELADO. Deseja continuar?')) {
        // Primeiro, cancelar o agendamento atual
        fetch(`${API_URL}/bookings/${bookingId}/cancel`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reason: 'Alteração para novo agendamento' })
        })
        .then(res => {
            if (!res.ok) throw new Error('Erro ao cancelar agendamento');
            return res.json();
        })
        .then(data => {
            showNotification('Agendamento anterior cancelado. Agora crie o novo agendamento.', 'success');
            
            // Atualizar a lista de agendamentos local
            const index = state.currentBookings.findIndex(b => b.id == bookingId);
            if (index !== -1) {
                state.currentBookings[index].status = 'cancelled';
            }
            
            // Limpar campos do formulário caso haja dados antigos
            document.getElementById('company-name').value = '';
            document.getElementById('vehicle-plate').value = '';
            document.getElementById('invoice-number').value = '';
            document.getElementById('driver-name').value = '';
            
            // Limpar o campo de busca
            document.getElementById('search-protocol').value = '';
            
            // Recarregar TODOS os agendamentos do servidor para garantir consistência
            fetch(`${API_URL}/bookings`)
                .then(res => res.json())
                .then(bookings => {
                    state.currentBookings = bookings;
                    // Mostrar mensagem de que não há busca
                    renderBookings([]);
                    
                    // Ir para o calendário para criar novo agendamento
                    setTimeout(() => {
                        goBackToCalendar();
                        showNotification('Selecione a nova data e horário para o agendamento.', 'info');
                    }, 500);
                });
        })
        .catch(err => {
            console.error(err);
            showNotification('Erro ao processar alteração', 'error');
        });
    }
}

// ============= CDL MANAGEMENT =============
function showCDLAccess() {
    showSection('cdl-section');
}

function submitCDLForm(event) {
    event.preventDefault();
    
    const pin = document.getElementById('cdl-pin').value;
    const stateVal = document.getElementById('cdl-state').value;
    const date = document.getElementById('cdl-date').value;
    const reason = document.getElementById('cdl-reason').value;
    
    const cityId = CITIES[stateVal].id;
    
    const data = {
        pin: pin,
        city_id: cityId,
        unavailable_date: date,
        unavailable_time: null, // Sempre nulo para comprometer o dia inteiro
        reason: reason
    };
    
    fetch(`${API_URL}/cdl/unavailability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(data => {
        if (data.message) {
            showNotification('Indisponibilidade registrada com sucesso', 'success');
            document.getElementById('cdl-form').reset();
            loadUnavailabilities();
        } else {
            showNotification(data.error || 'Erro ao registrar indisponibilidade', 'error');
        }
    })
    .catch(err => {
        console.error(err);
        showNotification('Erro ao conectar com o servidor', 'error');
    });
}

function loadUnavailabilities() {
    if (!state.selectedState) return;
    
    const cityId = CITIES[state.selectedState].id;
    
    fetch(`${API_URL}/cdl/unavailabilities/${cityId}`)
        .then(res => res.json())
        .then(data => {
            state.unavailabilities = data;
            renderCalendar(); // Renderizar após carregar as indisponibilidades
        })
        .catch(err => {
            console.error(err);
            renderCalendar(); // Renderizar mesmo se falhar
        });
}

// ============= NOTIFICAÇÕES =============
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification show ${type}`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// ============= UTILITÁRIOS =============
function formatDate(dateStr) {
    return formatBrazilianDate(dateStr);
}

function formatTime(timeStr) {
    return timeStr;
}