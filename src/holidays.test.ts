import { describe, it, expect } from 'vitest';
import {
    isNationalHoliday,
    isStateHoliday,
    isWeekend,
    isAvailableDay,
    getHolidayName,
    getAvailableDaysInMonth
} from './holidays';

describe('Holidays', () => {
    describe('isNationalHoliday', () => {
        it('deve identificar Ano Novo', () => {
            const date = new Date(2025, 0, 1);
            expect(isNationalHoliday(date)).toBe(true);
        });

        it('deve identificar Tiradentes', () => {
            const date = new Date(2025, 3, 21);
            expect(isNationalHoliday(date)).toBe(true);
        });

        it('deve identificar Natal', () => {
            const date = new Date(2025, 11, 25);
            expect(isNationalHoliday(date)).toBe(true);
        });

        it('não deve identificar dia comum como feriado', () => {
            const date = new Date(2025, 0, 2);
            expect(isNationalHoliday(date)).toBe(false);
        });
    });

    describe('isStateHoliday', () => {
        it('deve identificar feriado estadual do Ceará', () => {
            const date = new Date(2025, 2, 19);
            expect(isStateHoliday(date, 'CE')).toBe(true);
        });

        it('deve identificar feriado estadual de São Paulo', () => {
            const date = new Date(2025, 10, 20);
            expect(isStateHoliday(date, 'SP')).toBe(true);
        });

        it('não deve identificar feriado de outro estado', () => {
            const date = new Date(2025, 2, 19);
            expect(isStateHoliday(date, 'SP')).toBe(false);
        });
    });

    describe('isWeekend', () => {
        it('deve identificar sábado como fim de semana', () => {
            const date = new Date(2025, 0, 4);
            expect(isWeekend(date)).toBe(true);
        });

        it('deve identificar domingo como fim de semana', () => {
            const date = new Date(2025, 0, 5);
            expect(isWeekend(date)).toBe(true);
        });

        it('não deve identificar segunda como fim de semana', () => {
            const date = new Date(2025, 0, 6);
            expect(isWeekend(date)).toBe(false);
        });

        it('não deve identificar sexta como fim de semana', () => {
            const date = new Date(2025, 0, 3);
            expect(isWeekend(date)).toBe(false);
        });
    });

    describe('isAvailableDay', () => {
        it('deve retornar true para dia útil comum', () => {
            const date = new Date(2025, 0, 6);
            expect(isAvailableDay(date)).toBe(true);
        });

        it('deve retornar false para sábado', () => {
            const date = new Date(2025, 0, 4);
            expect(isAvailableDay(date)).toBe(false);
        });

        it('deve retornar false para feriado nacional', () => {
            const date = new Date(2025, 0, 1);
            expect(isAvailableDay(date)).toBe(false);
        });

        it('deve retornar false para feriado estadual', () => {
            const date = new Date(2025, 2, 19);
            expect(isAvailableDay(date, 'CE')).toBe(false);
        });
    });

    describe('getHolidayName', () => {
        it('deve retornar nome do feriado nacional', () => {
            const date = new Date(2025, 11, 25);
            expect(getHolidayName(date)).toBe('Natal');
        });

        it('deve retornar nome do feriado estadual', () => {
            const date = new Date(2025, 2, 19);
            expect(getHolidayName(date, 'CE')).toBe('São José');
        });

        it('deve retornar null para dia comum', () => {
            const date = new Date(2025, 0, 6);
            expect(getHolidayName(date)).toBeNull();
        });
    });

    describe('getAvailableDaysInMonth', () => {
        it('deve retornar dias úteis do mês', () => {
            const availableDays = getAvailableDaysInMonth(2025, 0);
            expect(availableDays.length).toBeGreaterThan(0);
            expect(availableDays).toContain(6);
            expect(availableDays).not.toContain(1);
        });

        it('deve excluir fins de semana', () => {
            const availableDays = getAvailableDaysInMonth(2025, 0);
            availableDays.forEach(day => {
                const date = new Date(2025, 0, day);
                expect(isWeekend(date)).toBe(false);
            });
        });
    });
});
