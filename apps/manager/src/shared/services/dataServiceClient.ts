
export interface ApiResponse {
    success: boolean;
    message: string;
    data?: any;
    filesDeleted?: number;
    totalSizeDeleted?: string;
    queues?: string[];
}

const getBaseUrl = (): string => {
    return process.env.DATA_SERVICE_URL || 'http://localhost:3003';
};

const getApiKey = (): string | undefined => {
    return process.env.DATA_SERVICE_API_KEY;
};

export async function apiCall(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse> {
    const url = `${getBaseUrl()}${endpoint}`;

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    const apiKey = getApiKey();
    if (apiKey) {
        headers['x-api-key'] = apiKey;
    }

    const config: RequestInit = {
        ...options,
        headers,
    };

    try {
        const response = await fetch(url, config);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
                errorData.message || `HTTP ${response.status}: ${response.statusText}`
            );
        }

        const result = await response.json();
        return result;
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error(`Network error: ${String(error)}`);
    }
}

// Specific API functions
export async function downloadMetadata(configId: string, data: any): Promise<ApiResponse> {
    return apiCall(`/metadata-download/${configId}`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function downloadData(configId: string, data: any): Promise<ApiResponse> {
    return apiCall(`/data-download/${configId}`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function validateData(configId: string, data: any): Promise<ApiResponse> {
    return apiCall(`/data-validation/${configId}`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function deleteData(configId: string, data: any): Promise<ApiResponse> {
    return apiCall(`/data-delete/${configId}?confirm=true`, {
        method: 'DELETE',
        body: JSON.stringify(data),
    });
}

export async function createQueues(configId: string): Promise<ApiResponse> {
    return apiCall(`/queues/${configId}`, {
        method: 'POST',
        body: JSON.stringify({ action: 'create' }),
    });
}

export async function deleteQueues(configId: string): Promise<ApiResponse> {
    return apiCall(`/queues/${configId}`, {
        method: 'DELETE',
    });
} 

export async function getConfigStatus(configId: string): Promise<ApiResponse> {
    try {
        const response = await apiCall(`/status/${configId}`);
        console.log(`getConfigStatus response for ${configId}:`, response);
        return response;
    } catch (error) {
        console.error(`getConfigStatus error for ${configId}:`, error);
        throw error;
    }
}
