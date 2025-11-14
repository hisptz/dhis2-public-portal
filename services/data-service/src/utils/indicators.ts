import { chunk, compact, filter, uniq } from "lodash";
import { mapSeries } from "async";
import { dhis2Client, createSourceClient } from "@/clients/dhis2";
import { getDefaultCategoryValues, getDestinationDefaultCategoryValues } from "./default-categories";
import logger from "@/logging";
import { fetchItemsInParallel } from "./parallel-fetch";

type Indicator = {
  id: string;
  indicatorType: { id: string };
  numerator: string;
  denominator: string;
};

let sourceDefaults: Awaited<ReturnType<typeof getDefaultCategoryValues>> | null = null;
let destinationDefaults: Awaited<ReturnType<typeof getDestinationDefaultCategoryValues>> | null = null;

async function getSourceDefaults(routeId?: string) {
  if (!sourceDefaults) {
    sourceDefaults = await getDefaultCategoryValues(routeId);
  }
  return sourceDefaults;
}

async function getDestinationDefaults() {
  if (!destinationDefaults) {
    destinationDefaults = await getDestinationDefaultCategoryValues();
  }
  return destinationDefaults;
}

export async function getDataElementsFromServer(dataElementIds: string[], routeId?: string) {
  if (!dataElementIds || dataElementIds.length === 0) {
    logger.warn("No data element IDs provided — skipping fetch");
    return [];
  }

  logger.info(`Fetching ${dataElementIds.length} data elements from server`, {
    routeId,
    dataElementCount: dataElementIds.length,
    sampleIds: dataElementIds.slice(0, 5)
  });

  const client = routeId ? await createSourceClient(routeId) : dhis2Client;

  const dataElements = await fetchItemsInParallel(
    client,
    'dataElements',
    dataElementIds,
    ':owner,!createdBy,!lastUpdatedBy,!created,!lastUpdated',
    5

  );

  logger.info(`getDataElementsFromServer completed: ${dataElements.length} data elements fetched`);
  return dataElements;
}

export async function getDataElements(dataElementIds: string[], routeId?: string) {
  if (dataElementIds.length > 100) {
    const chunks = chunk(dataElementIds, 100);
    const dataElements = await mapSeries(chunks, async (chunk: string[]) => {
      return getDataElementsFromServer(chunk, routeId);
    });
    return dataElements.flat();
  }
  return getDataElementsFromServer(dataElementIds, routeId);
}

export async function getCategoryCombos(categoryOptionComboIds: string[], routeId?: string) {
  const client = routeId ? await createSourceClient(routeId) : dhis2Client;
  const categories = [];
  const categoryOptions = [];
  const categoryCombos = [];
  const categoryOptionCombos = [];

  logger.info("Fetching category option combos...");

  const fetchedCategoryOptionCombos = await fetchItemsInParallel(
    client,
    'categoryOptionCombos',
    categoryOptionComboIds,
    ':owner,!createdBy,!lastUpdatedBy,!created,!lastUpdated',
    5

  );

  categoryOptionCombos.push(...fetchedCategoryOptionCombos);
  logger.info(`Successfully fetched ${fetchedCategoryOptionCombos.length} category option combos`);

  const categoryComboIds = uniq(
    fetchedCategoryOptionCombos.map(
      (categoryOptionCombo: any) => categoryOptionCombo.categoryCombo.id
    )
  );
  logger.info(`Extracted ${categoryComboIds.length} unique category combo IDs`, {
    categoryComboIds: categoryComboIds.slice(0, 10)
  });

  logger.info("Fetching category combos...");

  const fetchedCategoryCombos = await fetchItemsInParallel(
    client,
    'categoryCombos',
    categoryComboIds,
    ':owner,!createdBy,!lastUpdatedBy,!created,!lastUpdated',
    5

  );

  categoryCombos.push(...fetchedCategoryCombos);
  logger.info(`Successfully fetched ${fetchedCategoryCombos.length} category combos`);

  const categoriesIds = uniq(
    fetchedCategoryCombos
      .map(({ categories }: any) => categories.map(({ id }: any) => id))
      .flat()
  );
  logger.info(`Extracted ${categoriesIds.length} unique category IDs`, {
    categoriesIds: categoriesIds.slice(0, 10)
  });

  logger.info("Fetching categories...");
  const fetchedCategories = await fetchItemsInParallel(
    client,
    'categories',
    categoriesIds,
    ':owner,!createdBy,!lastUpdatedBy,!created,!lastUpdated,categoryOptions[:owner,!createdBy,!lastUpdatedBy,!created,!lastUpdated]',
    5

  );

  const categoryOptionIds = uniq(
    fetchedCategories
      .map(({ categoryOptions }: any) => categoryOptions.map(({ id }: any) => id))
      .flat()
  );

  logger.info("Fetching category options...");
  const fetchedCategoryOptions = await fetchItemsInParallel(
    client,
    'categoryOptions',
    categoryOptionIds,
    ':owner,!createdBy,!lastUpdatedBy,!created,!lastUpdated,name,shortName',
    5

  );

  categoryOptions.push(...fetchedCategoryOptions);

  categories.push(
    ...fetchedCategories.map((category: any) => ({
      ...category,
      categoryOptions: category.categoryOptions.map(({ id }: any) => ({ id })),
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
  if (!programIndicatorIds || programIndicatorIds.length === 0) {
    logger.warn("No program indicator IDs provided — skipping fetch");
    return {
      dataElements: [],
    };
  }

  const destinationDefaults = await getDestinationDefaults();

  const programIndicators = await fetchItemsInParallel(
    dhis2Client,
    'programIndicators',
    programIndicatorIds,
    'id,name,shortName,legendSets[id]',
    5

  );

  const dataElements = programIndicators.map(
    (programIndicator: any) => {
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

  logger.info(`Successfully converted ${dataElements.length} program indicators to data elements`);
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
  routeId?: string
) {

  const sourceDefaults = await getSourceDefaults(routeId);
  logger.info(`Source default category combo id: ${sourceDefaults.defaultCategoryComboId}`);
  const client = routeId ? await createSourceClient(routeId) : dhis2Client;

  const categoryCombos = [];
  const categoryOptions = [];
  const categoryOptionCombos = [];
  const categories = [];
  const categoryComboIds = uniq(
    dataElements
      .map((dataElement) => dataElement.categoryCombo.id)
      .filter((val) => val != sourceDefaults.defaultCategoryComboId)
  );

  if (categoryComboIds.length === 0) {
    logger.info("No non-default category combos found, returning empty results");
    return {
      categories: [],
      categoryOptions: [],
      categoryCombos: [],
      categoryOptionCombos: [],
    };
  }

  logger.info("Fetching category combos from data elements...");

  const fetchedCategoryCombos = await fetchItemsInParallel(
    client,
    'categoryCombos',
    categoryComboIds,
    ':owner,!createdBy,!lastUpdatedBy,!created,!lastUpdated,categoryOptionCombos[:owner,!createdBy,!lastUpdatedBy,!created,!lastUpdated]',
    5

  );

  categoryCombos.push(...fetchedCategoryCombos);
  categoryOptionCombos.push(
    ...fetchedCategoryCombos
      .map((categoryCombo) => categoryCombo.categoryOptionCombos)
      .flat()
  );
  const categoriesIds = uniq(
    fetchedCategoryCombos
      .map(({ categories }: any) => categories.map(({ id }: any) => id))
      .flat()
  );

  const fetchedCategories = await fetchItemsInParallel(
    client,
    'categories',
    categoriesIds,
    ':owner,!createdBy,!lastUpdatedBy,!created,!lastUpdated,categoryOptions[:owner,!createdBy,!lastUpdatedBy,!created,!lastUpdated]',
    5

  );

  const categoryOptionIds = uniq(
    fetchedCategories
      .map(({ categoryOptions }: any) => categoryOptions.map(({ id }: any) => id))
      .flat()
  );

  const fetchedCategoryOptions = await fetchItemsInParallel(
    client,
    'categoryOptions',
    categoryOptionIds,
    ':owner,!createdBy,!lastUpdatedBy,!created,!lastUpdated,name,shortName',
    5

  );

  categoryOptions.push(...fetchedCategoryOptions);

  categories.push(
    ...fetchedCategories.map((category: any) => ({
      ...category,
      categoryOptions: category.categoryOptions.map(({ id }: any) => ({ id })),
    }))
  );

  return {
    categories,
    categoryOptions,
    categoryCombos,
    categoryOptionCombos,
  };
}

export async function getIndicatorTypes(indicatorTypeIds: string[], routeId?: string) {
  const client = routeId ? await createSourceClient(routeId) : dhis2Client;

  const indicatorTypes = await fetchItemsInParallel(
    client,
    'indicatorTypes',
    indicatorTypeIds,
    ':owner,!createdBy,!lastUpdatedBy,!created,!lastUpdated',
    5

  );

  return indicatorTypes;
}

export async function getIndicatorsSources(indicators: Array<Indicator>, routeId?: string) {
  const dataElementIds: string[] = [];
  const programIndicatorIds: string[] = [];
  const categoryOptionComboIds: string[] = [];
  const indicatorTypes: string[] = indicators.map(
    (indicator) => indicator.indicatorType.id
  );
  const dataSetIds = [];

  logger.info("Extracting data items from indicator expressions...");
  for (const indicator of indicators) {
    const indicatorSources = getIndicatorSources(indicator);
    dataElementIds.push(...indicatorSources.dataElements);
    categoryOptionComboIds.push(
      ...compact(indicatorSources.categoryOptionCombos)
    );
    programIndicatorIds.push(...indicatorSources.programIndicators);
    dataSetIds.push(...indicatorSources.dataSets);
  }

  const dataElements = await getDataElements(uniq(dataElementIds), routeId);
  logger.info(`Successfully fetched ${dataElements.length} data elements`);

  const categoryMeta = await getCategoryCombos(uniq(categoryOptionComboIds), routeId);

  const { dataElements: dataElementsFromProgramIndicators } =
    await getDataElementsForProgramIndicators(uniq(programIndicatorIds));
  logger.info(`Successfully converted ${dataElementsFromProgramIndicators.length} program indicators to data elements`);

  const indicatorTypesResult = await getIndicatorTypes(uniq(indicatorTypes), routeId);
  logger.info(`Successfully fetched ${indicatorTypesResult.length} indicator types`);
  return {
    dataElements: [...dataElements, ...dataElementsFromProgramIndicators],
    programIndicatorIds,
    indicatorTypes: indicatorTypesResult,
    ...categoryMeta,
  };
}

export async function getLegendSets(legendSetIds: string[], routeId?: string) {
  const client = routeId ? await createSourceClient(routeId) : dhis2Client;

  const legendSets = await fetchItemsInParallel(
    client,
    'legendSets',
    legendSetIds,
    ':owner,!createdBy,!lastUpdatedBy,!created,!lastUpdated,legends[:owner,!createdBy,!lastUpdatedBy,!created,!lastUpdated]',
    5

  );

  logger.info(`Successfully fetched ${legendSets.length} legend sets`);
  return {
    legendSets: legendSets,
  };
}
