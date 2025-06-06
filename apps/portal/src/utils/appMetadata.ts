import {
	getAppConfigWithNamespace,
	updateAppConfigWithNamespace,
} from "@/utils/config";
import { DatastoreNamespaces } from "@packages/shared/constants";
import { AppMeta } from "@packages/shared/schemas";
import { Metadata } from "next";
import { FaviconOptions, favicons } from "favicons";
import { dhis2HttpClient } from "@/utils/api/dhis2";
import * as fs from "node:fs";
import * as path from "node:path";
import { isEmpty, last } from "lodash";

export async function getAppMetadata(): Promise<Metadata> {
	try {
		let config = await getAppConfigWithNamespace<AppMeta>({
			namespace: DatastoreNamespaces.MAIN_CONFIG,
			key: "metadata",
		});

		if (!config) {
			return {
				title: "Public Portal",
				description: "DHIS2 FlexiPortal",
			};
		}
		if (config.icon && isEmpty(config.icons)) {
			const faviconOptions: FaviconOptions = {
				icons: {
					favicons: true,
					appleIcon: false,
					android: false,
					windows: false,
					appleStartup: false,
					yandex: false,
				},
			};
			const icon = await dhis2HttpClient.getRaw(
				`documents/${config.icon}/data`,
			);
			const iconBuffer = await (await icon.blob()).arrayBuffer();
			const generatedIcons = await favicons(
				Buffer.from(iconBuffer),
				faviconOptions,
			);
			const dest = "./public";
			const icons: Metadata["icons"] = [];
			//Save the images in the public folder
			console.info(
				`Saving generated icons to ${process.cwd()}/${dest.replace("./", "")}...`,
			);
			try {
				for (const icon of generatedIcons.images) {
					fs.writeFileSync(path.join(dest, icon.name), icon.contents);
					icons.push({
						rel: "icon",
						url: `/${icon.name}`,
						type: `image/${last(icon.name.split("."))}`,
					});
				}
				console.info(`Done!`);
			} catch (e) {
				if (e instanceof Error) {
					console.error(`Could not generate icons: ${e.message}`);
					console.error(e);
				}
			}

			//We need to save the generated references back to the config
			if (!isEmpty(icons)) {
				try {
					//we are not waiting for this as it is a side effect
					await updateAppConfigWithNamespace({
						namespace: DatastoreNamespaces.MAIN_CONFIG,
						key: "metadata",
						data: {
							...config,
							icons,
						},
					});
					config = await getAppConfigWithNamespace<AppMeta>({
						namespace: DatastoreNamespaces.MAIN_CONFIG,
						key: "metadata",
					});
				} catch (e) {
					console.warn(`Could not save icons to config`);
				}
			}

			return {
				applicationName: config?.name,
				title: {
					default: config?.name,
					template: `%s | ${config?.name}`,
				},
				description: config?.description,
				icons,
			} as Metadata;
		}

		return {
			applicationName: config?.name,
			title: {
				default: config?.name,
				template: `%s | ${config?.name}`,
			},
			description: config?.description,
			icons: [...config.icons],
		} as Metadata;
	} catch (e) {
		return {
			title: "Public Portal",
			description: "DHIS2 FlexiPortal",
		};
	}
}

export async function getAppMeta(): Promise<AppMeta | undefined> {
	try {
		return (await getAppConfigWithNamespace<AppMeta>({
			namespace: DatastoreNamespaces.MAIN_CONFIG,
			key: "metadata",
		}))!;
	} catch (e) {
		return;
	}
}
