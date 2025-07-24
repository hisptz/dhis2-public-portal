import { QueueObject } from "async";
import { Dimensions } from "@/schemas/metadata";
import { DataServiceDataSourceItemsConfig } from "@packages/shared/schemas";

export const dataUploadQueues: {
	[key: string]: QueueObject<{ filename: string }>;
} = {};

export const dataDownloadQueues: Record<
	string,
	QueueObject<{
		dimensions: Dimensions;
		filters?: Dimensions;
		config: DataServiceDataSourceItemsConfig;
	}>
> = {};
