import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { GoogleSheetsService } from './googleSheets.js';

const dbPath = path.join(path.join(process.cwd(), 'data', 'agendamentos.db'));

// Criar diretório data se não existir
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
    } else {
        console.log('✅ Conectado ao SQLite');
    }
});


        // Tabela de agendamentos
        db.run(`
            CREATE TABLE IF NOT EXISTS bookings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                protocol TEXT,
                city_id INTEGER NOT NULL,
                company_name TEXT NOT NULL,
                supplier TEXT,
                vehicle_plate TEXT NOT NULL,
                invoice_number TEXT NOT NULL,
                driver_name TEXT NOT NULL,
                booking_date DATE NOT NULL,
                booking_time TIME NOT NULL,
                status TEXT DEFAULT 'confirmed',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (city_id) REFERENCES cities(id)
            )
        `);

        // Tabela de indisponibilidades
        db.run(`
            CREATE TABLE IF NOT EXISTS unavailabilities (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                city_id INTEGER NOT NULL,
                unavailable_date DATE NOT NULL,
                unavailable_time TIME,
                reason TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (city_id) REFERENCES cities(id)
            )
        `);

        // Inserir cidades
        const cities = [
            { id: 1, name: 'Fortaleza', state: 'CE' },
            { id: 2, name: 'João Pessoa', state: 'PB' },
            { id: 3, name: 'Natal', state: 'RN' },
            { id: 4, name: 'Eunápolis', state: 'BA' },
            { id: 5, name: 'Poços de Caldas', state: 'MG' },
            { id: 6, name: 'Ourinhos', state: 'SP' },
            { id: 7, name: 'Itupeva', state: 'SP' },
            { id: 8, name: 'Registro', state: 'SP' }
        ];

        cities.forEach(city => {
            db.run(
                'INSERT OR IGNORE INTO cities (id, name, state) VALUES (?, ?, ?)',
                [city.id, city.name, city.state]
            );
        });

        console.log('✅ Banco de dados inicializado com sucesso');
    });
}

// Função para buscar cidade pelo nome
function getCityIdByName(cityName: string): Promise<number | null> {
    return new Promise((resolve) => {
        if (!cityName) {
            resolve(null);
            return;
        }

        // Buscar por nome exato
        db.get(
            'SELECT id FROM cities WHERE name = ?',
            [cityName.trim()],
            (err, row: any) => {
                if (err || !row) {
                    // Se não encontrar, tentar buscar por parte do nome
                    db.get(
                        'SELECT id FROM cities WHERE name LIKE ?',
                        [`%${cityName.trim()}%`],
                        (err2, row2: any) => {
                            if (err2 || !row2) {
                                resolve(null);
                            } else {
                                resolve(row2.id);
                            }
                        }
                    );
                } else {
                    resolve(row.id);
                }
            }
        );
    });
}

// Função para restaurar agendamentos do Google Sheets
async function restoreBookingsFromSheets(sheetsService: GoogleSheetsService): Promise<void> {
    try {
        const config = sheetsService.getConfig();
        const sheetName = config.bookingsSheetName;

        // Ler dados da planilha (pular cabeçalho linha 1)
        const response = await sheetsService.getSheetsData(`${sheetName}!A2:J`);

        if (!response || !response.values || response.values.length === 0) {
            console.log('📭 Nenhum agendamento encontrado no Google Sheets');
            return;
        }

        console.log(`📥 Encontrados ${response.values.length} agendamentos no Sheets`);
        
        let restoredCount = 0;
        let skippedCount = 0;
        
        for (const row of response.values) {
            // Formato: [Protocolo, Empresa, Fornecedor, Placa, NF, Motorista, Data, Hora, Cidade, Status, Data Criação]
            const [
                protocol, company_name, supplier, vehicle_plate, invoice_number, 
                driver_name, booking_date, booking_time, 
                city_name, status, created_at
            ] = row;
            
            const bookingProtocol = protocol || '';

            // Pular linhas vazias ou com dados incompletos
            if (!bookingProtocol || !company_name || !booking_date) {
                skippedCount++;
                continue;
            }

            // Buscar city_id pelo nome da cidade
            const cityId = await getCityIdByName(city_name);
            
            if (!cityId) {
                console.log(`⚠️ Cidade "${city_name}" não encontrada. Pulando agendamento ${bookingProtocol}`);
                skippedCount++;
                continue;
            }

            // Verificar se o agendamento já existe pelo protocolo
            const existingBooking = await new Promise<any>((resolve) => {
                db.get(
                    'SELECT id FROM bookings WHERE protocol = ?',
                    [bookingProtocol],
                    (_err, row: any) => {
                        resolve(row);
                    }
                );
            });

            if (existingBooking) {
                console.log(`↪️ Agendamento ${bookingProtocol} já existe no banco. Atualizando...`);
                
                // Atualizar agendamento existente
                await new Promise<void>((resolve, reject) => {
                    db.run(
                        `UPDATE bookings SET 
                            city_id = ?,
                            company_name = ?,
                            supplier = ?,
                            vehicle_plate = ?,
                            invoice_number = ?,
                            driver_name = ?,
                            booking_date = ?,
                            booking_time = ?,
                            status = ?,
                            updated_at = ?
                         WHERE protocol = ?`,
                        [
                            cityId, company_name, supplier, vehicle_plate, invoice_number,
                            driver_name, booking_date, booking_time, 
                            status || 'confirmed',
                            new Date().toISOString(),
                            bookingProtocol
                        ],
                        function(err) {
                            if (err) {
                                console.error(`❌ Erro ao atualizar agendamento ${bookingProtocol}:`, err);
                                reject(err);
                            } else {
                                restoredCount++;
                                resolve();
                            }
                        }
                    );
                });
            } else {
                // Inserir novo agendamento
                await new Promise<void>((resolve, reject) => {
                    db.run(
                        `INSERT INTO bookings 
                         (protocol, city_id, company_name, supplier, vehicle_plate, invoice_number, driver_name, 
                          booking_date, booking_time, status, created_at, updated_at)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            bookingProtocol, cityId, company_name, supplier, vehicle_plate, invoice_number,
                            driver_name, booking_date, booking_time, status || 'confirmed',
                            created_at || new Date().toISOString(),
                            new Date().toISOString()
                        ],
                        function(err) {
                            if (err) {
                                console.error(`❌ Erro ao restaurar agendamento ${bookingProtocol}:`, err);
                                reject(err);
                            } else {
                                restoredCount++;
                                resolve();
                            }
                        }
                    );
                });
            }
        }

        console.log(`✅ ${restoredCount} agendamentos restaurados do Google Sheets (${skippedCount} pulados)`);
    } catch (error) {
        console.error('❌ Erro ao restaurar agendamentos:', error);
        throw error;
    }
}

// Função para restaurar indisponibilidades do Google Sheets
async function restoreUnavailabilitiesFromSheets(sheetsService: GoogleSheetsService): Promise<void> {
    try {
        const config = sheetsService.getConfig();
        const sheetName = config.unavailabilitiesSheetName;

        const response = await sheetsService.getSheetsData(`${sheetName}!A2:F`);

        if (!response || !response.values || response.values.length === 0) {
            console.log('📭 Nenhuma indisponibilidade encontrada no Google Sheets');
            return;
        }

        console.log(`📥 Encontradas ${response.values.length} indisponibilidades no Sheets`);
        
        let restoredCount = 0;
        let skippedCount = 0;
        
        for (const row of response.values) {
            // Formato: [Cidade, Data Indisponível, Horário, Motivo, Data Registro]
            const [city_name, unavailable_date, unavailable_time, reason, created_at] = row;

            if (!city_name || !unavailable_date) {
                skippedCount++;
                continue;
            }

            // Buscar city_id pelo nome da cidade
            const cityId = await getCityIdByName(city_name);
            
            if (!cityId) {
                console.log(`⚠️ Cidade "${city_name}" não encontrada. Pulando indisponibilidade.`);
                skippedCount++;
                continue;
            }

            // Verificar se a indisponibilidade já existe
            const exists = await new Promise<boolean>((resolve) => {
                db.get(
                    'SELECT id FROM unavailabilities WHERE city_id = ? AND unavailable_date = ?',
                    [cityId, unavailable_date],
                    (err, existingRow: any) => {
                        resolve(!err && existingRow);
                    }
                );
            });

            if (exists) {
                // Atualizar indisponibilidade existente
                await new Promise<void>((resolve, reject) => {
                    db.run(
                        `UPDATE unavailabilities SET 
                            unavailable_time = ?,
                            reason = ?,
                            created_at = ?
                         WHERE city_id = ? AND unavailable_date = ?`,
                        [
                            unavailable_time || null, 
                            reason || 'Restaurado do Google Sheets',
                            created_at || new Date().toISOString(),
                            cityId, 
                            unavailable_date
                        ],
                        function(err) {
                            if (err) {
                                console.error(`❌ Erro ao atualizar indisponibilidade:`, err);
                                reject(err);
                            } else {
                                restoredCount++;
                                resolve();
                            }
                        }
                    );
                });
            } else {
                // Inserir nova indisponibilidade
                await new Promise<void>((resolve, reject) => {
                    db.run(
                        `INSERT INTO unavailabilities 
                         (city_id, unavailable_date, unavailable_time, reason, created_at)
                         VALUES (?, ?, ?, ?, ?)`,
                        [
                            cityId, unavailable_date, unavailable_time || null, 
                            reason || 'Restaurado do Google Sheets',
                            created_at || new Date().toISOString()
                        ],
                        function(err) {
                            if (err) {
                                console.error(`❌ Erro ao restaurar indisponibilidade:`, err);
                                reject(err);
                            } else {
                                restoredCount++;
                                resolve();
                            }
                        }
                    );
                });
            }
        }

        console.log(`✅ ${restoredCount} indisponibilidades restauradas do Google Sheets (${skippedCount} puladas)`);
    } catch (error) {
        console.error('❌ Erro ao restaurar indisponibilidades:', error);
        throw error;
    }
}

// Função principal para restaurar do Google Sheets
async function restoreFromGoogleSheetsInternal(sheetsService: GoogleSheetsService | null): Promise<void> {
    return new Promise((resolve, reject) => {
        if (!sheetsService) {
            console.log('⚠️  Google Sheets não disponível para restauração');
            resolve();
            return;
        }

        console.log('🔄 Verificando se precisa restaurar do Google Sheets...');
        
        // Verificar se o banco tem agendamentos
        db.all('SELECT COUNT(*) as count FROM bookings', [], async (err, rows: any[]) => {
            if (err) {
                console.error('❌ Erro ao verificar banco:', err);
                reject(err);
                return;
            }

            const count = rows[0].count;
            
            // Verificar se devemos restaurar (sempre restaurar para manter sincronizado)
            const shouldRestore = process.env.ALWAYS_RESTORE_SHEETS === 'true' || count === 0;
            
            if (!shouldRestore && count > 0) {
                console.log(`✅ Banco já tem ${count} agendamentos. Restauração não necessária.`);
                resolve();
                return;
            }

            if (count > 0) {
                console.log(`🔄 Banco tem ${count} agendamentos, mas ALWAYS_RESTORE_SHEETS está ativo. Sincronizando...`);
            } else {
                console.log('📥 Banco vazio. Restaurando do Google Sheets...');
            }
            
            try {
                // Restaurar agendamentos
                await restoreBookingsFromSheets(sheetsService);
                
                // Restaurar indisponibilidades
                await restoreUnavailabilitiesFromSheets(sheetsService);
                
                console.log('✅ Restauração/sincronização do Google Sheets concluída');
                resolve();
            } catch (error) {
                console.error('❌ Erro na restauração:', error);
                reject(error);
            }
        });
    });
}

// Função para forçar sincronização manual
async function forceSyncFromGoogleSheetsInternal(sheetsService: GoogleSheetsService | null): Promise<void> {
    if (!sheetsService) {
        throw new Error('Google Sheets não disponível');
    }
    
    console.log('🔄 Forçando sincronização do Google Sheets...');
    await restoreBookingsFromSheets(sheetsService);
    await restoreUnavailabilitiesFromSheets(sheetsService);
    console.log('✅ Sincronização forçada concluída');
}

// Exportar db e as funções
export default db;
export { 
    restoreFromGoogleSheetsInternal as restoreFromGoogleSheets, 
    forceSyncFromGoogleSheetsInternal as forceSyncFromGoogleSheets 
};