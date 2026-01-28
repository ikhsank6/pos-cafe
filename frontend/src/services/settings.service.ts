import api from '@/config/axios';

export interface TaxSettings {
    taxEnabled: boolean;
    taxRate: number;
}

export const settingsService = {
    async getTaxSettings() {
        const response = await api.get('/settings/tax') as any;
        return response.data as TaxSettings;
    },

    async updateTaxSettings(data: { taxEnabled: string; taxRate: string }) {
        const response = await api.put('/settings/tax', data);
        return response.data;
    }
};
