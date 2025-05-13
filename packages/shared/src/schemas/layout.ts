import { z } from "zod";

export const dataGridSchema = z.object({
	i: z.string(),
	x: z.number(),
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
	lg: dataGridSchema.array().optional(),
	md: dataGridSchema.array().optional(),
	sm: dataGridSchema.array().optional(),
	xs: dataGridSchema.array().optional(),
});

export type FlexibleLayoutConfig = z.infer<typeof layoutSchema>;
