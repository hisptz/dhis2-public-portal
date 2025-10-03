export const visQuery = {
	vis: {
		resource: "visualizations",
		params: ({ type }: { type: string }) => {
			return {
				fields: ["id", "displayName", "type"],
				order: "name:asc",
				paging: false,
				filter: type ? [`type:eq:${type}`] : undefined,
			};
		},
	},
};

export const mapQuery = {
	maps: {
		resource: "maps",
		params: ({}) => {
			return {
				fields: ["id", "displayName"],
				paging: false,
			};
		},
	},
};
