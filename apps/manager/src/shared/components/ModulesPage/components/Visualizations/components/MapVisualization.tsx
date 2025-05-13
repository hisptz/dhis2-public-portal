import { ChartVisualizationItem } from '@packages/shared/schemas';
import React from 'react';
import { useMapConfig } from '../../../hooks/map';
import { FullLoader } from '../../../../FullLoader';
import { MapVisComponent } from './MapComponents/MapVisComponent';
 
export interface MainVisualizationProps {
  config: ChartVisualizationItem;
}

export function MapVisualization({
  config,
}: MainVisualizationProps) {
  const { id } = config;
  const { mapConfig, loading, error } = useMapConfig(id);

  if (loading) {
    return < FullLoader />;
  }

  if (error || !mapConfig) {
    throw new Error(error || 'Could not get map details');
  }
  

  try {
    return (
      <MapVisComponent
        mapConfig={mapConfig}
      />
    );
  } catch (err) {
    console.error('Error rendering MapVisComponent:', err);
    throw new Error('Failed to render map visualization');
  }
}