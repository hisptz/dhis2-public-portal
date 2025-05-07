import { ChartVisualizationItem } from '@packages/shared/schemas';
// import { MapVisComponent } from '@packages/shared/components';
import React from 'react';
import { useMapConfig } from '../../../hooks/map';
import { FullLoader } from '../../../../FullLoader';
import { MapVisComponent } from './MapComponents/MapVisComponent';
 
export interface MainVisualizationProps {
  config: ChartVisualizationItem;
  disableActions?: boolean;
}

export function MapVisualization({
  config,
  disableActions,
}: MainVisualizationProps) {
  const { id } = config;
  const { mapConfig, loading, error } = useMapConfig(id);
  console.log('mapConfig', mapConfig);
  console.log('config', config);

  if (loading) {
    return < FullLoader />;
  }

  if (error || !mapConfig) {
    throw new Error(error || 'Could not get map details');
  }
  

  try {
    return (
      <MapVisComponent
        disableActions={disableActions}
        mapConfig={mapConfig}
        config={config}
      />
    );
  } catch (err) {
    console.error('Error rendering MapVisComponent:', err);
    throw new Error('Failed to render map visualization');
  }
}