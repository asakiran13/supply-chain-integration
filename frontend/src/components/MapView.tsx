import Map, { Layer, Source, Popup, NavigationControl } from 'react-map-gl/maplibre';
import { useState, useCallback } from 'react';
import type { MapLayerMouseEvent } from 'react-map-gl/maplibre';
import type { RouteWithStatus, Disruption, ShippingRoute } from '../types';
import 'maplibre-gl/dist/maplibre-gl.css';

const TILE_URL = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

const SEVERITY_COLOR: Record<string, string> = {
  none: '#22c55e',
  low: '#84cc16',
  medium: '#f59e0b',
  high: '#ef4444',
  critical: '#dc2626',
};

function routeToGeoJSON(route: ShippingRoute) {
  return {
    type: 'Feature' as const,
    properties: { id: route.id, name: route.name },
    geometry: {
      type: 'LineString' as const,
      coordinates: route.waypoints,
    },
  };
}

interface Props {
  routes: RouteWithStatus[];
  disruptions: Disruption[];
  highlightRouteId?: string;
  height?: string;
}

export default function MapView({ routes, disruptions, highlightRouteId, height = '100%' }: Props) {
  const [popupInfo, setPopupInfo] = useState<{ lng: number; lat: number; content: string } | null>(null);

  // Collect disruption layer IDs for click handling
  const disruptionLayerIds = disruptions
    .filter((d) => !!d.location)
    .map((d) => `disruption-circle-${d.id}`);

  const handleMapClick = useCallback(
    (e: MapLayerMouseEvent) => {
      if (!e.features || e.features.length === 0) return;
      const feature = e.features[0];
      const layerId: string = (feature.layer as { id: string }).id;
      const disruption = disruptions.find((d) => `disruption-circle-${d.id}` === layerId);
      if (!disruption?.location) return;
      const [lng, lat] = disruption.location;
      setPopupInfo({
        lng,
        lat,
        content: `${disruption.type.toUpperCase()} — ${disruption.severity}\n${disruption.description}`,
      });
    },
    [disruptions]
  );

  return (
    <div style={{ width: '100%', height }}>
      <Map
        initialViewState={{ longitude: 20, latitude: 20, zoom: 1.8 }}
        style={{ width: '100%', height: '100%' }}
        mapStyle={TILE_URL}
        interactiveLayerIds={disruptionLayerIds}
        onClick={handleMapClick}
      >
        <NavigationControl position="top-right" />

        {routes.map((route) => {
          const isHighlighted = route.id === highlightRouteId;
          const color = isHighlighted ? '#3b82f6' : SEVERITY_COLOR[route.max_severity] ?? '#22c55e';
          const width = isHighlighted ? 4 : 2;

          return (
            <Source
              key={route.id}
              id={`route-${route.id}`}
              type="geojson"
              data={routeToGeoJSON(route)}
            >
              <Layer
                id={`line-${route.id}`}
                type="line"
                paint={{
                  'line-color': color,
                  'line-width': width,
                  'line-opacity': 0.85,
                }}
                layout={{ 'line-cap': 'round', 'line-join': 'round' }}
              />
            </Source>
          );
        })}

        {disruptions.map((d) => {
          if (!d.location) return null;
          const [lng, lat] = d.location;
          return (
            <Source
              key={`disruption-${d.id}`}
              id={`disruption-${d.id}`}
              type="geojson"
              data={{
                type: 'Feature',
                properties: {},
                geometry: { type: 'Point', coordinates: [lng, lat] },
              }}
            >
              <Layer
                id={`disruption-circle-${d.id}`}
                type="circle"
                paint={{
                  'circle-radius': 10,
                  'circle-color': SEVERITY_COLOR[d.severity] ?? '#f59e0b',
                  'circle-opacity': 0.85,
                  'circle-stroke-width': 2,
                  'circle-stroke-color': '#fff',
                }}
              />
            </Source>
          );
        })}

        {/* Route center labels */}
        {routes.map((route) => (
          <Source
            key={`label-${route.id}`}
            id={`label-src-${route.id}`}
            type="geojson"
            data={{
              type: 'Feature',
              properties: { name: route.name },
              geometry: { type: 'Point', coordinates: route.center },
            }}
          >
            <Layer
              id={`label-${route.id}`}
              type="symbol"
              layout={{
                'text-field': ['get', 'name'],
                'text-size': 11,
                'text-offset': [0, 0],
                'text-anchor': 'center',
              }}
              paint={{
                'text-color': '#e2e8f0',
                'text-halo-color': '#0f172a',
                'text-halo-width': 1.5,
              }}
            />
          </Source>
        ))}

        {popupInfo && (
          <Popup
            longitude={popupInfo.lng}
            latitude={popupInfo.lat}
            onClose={() => setPopupInfo(null)}
            closeOnClick
          >
            <div style={{ fontSize: 13, whiteSpace: 'pre-line', maxWidth: 200 }}>
              {popupInfo.content}
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
