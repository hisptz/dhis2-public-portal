export type MapQueryResponse = {
	maps: {
		maps: Array<{
			id: string;
			displayName: string;
		}>;
	};
};

export type VisualizationQueryResponse = {
	vis: {
		visualizations: Array<{
			id: string;
			displayName: string;
			type: string;
		}>;
	};
};
