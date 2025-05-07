import { z } from "zod";

export enum MenuPosition {
	HEADER = "header",
	SIDEBAR = "sidebar",
}

export enum MenuItemsDisplay {
	GROUPED = "grouped",
	DROPDOWN = "dropdown",
}

export enum MenuItemType {
	MODULE = "module",
	GROUP = "group",
}

export const menuItemType = z.nativeEnum(MenuItemType);

export const baseMenuItemSchema = z.object({
	type: menuItemType,
	label: z.string(),
	icon: z.string().optional(),
	sortOrder: z.number(),
	path: z.string().max(50),
});

export const moduleMenuItemSchema = baseMenuItemSchema.extend({
	type: z.literal("module"),
	moduleId: z.string(),
});
export type ModuleMenuItem = z.infer<typeof moduleMenuItemSchema>;

export const groupMenuItemSchema = baseMenuItemSchema.extend({
	type: z.literal("group"),
	items: z
		.array(moduleMenuItemSchema)
		.min(2, { message: "Group must have at least 2 items" }),
	itemsDisplay: z.nativeEnum(MenuItemsDisplay).optional(),
});

export type GroupMenuItem = z.infer<typeof groupMenuItemSchema>;

export const menuItemSchema = z.discriminatedUnion("type", [
	groupMenuItemSchema,
	moduleMenuItemSchema,
]);
export type MenuItem = z.infer<typeof menuItemSchema>;

export const menuConfig = z.object({
	position: z.nativeEnum(MenuPosition),
	collapsible: z.boolean().default(true),
	items: z.array(menuItemSchema),
});

export type AppMenuConfig = z.infer<typeof menuConfig>;
