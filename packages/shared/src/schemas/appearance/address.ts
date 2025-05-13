import { z } from "zod";

export const addressSchema = z.object({
	content: z.string(),
});

export type AddressConfig = z.infer<typeof addressSchema>;
