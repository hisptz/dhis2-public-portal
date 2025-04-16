declare module "*.module.css" {
	const classes: { [key: string]: string };
	export default classes;
}

declare module "@dhis2/cypress-plugins";
