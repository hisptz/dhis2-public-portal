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

export async function startDataDeletion(configId: string, data: any): Promise<ApiResponse> {
    return apiCall(`/data-delete/${configId}`, {
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

export async function getFailedQueue(configId: string, options: { 
    limit?: number; 
    offset?: number; 
    includeMessages?: boolean;
    queue?: string;
    onlyQueues?: boolean;
} = {}): Promise<ApiResponse> {
    try {
        const { limit = 50, offset = 0, includeMessages = false, queue, onlyQueues = false } = options;
        const queryParams = new URLSearchParams({
            limit: limit.toString(),
            offset: offset.toString(),
        });
        
        if (includeMessages) {
            queryParams.set('includeMessages', 'true');
        }
        
        if (onlyQueues) {
            queryParams.set('onlyQueues', 'true');
        }
        
        if (queue) {
            queryParams.set('queue', queue);
        }
        
        const response = await apiCall(`/failed-queue/${configId}?${queryParams}`);
         return response;
    } catch (error) {
        console.error(`getFailedQueue error for ${configId}:`, error);
        throw error;
    }
}

export async function getFailedQueueSources(configId: string): Promise<ApiResponse> {
    try {
        const response = await apiCall(`/failed-queue/${configId}?onlyQueues=true`);
         return response;
    } catch (error) {
         throw error;
    }
}

export async function clearFailedQueue(configId: string): Promise<ApiResponse> {
    return apiCall(`/failed-queue/${configId}`, {
        method: 'DELETE',
    });
}

// Retry operations
export async function retryByProcessType(
    configId: string, 
    processType: 'data-upload' | 'metadata-upload' | 'data-download' | 'metadata-download' | 'data-delete',
    maxRetries: number = 10
): Promise<ApiResponse> {
    return apiCall(`/retry/${configId}`, {
        method: 'POST',
        body: JSON.stringify({
            maxRetries,
        }),
    });
}

export async function retrySingleMessage(configId: string, messageId: string): Promise<ApiResponse> {
    return apiCall(`/retry/${configId}/message/${messageId}`, {
        method: 'POST',
    });
}
