import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

export interface GoogleSheetsConfig {
    spreadsheetId: string;
    credentialsPath: string;
    bookingsSheetName: string;
    unavailabilitiesSheetName: string;
}

export class GoogleSheetsService {
    private config: GoogleSheetsConfig;
    private auth: any;
    private sheets: any;

    constructor(config: GoogleSheetsConfig) {
        this.config = config;
        this.auth = new google.auth.GoogleAuth({
            keyFile: config.credentialsPath,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
        this.sheets = google.sheets({ version: 'v4', auth: this.auth as any });
    }

    // Método público para acessar configuração
    getConfig(): GoogleSheetsConfig {
        return this.config;
    }

    // Método público para ler dados do Sheets
    async getSheetsData(range: string): Promise<any> {
        try {
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.config.spreadsheetId,
                range,
            });
            return response.data;
        } catch (error) {
            console.error('❌ Erro ao ler dados do Google Sheets:', error);
            throw error;
        }
    }

    async appendBooking(booking: any): Promise<void> {
        try {
            const values = [
                [
                    booking.protocol || '',
                    booking.company_name,
                    booking.supplier || '',
                    booking.vehicle_plate,
                    booking.invoice_number,
                    booking.driver_name,
                    booking.booking_date,
                    booking.booking_time,
                    booking.city || '',
                    booking.status || 'confirmed',
                    new Date().toISOString()
                ]
            ];

            const sheetName = this.config.bookingsSheetName;
            await this.ensureSheetExists(sheetName);
            
            // Verificar se há cabeçalhos
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.config.spreadsheetId,
                range: `${sheetName}!A1:K1`,
            });

            // Se não há dados, adicionar cabeçalhos
            if (!response.data.values || response.data.values.length === 0) {
                const headers = [
                    ['Protocolo', 'Empresa', 'Fornecedor', 'Placa', 'Nota Fiscal', 'Motorista', 'Data', 'Hora', 'Cidade', 'Status', 'Data Criação']
                ];
                
                await this.sheets.spreadsheets.values.update({
                    spreadsheetId: this.config.spreadsheetId,
                    range: `${sheetName}!A1:K1`,
                    valueInputOption: 'RAW',
                    requestBody: { values: headers },
                });
            }

            // Adicionar os dados
            await this.sheets.spreadsheets.values.append({
                spreadsheetId: this.config.spreadsheetId,
                range: `${sheetName}!A:K`,
                valueInputOption: 'RAW',
                insertDataOption: 'INSERT_ROWS',
                requestBody: { values },
            });
            
            console.log(`📊 Agendamento ${booking.protocol} adicionado ao Google Sheets`);
        } catch (error) {
            console.error('❌ Erro ao sincronizar agendamento com Google Sheets:', error);
        }
    }

    async updateBooking(booking: any): Promise<void> {
        try {
            const sheetName = this.config.bookingsSheetName;
            
            // Primeiro, encontrar a linha onde está este agendamento (Protocolo está na coluna A agora)
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.config.spreadsheetId,
                range: `${sheetName}!A:A`, // Buscar apenas a coluna de Protocolos
            });

            if (!response.data.values) {
                console.log(`📭 Planilha ${sheetName} está vazia`);
                // Se não encontrou, adiciona como novo
                await this.appendBooking(booking);
                return;
            }

            // Encontrar a linha do agendamento (Protocolo está na coluna A)
            let rowIndex = -1;
            for (let i = 0; i < response.data.values.length; i++) {
                if (response.data.values[i][0] == booking.protocol) {
                    rowIndex = i + 1; // +1 porque as linhas no Sheets começam em 1
                    break;
                }
            }

            if (rowIndex === -1) {
                console.log(`⚠️ Agendamento ${booking.protocol} não encontrado na planilha`);
                // Se não encontrou, adiciona como novo
                await this.appendBooking(booking);
                return;
            }

            // Atualizar a linha encontrada
            const values = [
                [
                    booking.protocol || '',
                    booking.company_name,
                    booking.supplier || '',
                    booking.vehicle_plate,
                    booking.invoice_number,
                    booking.driver_name,
                    booking.booking_date,
                    booking.booking_time,
                    booking.city || '',
                    booking.status || 'confirmed',
                    booking.updated_at || new Date().toISOString()
                ]
            ];

            await this.sheets.spreadsheets.values.update({
                spreadsheetId: this.config.spreadsheetId,
                range: `${sheetName}!A${rowIndex}:K${rowIndex}`,
                valueInputOption: 'RAW',
                requestBody: { values },
            });
            
            console.log(`📝 Agendamento ${booking.protocol} atualizado no Google Sheets (linha ${rowIndex})`);
        } catch (error) {
            console.error('❌ Erro ao atualizar agendamento no Google Sheets:', error);
        }
    }

    async appendUnavailability(unavailability: any): Promise<void> {
        try {
            const values = [
                [
                    unavailability.city_name || 'Cidade não encontrada',
                    unavailability.unavailable_date,
                    unavailability.unavailable_time || 'Dia Inteiro',
                    unavailability.reason,
                    new Date().toISOString()
                ]
            ];

            const sheetName = this.config.unavailabilitiesSheetName;
            await this.ensureSheetExists(sheetName);
            
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.config.spreadsheetId,
                range: `${sheetName}!A1:E1`,
            });

            if (!response.data.values || response.data.values.length === 0) {
                const headers = [
                    ['Cidade', 'Data Indisponível', 'Horário', 'Motivo', 'Data Registro']
                ];
                
                await this.sheets.spreadsheets.values.update({
                    spreadsheetId: this.config.spreadsheetId,
                    range: `${sheetName}!A1:E1`,
                    valueInputOption: 'RAW',
                    requestBody: { values: headers },
                });
            }

            await this.sheets.spreadsheets.values.append({
                spreadsheetId: this.config.spreadsheetId,
                range: `${sheetName}!A:E`,
                valueInputOption: 'RAW',
                insertDataOption: 'INSERT_ROWS',
                requestBody: { values },
            });
            
            console.log(`📊 Indisponibilidade sincronizada com Google Sheets (aba: ${sheetName})`);
        } catch (error) {
            console.error('❌ Erro ao sincronizar indisponibilidade com Google Sheets:', error);
        }
    }

    private async ensureSheetExists(sheetName: string): Promise<void> {
        try {
            const spreadsheet = await this.sheets.spreadsheets.get({
                spreadsheetId: this.config.spreadsheetId,
            });

            const sheets = spreadsheet.data.sheets;
            const sheetExists = sheets.some((sheet: any) => 
                sheet.properties.title === sheetName
            );

            if (!sheetExists) {
                await this.sheets.spreadsheets.batchUpdate({
                    spreadsheetId: this.config.spreadsheetId,
                    requestBody: {
                        requests: [{
                            addSheet: {
                                properties: {
                                    title: sheetName
                                }
                            }
                        }]
                    }
                });
                console.log(`📄 Aba "${sheetName}" criada no Google Sheets`);
            }
        } catch (error) {
            console.error(`❌ Erro ao verificar/criar aba ${sheetName}:`, error);
        }
    }
}

export function initializeGoogleSheets(): GoogleSheetsService | null {
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    const credentialsPath = process.env.GOOGLE_SHEETS_CREDENTIALS_PATH || './credentials.json';
    const bookingsSheetName = process.env.GOOGLE_SHEETS_BOOKINGS_SHEET || 'Agendamentos';
    const unavailabilitiesSheetName = process.env.GOOGLE_SHEETS_UNAVAILABILITIES_SHEET || 'Indisponibilidades';

    if (!spreadsheetId) {
        console.log('⚠️  GOOGLE_SHEETS_SPREADSHEET_ID não configurado. Sincronização desabilitada.');
        return null;
    }

    if (!fs.existsSync(path.resolve(credentialsPath))) {
        console.log(`⚠️  Arquivo de credenciais não encontrado em: ${credentialsPath}. Sincronização desabilitada.`);
        return null;
    }

    console.log(`✅ Google Sheets configurado. Planilha ID: ${spreadsheetId.substring(0, 10)}...`);
    console.log(`📄 Aba de agendamentos: ${bookingsSheetName}`);
    console.log(`📄 Aba de indisponibilidades: ${unavailabilitiesSheetName}`);
    
    return new GoogleSheetsService({ 
        spreadsheetId, 
        credentialsPath,
        bookingsSheetName,
        unavailabilitiesSheetName
    });
}