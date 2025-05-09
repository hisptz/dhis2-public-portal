import { useDataQuery } from '@dhis2/app-runtime';
import { MapConfig } from '@packages/shared/schemas';

type MapConfigQueryResponse = {
  map: MapConfig;
};

const mapQuery = {
  map: {
    resource: 'maps',
    id: ({ id }: { id: string }) => id,
    params: () => ({
      fields: [
        'id',
        'user',
        'displayName~rename(name)',
        'description',
        'longitude',
        'latitude',
        'zoom',
        'basemap',
        'publicAccess',
        'created',
        'lastUpdated',
        'access',
        'update',
        'manage',
        'delete',
        'href',
        'mapViews[*,columns[dimension,filter,items[dimensionItem~rename(id),dimensionItemType,displayName~rename(name)]],rows[dimension,filter,items[dimensionItem~rename(id),dimensionItemType,displayName~rename(name)]],filters[dimension,filter,items[dimensionItem~rename(id),dimensionItemType,displayName~rename(name)]],organisationUnits[id,path],dataDimensionItems,program[id,displayName~rename(name)],programStage[id,displayName~rename(name)],legendSet[id,displayName~rename(name)],trackedEntityType[id,displayName~rename(name)],organisationUnitSelectionMode,!href,!publicAccess,!rewindRelativePeriods,!userOrganisationUnit,!userOrganisationUnitChildren,!userOrganisationUnitGrandChildren,!externalAccess,!access,!relativePeriods,!columnDimensions,!rowDimensions,!filterDimensions,!user,!organisationUnitGroups,!itemOrganisationUnitGroups,!userGroupAccesses,!indicators,!dataElements,!dataElementOperands,!dataElementGroups,!dataSets,!periods,!organisationUnitLevels,!sortOrder,!topLimit]',
      ].join(','),
    }),
  },
};

export function useMapConfig(mapId: string) {
  const { data, loading, error, refetch } = useDataQuery<MapConfigQueryResponse>(mapQuery, {
    variables: { id: mapId },
  });

  const mapConfig = data?.map;

  if (error) {
    console.error(`Could not get map details for map ${mapId}`);
  }

  return {
    mapConfig,
    loading,
    error: error ? 'Could not get map details' : undefined,
    refetch,
  };
}