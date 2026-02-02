// Feriados nacionais e estaduais brasileiros 2025-2026

export const NATIONAL_HOLIDAYS = [
    { month: 1, day: 1, name: 'Ano Novo' },
    { month: 4, day: 21, name: 'Tiradentes' },
    { month: 5, day: 1, name: 'Dia do Trabalho' },
    { month: 9, day: 7, name: 'Independência do Brasil' },
    { month: 10, day: 12, name: 'Nossa Senhora Aparecida' },
    { month: 11, day: 2, name: 'Finados' },
    { month: 11, day: 20, name: 'Consciência Negra' },
    { month: 12, day: 25, name: 'Natal' }
];

export const STATE_HOLIDAYS: Record<string, Array<{ month: number; day: number; name: string }>> = {
    'CE': [{ month: 3, day: 19, name: 'São José' }],
    'PB': [{ month: 8, day: 5, name: 'Nossa Senhora das Neves' }],
    'RN': [{ month: 12, day: 3, name: 'Santo Antônio' }],
    'BA': [{ month: 11, day: 2, name: 'Finados' }],
    'MG': [{ month: 12, day: 8, name: 'Nossa Senhora da Conceição' }],
    'SP': [{ month: 11, day: 20, name: 'Consciência Negra' }]
};

export function isNationalHoliday(date: Date): boolean {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return NATIONAL_HOLIDAYS.some(h => h.month === month && h.day === day);
}

export function isStateHoliday(date: Date, state: string): boolean {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const stateCode = state.split('-')[0];
    const holidays = STATE_HOLIDAYS[stateCode] || [];
    return holidays.some(h => h.month === month && h.day === day);
}

export function isHoliday(date: Date, state?: string): boolean {
    if (isNationalHoliday(date)) return true;
    if (state && isStateHoliday(date, state)) return true;
    return false;
}

export function isWeekend(date: Date): boolean {
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
}

export function isAvailableDay(date: Date, state?: string): boolean {
    return !isHoliday(date, state) && !isWeekend(date);
}

export function getHolidayName(date: Date, state?: string): string | null {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    const nationalHoliday = NATIONAL_HOLIDAYS.find(h => h.month === month && h.day === day);
    if (nationalHoliday) return nationalHoliday.name;
    
    if (state) {
        const stateCode = state.split('-')[0];
        const stateHoliday = STATE_HOLIDAYS[stateCode]?.find(h => h.month === month && h.day === day);
        if (stateHoliday) return stateHoliday.name;
    }
    
    return null;
}

export function getNextAvailableDay(startDate: Date, state?: string): Date {
    const date = new Date(startDate);
    date.setDate(date.getDate() + 1);
    
    while (!isAvailableDay(date, state)) {
        date.setDate(date.getDate() + 1);
    }
    
    return date;
}

export function getAvailableDaysInMonth(year: number, month: number, state?: string): number[] {
    const days: number[] = [];
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        if (isAvailableDay(date, state)) {
            days.push(day);
        }
    }
    
    return days;
}
