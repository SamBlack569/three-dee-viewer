import React, { useEffect, useMemo, useRef, useState } from 'react';
import { GisLayers } from '../bim-components';

type Props = {
  gisLayers: GisLayers;
};

const TOKEN_STORAGE_KEY = 'that-open-cesium-token';

export default function GisPanel({ gisLayers }: Props) {
  const [token, setToken] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [longitude, setLongitude] = useState(gisLayers.layer3d.longitude);
  const [latitude, setLatitude] = useState(gisLayers.layer3d.latitude);
  const [rotation, setRotation] = useState(0);
  const mapHostRef = useRef<HTMLDivElement | null>(null);

  const hasToken = useMemo(() => token.trim().length > 0, [token]);

  useEffect(() => {
    const previousToken = localStorage.getItem(TOKEN_STORAGE_KEY) ?? '';
    setToken(previousToken);
    setEnabled(gisLayers.layer3d.enabled);

    if (previousToken.length > 0) {
      gisLayers.cesiumToken = previousToken;
    }
  }, [gisLayers]);

  useEffect(() => {
    const mapContainer = gisLayers.layer2d.container;
    const host = mapHostRef.current;
    if (!host) return;

    host.innerHTML = '';
    host.appendChild(mapContainer);

    return () => {
      if (mapContainer.parentElement === host) host.removeChild(mapContainer);
    };
  }, [gisLayers]);

  useEffect(() => {
    const onMapCoordinates = (data: { longitude: number; latitude: number }) => {
      const factor = 1e6;
      setLongitude(Math.round(data.longitude * factor) / factor);
      setLatitude(Math.round(data.latitude * factor) / factor);
    };

    gisLayers.layer2d.onCoordinatesSelectedInMap.add(onMapCoordinates);
    return () => gisLayers.layer2d.onCoordinatesSelectedInMap.remove(onMapCoordinates);
  }, [gisLayers]);

  const onUpdateToken = (value: string) => {
    setToken(value);
    localStorage.setItem(TOKEN_STORAGE_KEY, value);
    if (!value.trim().length) return;
    gisLayers.cesiumToken = value;
  };

  const onToggle3d = (value: boolean) => {
    setEnabled(value);
    gisLayers.layer3d.enabled = value;
  };

  const onLongLatChanged = (nextLongitude: number, nextLatitude: number) => {
    setLongitude(nextLongitude);
    setLatitude(nextLatitude);
    gisLayers.layer2d.setMarkerPosition(nextLongitude, nextLatitude);
    gisLayers.layer3d.longitude = nextLongitude;
    gisLayers.layer3d.latitude = nextLatitude;
    gisLayers.layer3d.updateMapPosition();
  };

  const onRotationChanged = (rotationDeg: number) => {
    setRotation(rotationDeg);
    gisLayers.layer3d.rotation = (rotationDeg * Math.PI) / 180;
    gisLayers.layer3d.updateMapPosition();
  };

  return (
    <section style={{ marginTop: 12, borderTop: '1px solid #2a2a2a', paddingTop: 12 }}>
      <h4 style={{ margin: '0 0 8px' }}>GIS</h4>
      <div style={{ display: 'grid', gap: 8 }}>
        <input
          value={token}
          onChange={(e) => onUpdateToken(e.target.value)}
          placeholder="Insert Cesium token..."
          style={{
            width: '100%',
            borderRadius: 8,
            border: '1px solid #2a2a2a',
            padding: '8px 10px',
            background: '#171717',
            color: '#fff',
            boxSizing: 'border-box'
          }}
        />

        <button
          disabled={!hasToken}
          onClick={() => onToggle3d(!enabled)}
          style={{
            padding: '8px 10px',
            borderRadius: 8,
            border: '1px solid #2a2a2a',
            background: !hasToken ? '#101010' : enabled ? '#284b63' : '#171717',
            color: '#fff',
            cursor: hasToken ? 'pointer' : 'not-allowed'
          }}
        >
          3D Tiles: {enabled ? 'On' : 'Off'}
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <input
            type="number"
            value={longitude}
            min={-180}
            max={180}
            step={0.0001}
            onChange={(e) => onLongLatChanged(Number(e.target.value), latitude)}
            style={inputStyle}
          />
          <input
            type="number"
            value={latitude}
            min={-90}
            max={90}
            step={0.0001}
            onChange={(e) => onLongLatChanged(longitude, Number(e.target.value))}
            style={inputStyle}
          />
        </div>

        <label style={labelStyle}>
          Rotation (deg)
          <input
            type="range"
            value={rotation}
            min={0}
            max={360}
            onChange={(e) => onRotationChanged(Number(e.target.value))}
          />
        </label>

        <div ref={mapHostRef} />
      </div>
    </section>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  borderRadius: 8,
  border: '1px solid #2a2a2a',
  padding: '8px 10px',
  background: '#171717',
  color: '#fff',
  boxSizing: 'border-box'
};

const labelStyle: React.CSSProperties = {
  display: 'grid',
  gap: 6,
  color: '#ddd',
  fontSize: 13
};
