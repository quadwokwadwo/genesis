import axiosFetch from '@/libs/axiosConfig';

export type IntegrationProvider = 'mnotify' | 'smtp';

export interface IntegrationRow {
    provider: IntegrationProvider;
    isActive: boolean;
    config: Record<string, any>;
}

function unwrap(data: any): IntegrationRow[] {
    return (data?.data?.data ?? data?.data?.operatedData ?? []) as IntegrationRow[];
}

class IntegrationService {
    static async getIntegrations(): Promise<IntegrationRow[]> {
        const data = await axiosFetch<IntegrationRow[]>('GET', '/api/integrations', {});
        return unwrap(data);
    }

    static async updateIntegration(provider: IntegrationProvider, config: Record<string, any>, isActive: boolean): Promise<IntegrationRow[]> {
        const data = await axiosFetch<IntegrationRow[]>('PUT', `/api/integrations/${provider}`, { config, isActive });
        return unwrap(data);
    }

    static async testIntegration(provider: IntegrationProvider, to: string): Promise<void> {
        await axiosFetch<any>('POST', `/api/integrations/${provider}/test`, { to });
    }
}

export default IntegrationService;
