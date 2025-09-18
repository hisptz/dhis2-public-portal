import { z } from "zod";

export enum DataServiceRunStatus {
	NOT_STARTED = "NOT_STARTED",
	IDLE = "IDLE",
	RUNNING = "RUNNING",
	UNKNOWN = "UNKNOWN",
	COMPLETED = "COMPLETED",
	FAILED = "FAILED",
}

export const dataServiceRunStatusSchema = z.nativeEnum(DataServiceRunStatus);
