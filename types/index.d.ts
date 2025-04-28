declare module "*.css";
declare module "react-pdf-thumbnail";
declare module "leaflet-easyprint";
declare module "*.svg" {
	import { FC, SVGProps } from "react";
	const content: FC<SVGProps<SVGElement>>;
	export default content;
}

declare module "*.svg?url" {
	const content: any;
	export default content;
}

declare module "@dhis2/multi-calendar-dates";
