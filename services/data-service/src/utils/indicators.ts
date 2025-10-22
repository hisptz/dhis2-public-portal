import { chunk, compact, uniq } from "lodash";
import { mapSeries } from "async";
import { dhis2Client, getSourceClientFromConfig } from "@/clients/dhis2";
import { getDefaultCategoryValues, getDestinationDefaultCategoryValues } from "./default-categories";

let sourceDefaults: Awaited<ReturnType<typeof getDefaultCategoryValues>> | null = null;
let destinationDefaults: Awaited<ReturnType<typeof getDestinationDefaultCategoryValues>> | null = null;

async function getSourceDefaults(configId?: string) {
  if (!sourceDefaults) {
    sourceDefaults = await getDefaultCategoryValues(configId);
  }
  return sourceDefaults;
}

async function getDestinationDefaults() {
  if (!destinationDefaults) {
    destinationDefaults = await getDestinationDefaultCategoryValues();
  }
  return destinationDefaults;
}

export async function getDataElementsFromServer(dataElementIds: string[], configId?: string) {
  const client = configId ? await getSourceClientFromConfig(configId) : dhis2Client;
  const url = `dataElements`;
  const params = {
    fields: ":owner,!createdBy,!lastUpdatedBy,!created,!lastUpdated",
    filter: `id:in:[${dataElementIds.join(",")}]`,
    paging: false,
  };
  const response = await client.get<{
    dataElements: { id: string; [key: string]: unknown }[];
  }>(url, {
    params,
  });
  return response.data.dataElements;
}

export async function getDataElements(dataElementIds: string[], configId?: string) {
  if (dataElementIds.length > 100) {
    console.info(`Getting data elements in batches of 100`);
    const chunks = chunk(dataElementIds, 100);
    const dataElements = await mapSeries(chunks, async (chunk: string[]) => {
      return getDataElementsFromServer(chunk, configId);
    });
    return dataElements.flat();
  }
  return getDataElementsFromServer(dataElementIds, configId);
}

export async function getCategoryCombos(categoryOptionComboIds: string[], configId?: string) {
  const client = configId ? await getSourceClientFromConfig(configId) : dhis2Client;
  //We first need to get the category combo, then the categories making up the category combos
  const categories = [];
  const categoryOptions = [];
  const categoryCombos = [];
  const categoryOptionCombos = [];
  const url = "categoryOptionCombos";
  const params = {
    fields: ":owner,!createdBy,!lastUpdatedBy,!created,!lastUpdated",
    filter: `id:in:[${categoryOptionComboIds.join(",")}]`,
    paging: false,
  };
  const response = await client.get<{
    categoryOptionCombos: Array<{
      id: string;
      categoryCombo: { id: string };
      [key: string]: unknown;
    }>;
  }>(url, {
    params,
  });

  categoryOptionCombos.push(...response.data.categoryOptionCombos);

  const categoryComboIds = uniq(
    response.data.categoryOptionCombos.map(
      (categoryOptionCombo) => categoryOptionCombo.categoryCombo.id
    )
  );

  const categoryComboUrl = `categoryCombos`;
  const categoryComboParams = {
    fields: ":owner,!createdBy,!lastUpdatedBy,!created,!lastUpdated",
    filter: `id:in:[${categoryComboIds.join(",")}]`,
    paging: false,
  };

  const categoryComboResponse = await client.get<{
    categoryCombos: Array<{
      id: string;
      [key: string]: unknown;
      categories: Array<{ id: string }>;
    }>;
  }>(categoryComboUrl, {
    params: categoryComboParams,
  });

  categoryCombos.push(...categoryComboResponse.data.categoryCombos);

  const categoriesIds = uniq(
    categoryComboResponse.data.categoryCombos
      .map(({ categories }) => categories.map(({ id }) => id))
      .flat()
  );
  const categoryUrl = `categories`;
  const categoryParams = {
    fields:
      ":owner,!createdBy,!lastUpdatedBy,!created,!lastUpdated,categoryOptions[:owner,!createdBy,!lastUpdatedBy,!created,!lastUpdated]",
    filter: `id:in:[${categoriesIds.join(",")}]`,
    paging: false,
  };

  const categoryResponse = await client.get<{
    categories: Array<{
      id: string;
      categoryOptions: Array<{ id: string; [key: string]: unknown }>;
      [key: string]: unknown;
    }>;
  }>(categoryUrl, {
    params: categoryParams,
  });
  categoryOptions.push(
    ...categoryResponse.data.categories
      .map(({ categoryOptions }) => categoryOptions)
      .flat()
  );
  categories.push(
    ...categoryResponse.data.categories.map((category) => ({
      ...category,
      categoryOptions: category.categoryOptions.map(({ id }) => ({ id })),
    }))
  );

  return {
    categories,
    categoryOptions,
    categoryCombos,
    categoryOptionCombos,
  };
}

export async function getDataElementsForProgramIndicators(
  programIndicatorIds: string[]
) {
  const destinationDefaults = await getDestinationDefaults();
  
  const url = `programIndicators`;
  const params = {
    fields: "id,name,shortName,legendSets[id]",
    filter: `id:in:[${programIndicatorIds.join(",")}]`,
    paging: false,
  };
  const response = await dhis2Client.get<{
    programIndicators: Array<{
      id: string;
      name: string;
      shortName: string;
      legendSets: Array<{ id: string }>;
      [key: string]: unknown;
    }>;
  }>(url, {
    params,
  });

  const dataElements = response.data.programIndicators.map(
    (programIndicator) => {
      return {
        id: programIndicator.id,
        name: programIndicator.name,
        shortName: programIndicator.shortName,
        aggregationType: "SUM",
        domainType: "AGGREGATE",
        categoryCombo: {
          id: destinationDefaults.defaultCategoryComboId,
        },
        legendSets: programIndicator.legendSets ?? [],
        valueType: "NUMBER",
      };
    }
  );

  return {
    dataElements,
  };
}

export function getDataItemsFromIndicatorExpression(expression: string) {
  /*
   * So we basically go through all the expression to figure out all data items found in the source based on type
   * Checking for;
   *  #{val} - Data element
   *  #{val.cat} - Data element with categoryOptionCombo
   *  R{val.REPORTING_RATE|ACTUAL_REPORTS|ACTUAL_REPORTS_ON_TIME|EXPECTED_REPORTS|REPORTING_RATE_ON_TIME} - Reporting rates
   *  I{val} - program indicator
   * We need to use regular expression to achieve getting these
   * */
  //We first split the expression by the operator
  const splitExpression = expression
    .split(/\+|\*|-|\//)
    .map((val) => val.trim());
  const dataElementItems = splitExpression
    .filter((val) => val.startsWith("#{"))
    .map((val) =>
      val
        .replace("#{", "")
        .replace("}", "")
        .replace(/\(+/, "")
        .replace(/\)+/, "")
    );
  const programIndicatorItems = splitExpression
    .filter((val) => val.startsWith("I{"))
    .map((val) => val.replace("I{", "").replace("}", ""));
  const reportingRateItems = splitExpression
    .filter((val) => val.startsWith("R{"))
    .map((val) => val.replace("R{", "").replace("}", ""));

  const dataElements = dataElementItems.map((val) => {
    if (val.includes(".")) {
      const [dataElement, categoryOptionCombo] = val.split(".");
      return {
        dataElement,
        categoryOptionCombo,
      };
    }
    return {
      dataElement: val,
      categoryOptionCombo: undefined,
    };
  });
  const programIndicators = programIndicatorItems.map((val) => {
    return {
      programIndicator: val,
    };
  });
  const reportingRates = reportingRateItems.map((val) => {
    const [dataSet, type] = val.split(".");
    return {
      dataSet: dataSet,
      type: type,
    };
  });

  return {
    dataElements,
    programIndicators,
    reportingRates,
  };
}

type Indicator = {
  id: string;
  indicatorType: { id: string };
  numerator: string;
  denominator: string;
};

export function getIndicatorSources(indicator: Indicator) {
  const type = indicator.indicatorType.id;
  const numeratorDataItems = getDataItemsFromIndicatorExpression(
    indicator.numerator
  );
  const denominatorDataItems = getDataItemsFromIndicatorExpression(
    indicator.denominator
  );
  const dataItems = {
    dataElements: uniq([
      ...numeratorDataItems.dataElements.map(({ dataElement }) => dataElement),
      ...denominatorDataItems.dataElements.map(
        ({ dataElement }) => dataElement
      ),
    ]),
    categoryOptionCombos: uniq([
      ...numeratorDataItems.dataElements.map(
        ({ categoryOptionCombo }) => categoryOptionCombo
      ),
      ...denominatorDataItems.dataElements.map(
        ({ categoryOptionCombo }) => categoryOptionCombo
      ),
    ]),
    programIndicators: uniq([
      ...numeratorDataItems.programIndicators.map(
        ({ programIndicator }) => programIndicator
      ),
      ...denominatorDataItems.programIndicators.map(
        ({ programIndicator }) => programIndicator
      ),
    ]),
    dataSets: uniq([
      ...numeratorDataItems.reportingRates.map(({ dataSet }) => dataSet),
      ...denominatorDataItems.reportingRates.map(({ dataSet }) => dataSet),
    ]),
  };
  return {
    indicatorTypes: [type],
    ...dataItems,
  };
}

export async function getCategoryCombosFromDataElements(
  dataElements: Array<{
    id: string;
    categoryCombo: { id: string };
  }>,
  configId?: string
) {
  const sourceDefaults = await getSourceDefaults(configId);
  const client = configId ? await getSourceClientFromConfig(configId) : dhis2Client;
  
  const categoryCombos = [];
  const categoryOptions = [];
  const categoryOptionCombos = [];
  const categories = [];
  const categoryComboIds = dataElements
    .map((dataElement) => dataElement.categoryCombo.id)
    .filter((val) => val != sourceDefaults.defaultCategoryComboId);
  const categoryComboUrl = `categoryCombos`;
  const categoryComboParams = {
    fields:
      ":owner,!createdBy,!lastUpdatedBy,!created,!lastUpdated,categoryOptionCombos[:owner,!createdBy,!lastUpdatedBy,!created,!lastUpdated]",
    filter: `id:in:[${categoryComboIds.join(",")}]`,
    paging: false,
  };

  const categoryComboResponse = await client.get<{
    categoryCombos: Array<{
      id: string;
      [key: string]: unknown;
      categories: Array<{ id: string }>;
      categoryOptionCombos: Array<{ id: string; [key: string]: unknown }>;
    }>;
  }>(categoryComboUrl, {
    params: categoryComboParams,
  });

  categoryCombos.push(...categoryComboResponse.data.categoryCombos);
  categoryOptionCombos.push(
    ...categoryComboResponse.data.categoryCombos
      .map((categoryCombo) => categoryCombo.categoryOptionCombos)
      .flat()
  );
  const categoriesIds = uniq(
    categoryComboResponse.data.categoryCombos
      .map(({ categories }) => categories.map(({ id }) => id))
      .flat()
  );
  const categoryUrl = `categories`;
  const categoryParams = {
    fields:
      ":owner,!createdBy,!lastUpdatedBy,!created,!lastUpdated,categoryOptions[:owner,!createdBy,!lastUpdatedBy,!created,!lastUpdated]",
    filter: `id:in:[${categoriesIds.join(",")}]`,
    paging: false,
  };

  const categoryResponse = await client.get<{
    categories: Array<{
      id: string;
      categoryOptions: Array<{ id: string; [key: string]: unknown }>;
      [key: string]: unknown;
    }>;
  }>(categoryUrl, {
    params: categoryParams,
  });
  categoryOptions.push(
    ...categoryResponse.data.categories
      .map(({ categoryOptions }) => categoryOptions)
      .flat()
  );
  categories.push(
    ...categoryResponse.data.categories.map((category) => ({
      ...category,
      categoryOptions: category.categoryOptions.map(({ id }) => ({ id })),
    }))
  );

  return {
    categories,
    categoryOptions,
    categoryCombos,
    categoryOptionCombos,
  };
}

export async function getIndicatorTypes(indicatorTypeIds: string[], configId?: string) {
  const client = configId ? await getSourceClientFromConfig(configId) : dhis2Client;
  const url = `indicatorTypes`;
  const params = {
    fields: ":owner,!createdBy,!lastUpdatedBy,!created,!lastUpdated",
    filter: `id:in:[${indicatorTypeIds.join(",")}]`,
    paging: false,
  };
  const response = await client.get<{
    indicatorTypes: Array<{ id: string; [key: string]: unknown }>;
  }>(url, {
    params,
  });
  return response.data.indicatorTypes;
}

export async function getIndicatorsSources(indicators: Array<Indicator>, configId?: string) {
  const dataElementIds: string[] = [];
  const programIndicatorIds: string[] = [];
  const categoryOptionComboIds: string[] = [];
  const indicatorTypes: string[] = indicators.map(
    (indicator) => indicator.indicatorType.id
  );
  const dataSetIds = [];
  for (const indicator of indicators) {
    const indicatorSources = getIndicatorSources(indicator);
    dataElementIds.push(...indicatorSources.dataElements);
    categoryOptionComboIds.push(
      ...compact(indicatorSources.categoryOptionCombos)
    );
    programIndicatorIds.push(...indicatorSources.programIndicators);
    dataSetIds.push(...indicatorSources.dataSets);
  }

  const dataElements = await getDataElements(uniq(dataElementIds), configId);
  const categoryMeta = await getCategoryCombos(uniq(categoryOptionComboIds), configId);

  const { dataElements: dataElementsFromProgramIndicators } =
    await getDataElementsForProgramIndicators(uniq(programIndicatorIds));
  return {
    dataElements: [...dataElements, ...dataElementsFromProgramIndicators],
    programIndicatorIds,
    indicatorTypes: await getIndicatorTypes(uniq(indicatorTypes), configId),
    ...categoryMeta,
  };
}

export async function getLegendSets(legendSetIds: string[], configId?: string) {
  const client = configId ? await getSourceClientFromConfig(configId) : dhis2Client;
  const url = `legendSets`;
  const params = {
    fields:
      ":owner,!createdBy,!lastUpdatedBy,!created,!lastUpdated,legends[:owner,!createdBy,!lastUpdatedBy,!created,!lastUpdated]",
    filter: `id:in:[${legendSetIds.join(",")}]`,
    paging: false,
  };
  const response = await client.get<{
    legendSets: Array<{
      id: string;
      [key: string]: unknown;
      legends: Array<{ id: string }>;
    }>;
  }>(url, {
    params,
  });

  return {
    legendSets: response.data.legendSets,
  };
}
