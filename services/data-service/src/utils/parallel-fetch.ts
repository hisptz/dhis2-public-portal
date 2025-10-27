import logger from "@/logging";
import * as _ from "lodash";

 
export async function fetchItemsInParallel<T = any>(
  client: any,
  endpoint: string,
  ids: string[],
  fields: string,
  concurrency: number = 5
): Promise<T[]> {
  if (!ids || ids.length === 0) {
    logger.warn(`No IDs provided for ${endpoint} — skipping fetch`);
    return [];
  }

  logger.info(`Fetching ${ids.length} ${endpoint} items with concurrency ${concurrency}`, {
    endpoint,
    idsCount: ids.length,
    sampleIds: ids.slice(0, 5),
    concurrency
  });
 
  const fetchSingleItem = async (id: string): Promise<T | null> => {
    try {
      logger.info(`Fetching ${endpoint} item: ${id}`);
      const response = await client.get(`${endpoint}/${id}`, {
        params: {
          fields: fields
        }
      });
      logger.info(`Successfully fetched ${endpoint} item: ${id}`);
      return response.data;
    } catch (error: any) {
      logger.error(`Failed to fetch ${endpoint} item ${id}:`, {
        error: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      return null;
    }
  };
 
  const results: T[] = [];
  const chunks = _.chunk(ids, concurrency);
  
  logger.info(`Processing ${chunks.length} batches of max ${concurrency} items each`);

  for (let batchIndex = 0; batchIndex < chunks.length; batchIndex++) {
    const batch = chunks[batchIndex];
    logger.info(`Processing batch ${batchIndex + 1}/${chunks.length} with ${batch.length} items`);
    
    const batchPromises = batch.map(id => fetchSingleItem(id));
    const batchResults = await Promise.all(batchPromises);
    
    batchResults.forEach(item => {
      if (item !== null) {
        results.push(item);
      }
    });
    
    const successCount = batchResults.filter(item => item !== null).length;
    logger.info(`Batch ${batchIndex + 1} completed: ${successCount}/${batch.length} successful`);
    
    if (batchIndex < chunks.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));  // 100ms delay
    }
  }

  logger.info(`fetchItemsInParallel completed for ${endpoint}:`, {
    totalRequested: ids.length,
    totalFetched: results.length,
    successRate: `${Math.round((results.length / ids.length) * 100)}%`
  });

  return results;
}
 