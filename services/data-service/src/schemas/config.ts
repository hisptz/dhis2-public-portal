import { z } from "zod";

export const mappingConfig = z.object({
	id: z.string(),
	periodTypeId: z.string(),
	parentOrgUnitId: z.string(),
	orgUnitLevel: z.number(),
	dataItems: z.string().array(),
});

export type MappingConfig = z.infer<typeof mappingConfig>;
