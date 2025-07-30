import { QueueObject } from "async";
import { Dimensions } from "@/schemas/metadata";
import { DataServiceDataSourceItemsConfig } from "@packages/shared/schemas";


export const dataDownloadQueues: Record<
	string,
	QueueObject<{
		dimensions: Dimensions;
		filters?: Dimensions;
		config: DataServiceDataSourceItemsConfig;
	}>
> = {};
