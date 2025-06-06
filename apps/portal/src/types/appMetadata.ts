export type ModuleMetaProps = {
	params: Promise<{ module: string[] }>;
	searchParams: Promise<{
		group?: string;
		[key: string]: string | string[] | undefined;
	}>;
};
