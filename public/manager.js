// ============= CONSTANTES =============
const API_URL = '/api';
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
    currentBookings: [],
    weekOffset: 0 // Controla qual semana esta sendo exibida (0 = semana atual, 1 = proxima, -1 = anterior)
};

// ============= INICIALIZAÇÃO =============
document.addEventListener('DOMContentLoaded', function() {
    loadManagerData();
});

// ============= VISÃO GERENCIAL (ESTILO TEAMS) =============
function loadManagerData() {
    const selectedUF = document.getElementById('manager-state-select').value;
    
    const endpoints = [`${API_URL}/bookings`];
    if (selectedUF) {
        const cityId = CITIES[selectedUF].id;
        endpoints.push(`${API_URL}/cdl/unavailabilities/${cityId}`);
    }
    
    Promise.all(endpoints.map(url => fetch(url).then(res => res.json())))
        .then(([bookings, unavailabilities]) => {
            state.currentBookings = bookings;
            state.unavailabilities = unavailabilities || [];
            renderTeamsCalendar(bookings, selectedUF);
        })
        .catch(err => {
            console.error('Erro ao carregar dados gerenciais:', err);
            showNotification('Erro ao carregar dados do servidor', 'error');
        });
}

function checkHoliday(date, selectedUF) {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    const nationalHolidays = [
        [1, 1], [4, 21], [5, 1], [9, 7], [10, 12], [11, 2], [11, 20], [12, 25]
    ];
    
    const stateHolidays = {
        'CE': [[3, 19]], 'PB': [[8, 5]], 'RN': [[12, 3]], 'BA': [[11, 2]], 'MG': [[12, 8]], 'SP': [[11, 20]]
    };
    
    for (const [m, d] of nationalHolidays) {
        if (m === month && d === day) return true;
    }
    
    const stateCode = selectedUF?.split('-')[0];
    if (stateCode && stateHolidays[stateCode]) {
        for (const [m, d] of stateHolidays[stateCode]) {
            if (m === month && d === day) return true;
        }
    }
    
    return false;
}

function checkUnavailability(dateStr) {
    return (state.unavailabilities || []).some(u => u.unavailable_date === dateStr);
}

function renderTeamsCalendar(bookings, selectedUF) {
    const header = document.getElementById('teams-calendar-days-header');
    const grid = document.getElementById('teams-calendar-grid');
    
    header.innerHTML = '';
    grid.innerHTML = '';
    
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + (state.weekOffset * 7));
    
    // Adicionar nome do mês acima do calendário
    const monthName = startOfWeek.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    const monthDisplay = document.getElementById('manager-month-display') || document.createElement('div');
    monthDisplay.id = 'manager-month-display';
    monthDisplay.style.textAlign = 'center';
    monthDisplay.style.fontSize = '20px';
    monthDisplay.style.fontWeight = 'bold';
    monthDisplay.style.marginBottom = '15px';
    monthDisplay.style.color = 'var(--primary-color)';
    monthDisplay.style.textTransform = 'capitalize';
    monthDisplay.textContent = monthName;
    
    const calendarContainer = document.querySelector('.teams-calendar-container');
    if (calendarContainer && !document.getElementById('manager-month-display')) {
        calendarContainer.parentNode.insertBefore(monthDisplay, calendarContainer);
    }

    const weekdays = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
    
    for (let i = 0; i < 7; i++) {
        const currentDate = new Date(startOfWeek);
        currentDate.setDate(startOfWeek.getDate() + i);
        
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        
        const isToday = dateStr === today.toISOString().split('T')[0];
        const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
        const isHoliday = checkHoliday(currentDate, selectedUF);
        const isUnavailable = checkUnavailability(dateStr);
        
        // Filtrar agendamentos para este dia e UF
        const dayBookings = bookings.filter(b => {
            const matchesDate = b.booking_date === dateStr;
            const matchesUF = !selectedUF || CITIES[selectedUF].id === b.city_id;
            return matchesDate && matchesUF && b.status === 'confirmed';
        });

        const isPast = currentDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
        // Ponto 1: Garantir que TODOS os dias passados recebam o tom amarelado, independente de terem agendamentos ou não
        const isYellowDay = isWeekend || isHoliday || isUnavailable || isPast;
        const isPastEmpty = isPast && dayBookings.length === 0;
        
        // Header
        const dayHeader = document.createElement('div');
        dayHeader.className = `teams-day-header ${isToday ? 'teams-today' : ''} ${isYellowDay ? 'teams-unavailable' : ''}`;
        dayHeader.innerHTML = `<div>${weekdays[i]}</div><div style="font-size: 20px;">${currentDate.getDate()}</div>`;
        header.appendChild(dayHeader);
        
        // Coluna de agendamentos
        const dayColumn = document.createElement('div');
        dayColumn.className = `teams-day-column ${isToday ? 'teams-today' : ''} ${isYellowDay ? 'teams-unavailable' : ''} ${isPastEmpty ? 'past-empty' : ''}`;
        
        // Ordenar por hora
        dayBookings.sort((a, b) => a.booking_time.localeCompare(b.booking_time));
        
        if (dayBookings.length === 0) {
            let emptyMsg = 'Sem agendamentos';
            if (isHoliday) emptyMsg = 'Feriado';
            else if (isWeekend) emptyMsg = 'Fim de Semana';
            else if (isUnavailable) emptyMsg = 'Indisponível';
            else if (isPastEmpty) emptyMsg = 'Sem agendamentos';
            
            dayColumn.innerHTML = `<div style="color: #bdc3c7; text-align: center; margin-top: 20px; font-size: 11px;">${emptyMsg}</div>`;
        } else {
            dayBookings.forEach(booking => {
                const card = document.createElement('div');
                card.className = 'teams-booking-card';
                card.innerHTML = `
                    <div class="teams-booking-time">${booking.booking_time}</div>
                    <div class="teams-booking-company" title="${booking.company_name}">${booking.company_name}</div>
                    <div class="teams-booking-info">
                        ${booking.city}<br>
                        NF: ${booking.invoice_number}
                    </div>
                `;
                dayColumn.appendChild(card);
            });
        }
        
        grid.appendChild(dayColumn);
    }
}

function downloadBookingsXLSX() {
    const selectedUF = document.getElementById('manager-state-select').value;
    
    // Ponto 2: Filtrar apenas agendamentos com status "confirmed" e considerar o filtro de Estado
    const bookings = state.currentBookings.filter(b => {
        const isConfirmed = b.status === 'confirmed';
        const matchesUF = !selectedUF || CITIES[selectedUF].id === b.city_id;
        return isConfirmed && matchesUF;
    });

    if (bookings.length === 0) {
        showNotification('Não há agendamentos confirmados para exportar com os filtros atuais', 'warning');
        return;
    }
    
    const headers = ['Protocolo', 'Empresa', 'Fornecedor', 'Placa', 'Nota Fiscal', 'Motorista', 'Data', 'Hora', 'Cidade', 'Status'];
    const rows = bookings.map(b => [
        b.protocol || '',
        b.company_name,
        b.supplier || '',
        b.vehicle_plate,
        b.invoice_number,
        b.driver_name,
        b.booking_date,
        b.booking_time,
        b.city,
        b.status
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += headers.join(";") + "\r\n";
    rows.forEach(row => {
        csvContent += row.join(";") + "\r\n";
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "agendamentos.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Download iniciado (formato CSV compatível com Excel)', 'success');
}

// ============= NAVEGAÇÃO SEMANAL =============
function previousWeek() {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() - today.getDay() + ((state.weekOffset - 1) * 7));
    
    const minDate = new Date(currentYear, currentMonth, 1);
    const lastDayOfTargetWeek = new Date(targetDate);
    lastDayOfTargetWeek.setDate(targetDate.getDate() + 6);
    
    if (lastDayOfTargetWeek < minDate) {
        showNotification('A visualização é limitada ao mês atual e dois meses seguintes', 'warning');
        return;
    }
    
    state.weekOffset--;
    loadManagerData();
}

function nextWeek() {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() - today.getDay() + ((state.weekOffset + 1) * 7));
    
    // Permitir até o fim do segundo mês seguinte (total 3 meses)
    const limitMonth = (currentMonth + 2) % 12;
    const limitYear = currentYear + Math.floor((currentMonth + 2) / 12);
    const lastDayOfLimitMonth = new Date(limitYear, limitMonth + 1, 0);
    
    if (targetDate > lastDayOfLimitMonth) {
        showNotification('A visualização é limitada ao mês atual e dois meses seguintes', 'warning');
        return;
    }
    
    state.weekOffset++;
    loadManagerData();
}

// ============= NOTIFICAÇÕES =============
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type} show`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}
