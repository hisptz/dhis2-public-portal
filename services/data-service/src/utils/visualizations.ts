import { dhis2Client, getSourceClientFromConfig } from "@/clients/dhis2";
import logger from "@/logging";
import * as _ from "lodash";

enum DisplayItemType {
  RICH_TEXT = "RICH_TEXT",
  VISUALIZATION = "VISUALIZATION",
  HIGHLIGHTED_SINGLE_VALUE = "HIGHLIGHTED_SINGLE_VALUE",
  FEEDBACK = "FEEDBACK",
  SECTION = "SECTION",
}

export enum VisualizationDisplayItemType {
  CHART = "CHART",
  MAP = "MAP",
  BANNER = "BANNER",
}

type Visualization = {
  id: string;
  type: string;
};
type Dashboard = {
  visualizations: Visualization[];
  groups: {
    visualizations: Visualization[];
    subGroups: {
      visualizations: Visualization[];
    }[];
  }[];
};

type ModuleConfig = any;

export async function getModuleConfigs(configId?: string) {
  try {
    const client = configId ? await getSourceClientFromConfig(configId) : dhis2Client;
    const url = `dataStore/hisptz-public-portal-modules`;
    const response = await client.get<Array<String>>(url);
    const moduleIds = response.data ?? [];
    const moduleConfigs = [];
    for (const moduleId of moduleIds) {
      const moduleUrl = `dataStore/hisptz-public-portal-modules/${moduleId}`;
      const moduleResponse = await client.get<{
        config: ModuleConfig;
        type: DisplayItemType;
      }>(moduleUrl);

      if (!moduleResponse.data || !moduleResponse.data.config) {
        console.warn(`Module config for ${moduleId} is empty or undefined`);
        continue;
      }
      if (moduleResponse.data.type == DisplayItemType.VISUALIZATION) {
        if (moduleResponse.data.config.grouped) {
          for (const group of moduleResponse.data.config.groups || []) {
            if (group.items && Array.isArray(group.items)) {
              moduleConfigs.push(...group.items.map((item: any) => item.item));
            }
          }
        } else {
          if (moduleResponse.data.config.items && Array.isArray(moduleResponse.data.config.items)) {
            moduleConfigs.push(
              ...moduleResponse.data.config.items.map((item: any) => item.item)
            );
          }
        }
      }
      if (moduleResponse.data.type == DisplayItemType.SECTION) {
        for (const section of moduleResponse.data.config.sections || []) {
          if (
            section.type == "SINGLE_ITEM" &&
            section.item &&
            (section.item.type == DisplayItemType.VISUALIZATION ||
              section.item.type == DisplayItemType.HIGHLIGHTED_SINGLE_VALUE)
          ) {
            moduleConfigs.push(section.item.item);
          } else {
            if (section.type != "SINGLE_ITEM" && section.items && Array.isArray(section.items)) {
              moduleConfigs.push(
                ...section.items.map((item: any) => item.item)
              );
            }
          }
        }
      }
    }
    return moduleConfigs.flat().filter((config) => config != undefined) ?? [];
  } catch (e) {
    console.error(e);
  }
}

export function getVisualizations(
  moduleConfigs: { id: string; type: VisualizationDisplayItemType }[]
) {
  const visualizations = [];
  visualizations.push(
    ...(moduleConfigs?.filter(
      (module) => module.type != VisualizationDisplayItemType.MAP
    ) ?? [])
  );
  return visualizations;
}

export function getMaps(
  moduleConfigs: { id: string; type: VisualizationDisplayItemType }[]
) {
  const maps = [];
  maps.push(
    ...(moduleConfigs?.filter(
      (module) => module.type == VisualizationDisplayItemType.MAP
    ) ?? [])
  );
  return maps;
}

export async function getVisualizationConfigs(visualizations: Visualization[], configId?: string) {
  const client = configId ? await getSourceClientFromConfig(configId) : dhis2Client;
  if (visualizations.length < 30) {
    const response = await client.get<{ visualizations: any[] }>(
      `visualizations`,
      {
        params: {
          fields: ":owner,!createdBy,!lastUpdatedBy,!created,!lastUpdated",
          filter: `id:in:[${visualizations.map((vis) => vis.id).join(",")}]`,
          paging: false,
        },
      }
    );
    return response.data?.visualizations;
  }
  const visualizationConfigs = [];
  const chunked = _.chunk(visualizations, 30);
  for (const chunk of chunked) {
    const ids = chunk.map((vis) => vis.id).join(",");
    const response = await client.get<{ visualizations: any[] }>(
      `visualizations`,
      {
        params: {
          fields: ":owner,!createdBy,!lastUpdatedBy,!created,!lastUpdated",
          filter: `id:in:[${ids}]`,
          paging: false,
        },
      }
    );
    visualizationConfigs.push(...response.data.visualizations);
  }
  return visualizationConfigs;
}

export async function getMapsConfig(maps: Visualization[], configId?: string) {
  const client = configId ? await getSourceClientFromConfig(configId) : dhis2Client;
  if (maps.length < 30) {
    const response = await client.get<{ maps: any[] }>(`maps`, {
      params: {
        fields: ":owner,!createdBy,!lastUpdatedBy,!created,!lastUpdated",
        filter: `id:in:[${maps.map((vis) => vis.id).join(",")}]`,
        paging: false,
      },
    });
    return response.data.maps;
  }
  const mapConfigs = [];
  const chunked = _.chunk(maps, 30);
  for (const chunk of chunked) {
    const response = await client.get<{ maps: any[] }>(`maps`, {
      params: {
        fields: ":owner,!createdBy,!lastUpdatedBy,!created,!lastUpdated",
        filter: `id:in:[${chunk.map((vis) => vis.id).join(",")}]`,
        paging: false,
      },
    });
    mapConfigs.push(...response.data.maps);
  }
  return mapConfigs;
}

export function getIndicatorIdsFromVisualizations(visualizationConfigs: any[]) {
  return _.compact(
    _.flattenDeep(
      visualizationConfigs.map((config) =>
        config.dataDimensionItems.map(
          (item: { indicator?: { id: string } }) => item.indicator?.id
        )
      )
    )
  );
}

export function getIndicatorIdsFromMaps(mapsConfig: any[]) {
  return _.compact(
    _.flattenDeep(
      mapsConfig.map((config) =>
        config.mapViews.map((view: any) =>
          view.dataDimensionItems.map(
            (item: { indicator?: { id: string } }) => item.indicator?.id
          )
        )
      )
    )
  );
}

export async function getIndicatorConfigs(indicatorIds: string[], configId?: string) {
  const client = configId ? await getSourceClientFromConfig(configId) : dhis2Client;
  if (indicatorIds.length < 30) {
    const response = await client.get<{ indicators: any[] }>(
      `indicators`,
      {
        params: {
          fields: ":owner,!createdBy,!lastUpdatedBy,!created,!lastUpdated",
          filter: `id:in:[${indicatorIds.join(",")}]`,
          paging: false,
        },
      }
    );
    return response.data.indicators.map((indicator) => ({
      ...indicator,
      translations: [],
    }));
  }
  const indicators = [];
  const chunked = _.chunk(indicatorIds, 30);
  for (const chunk of chunked) {
    const response = await client.get<{ indicators: any[] }>(
      `indicators`,
      {
        params: {
          fields: ":owner,!createdBy,!lastUpdatedBy,!created,!lastUpdated",
          filter: `id:in:[${chunk.join(",")}]`,
          paging: false,
        },
      }
    );
    indicators.push(
      ...response.data.indicators.map((indicator) => ({
        ...indicator,
        translations: [],
      }))
    );
  }
  return indicators;
}

export function getDataElementIdsFromMaps(mapsConfig: any[]) {
  return _.compact(
    _.flattenDeep(
      mapsConfig.map((config) =>
        config.mapViews.map((view: any) =>
          view.dataDimensionItems.map(
            (item: { dataElement?: { id: string } }) => item.dataElement?.id
          )
        )
      )
    )
  );
}

export function getDataElementIdsFromVisualizations(
  visualizationConfigs: any[]
) {
  return _.compact(
    _.flattenDeep(
      visualizationConfigs.map((config) =>
        config.dataDimensionItems.map(
          (item: { dataElement?: { id: string } }) => item.dataElement?.id
        )
      )
    )
  );
}

export async function getDataElementConfigs(dataElementIds: string[], configId?: string) {
  const client = configId ? await getSourceClientFromConfig(configId) : dhis2Client;
  if (dataElementIds.length < 30) {
    const response = await client.get<{ dataElements: any[] }>(
      `dataElements`,
      {
        params: {
          fields: ":owner,!createdBy,!lastUpdatedBy,!created,!lastUpdated",
          filter: `id:in:[${dataElementIds.join(",")}]`,
          paging: false,
        },
      }
    );

    return response.data.dataElements.map((dataElement) => ({
      ...dataElement,
      translations: [],
    }));
  }
  const dataElements = [];
  const chunked = _.chunk(dataElementIds, 30);
  for (const chunk of chunked) {
    const response = await client.get<{ dataElements: any[] }>(
      `dataElements`,
      {
        params: {
          fields: ":owner,!createdBy,!lastUpdatedBy,!created,!lastUpdated",
          filter: `id:in:[${chunk.join(",")}]`,
          paging: false,
        },
      }
    );
    dataElements.push(
      ...response.data.dataElements.map((dataElement) => ({
        ...dataElement,
        translations: [],
      }))
    );
  }
  return dataElements;
}
