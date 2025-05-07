import { ChartVisualizationItem, VisualizationChartType } from '@packages/shared/schemas';
// import { YearOverYearDataVisComponent } from '@packages/shared/components';
import { DataVisComponent } from '@packages/shared/components';
import { useVisualizationConfig } from '../../../hooks/visualization';
import React from 'react';
import { useAppearance } from '../../../hooks/appearance';
import { QueryClient, QueryClientProvider } from 'react-query';
import { FullLoader } from '../../../../FullLoader';
import { YearOverYearDataVisComponent } from './YearOverYearComponent/YearOverYearDataVisComponent';

const queryClient = new QueryClient();

export interface MainVisualizationProps {
  config: ChartVisualizationItem;
  disableActions?: boolean;
}

export function DataVisualization({
  config,
  disableActions,
}: MainVisualizationProps) {
  const { id } = config;
  console.log('id', id);
  const { visualizationConfig, loading, error } = useVisualizationConfig(id);
  const { appearance } = useAppearance();
  const colors = appearance?.colors.chartColors ?? [];
  console.log('colors', colors);
  console.log('visualizationConfig', visualizationConfig);

  if (loading) {
    return <FullLoader />;
  }

  if (error || !visualizationConfig) {
    throw new Error(error || 'Could not get visualization details');
  }

  return (
    // <QueryClientProvider client={queryClient}>
    <>
      {[
        VisualizationChartType.YEAR_OVER_YEAR_COLUMN,
        VisualizationChartType.YEAR_OVER_YEAR_LINE,
      ].includes(visualizationConfig.type) ? (
        <YearOverYearDataVisComponent
          colors={colors}
          disableActions={disableActions}
          config={config}
          visualizationConfig={visualizationConfig}
        />
      ) : (
        <DataVisComponent
          colors={colors}
          disableActions={disableActions}
          config={config}
          visualizationConfig={visualizationConfig}
        />
      )}
      </>
    // </QueryClientProvider>
  );
}