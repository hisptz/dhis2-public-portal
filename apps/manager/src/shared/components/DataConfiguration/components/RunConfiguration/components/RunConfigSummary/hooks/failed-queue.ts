import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
	getFailedQueue, 
	clearFailedQueue, 
	retryByProcessType,
	retrySingleMessage
} from "../../../../../../../services/dataServiceClient";

interface FailedMessage {
	messageId?: string;
	sourceQueue: string;
	retryCount: number;
	deathReason: string;
	deathTimestamp: string;
	headers: {
		'x-axios-code': string;
		'x-axios-status': string;
		'x-axios-url': string;
		'x-death': any;
		'x-error-message': string;
		'x-failure-reason': string;
		'x-retry-timestamp': string;
	};
	payload: any;
	retrievedAt: string;
}

interface FailedQueueData {
	configId: string;
	totalFailedMessages: number;
	messages: FailedMessage[];
	sourceQueues?: string[];
	sourceQueueCounts?: Record<string, number>; 
	retrievedAt: string;
	pagination?: {
		limit: number;
		offset: number;
		currentPageSize: number;
		hasNextPage: boolean;
		hasPreviousPage: boolean;
		totalPages: number;
		currentPage: number;
	};
}

export function useFailedQueueDetails(configId: string, options: { 
	limit?: number; 
	offset?: number;
	includeMessages?: boolean;
	queue?: string;
} = {}) {
	const queryClient = useQueryClient();
	const { limit = 50, offset = 0, includeMessages = true, queue } = options;

	const query = useQuery({
		queryKey: ["failed-queue", configId, limit, offset, includeMessages, queue],
		queryFn: async (): Promise<FailedQueueData> => {
			const response = await getFailedQueue(configId, { 
				limit, 
				offset, 
				includeMessages,
				queue 
			});
			if (!response.success) {
				throw new Error(response.message || 'Failed to fetch failed queue data');
			}
			return response.data as FailedQueueData;
		},
		enabled: !!configId,
		refetchInterval: 10000,  
	});	const clearMutation = useMutation({
		mutationFn: async () => {
			const response = await clearFailedQueue(configId);
			if (!response.success) {
				throw new Error(response.message || 'Failed to clear failed queue');
			}
			return response;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["failed-queue", configId] });
			queryClient.invalidateQueries({ queryKey: ["processStatus", configId] });
		},
	});

	const retryByTypeMutation = useMutation({
		mutationFn: async (processType: 'data-upload' | 'metadata-upload' | 'data-download' | 'metadata-download') => {
			const response = await retryByProcessType(configId, processType);
			if (!response.success) {
				throw new Error(response.message || `Failed to retry ${processType} messages`);
			}
			return response;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["failed-queue", configId] });
			queryClient.invalidateQueries({ queryKey: ["processStatus", configId] });
		},
	});

	const retrySingleMutation = useMutation({
		mutationFn: async (messageId: string) => {
			const response = await retrySingleMessage(configId, messageId);
			if (!response.success) {
				throw new Error(response.message || `Failed to retry message ${messageId}`);
			}
			return response;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["failed-queue", configId] });
			queryClient.invalidateQueries({ queryKey: ["processStatus", configId] });
		},
	});

	return {
		failedMessages: query.data,
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
		clearFailedQueue: clearMutation.mutate,
		isClearingQueue: clearMutation.isPending,
		retryByProcessType: retryByTypeMutation.mutate,
		isRetryingByType: retryByTypeMutation.isPending,
		retrySingleMessage: retrySingleMutation.mutate,
		isRetryingSingle: retrySingleMutation.isPending,
	};
}
