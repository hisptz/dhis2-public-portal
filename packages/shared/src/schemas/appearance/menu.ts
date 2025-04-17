import { z } from "zod";

export const menuItemType = z.enum(["group", "module"]);

export const baseMenuItemSchema = z.object({
	type: menuItemType,
	label: z.string(),
	icon: z.string().optional(),
	sortOrder: z.number(),
});

export const moduleMenuItemSchema = baseMenuItemSchema.extend({
	type: z.literal("module"),
	moduleId: z.string(),
	path: z.string().optional(),
	itemsDisplay: z.enum(["grouped", "dropdown"]).optional(),
});
export type ModuleMenuItem = z.infer<typeof moduleMenuItemSchema>;

export const groupMenuItemSchema = baseMenuItemSchema.extend({
	type: z.literal("group"),
	items: z.array(moduleMenuItemSchema),
});

export type GroupMenuItem = z.infer<typeof groupMenuItemSchema>;

export const menuItemSchema = z.discriminatedUnion("type", [
	groupMenuItemSchema,
	moduleMenuItemSchema,
]);
export type MenuItem = z.infer<typeof menuItemSchema>;

export const menuConfig = z.object({
	position: z.enum(["header", "sidebar"]),
	items: z.array(menuItemSchema),
});

export type AppMenuConfig = z.infer<typeof menuConfig>;
