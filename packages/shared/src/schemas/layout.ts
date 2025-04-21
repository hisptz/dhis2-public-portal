import { z } from "zod";

export const dataGridSchema = z.object({
	i: z.string(),
	x: z.number().min(0).max(12),
	y: z.number().min(0),
	w: z.number().min(1).max(12),
	h: z.number().min(1),
	static: z.boolean().optional(),
	minW: z.number().min(1).max(12).optional(),
	maxW: z.number().min(1).max(12).optional(),
	minH: z.number().min(1).max(12).optional(),
	maxH: z.number().min(1).max(12).optional(),
});

export const layoutSchema = z.object({
	lg: dataGridSchema.array(),
	md: dataGridSchema.array(),
	sm: dataGridSchema.array(),
	xs: dataGridSchema.array(),
});

export type FlexibleLayoutConfig = z.infer<typeof layoutSchema>;
