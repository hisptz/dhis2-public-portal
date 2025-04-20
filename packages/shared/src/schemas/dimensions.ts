import { z } from "zod";

export const periodConfigSchema = z.object({
	categories: z.array(z.enum(["RELATIVE", "FIXED"])).optional(),
	periodTypes: z.array(z.string()).optional(),
	periods: z.array(z.string()).optional(),
	singleSelection: z.boolean().optional(),
});

export type PeriodConfig = z.infer<typeof periodConfigSchema>;

export const orgUnitConfigSchema = z.object({
	orgUnitLevels: z.array(z.number()).optional(),
	orgUnits: z.array(z.string()).optional(),
});

export type OrgUnitConfig = z.infer<typeof orgUnitConfigSchema>;
