import React, { useMemo, useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';
import styles from './TravelMap.module.css';

// Dynamically import react-leaflet components with no SSR
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);
const Tooltip = dynamic(
  () => import('react-leaflet').then((mod) => mod.Tooltip),
  { ssr: false }
);
const MarkerClusterGroup = dynamic(
  () => import('react-leaflet-cluster'),
  { ssr: false }
);

// Fix Leaflet icon paths (only runs on client)
function fixLeafletIcons() {
  if (typeof window !== 'undefined') {
    const L = require('leaflet');
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: '/icons/marker-icon-2x.png',
      iconUrl: '/icons/marker-icon.png',
      shadowUrl: '/icons/marker-shadow.png',
      iconSize: [20, 33],
      iconAnchor: [10, 33],
      popupAnchor: [1, -28],
      shadowSize: [33, 33],
      shadowAnchor: [8, 33]
    });
  }
}

/**
 * Format duration for popup display
 */
function formatDuration(startDate, endDate) {
  if (!startDate) return '';

  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : null;

  if (!end) {
    return start.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  const startYear = start.getFullYear();
  const endYear = end.getFullYear();
  const startMonth = start.getMonth();
  const endMonth = end.getMonth();

  if (startYear === endYear && startMonth === endMonth) {
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.getDate()}, ${startYear}`;
  }

  if (startYear === endYear) {
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${startYear}`;
  }

  return `${start.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })} - ${end.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })}`;
}

/**
 * Create custom marker icon with count badge
 */
function createCustomIcon(count, isDarkMode) {
  if (typeof window === 'undefined') return null;

  const L = require('leaflet');

  // If only one travel, use default marker
  if (count <= 1) {
    return new L.Icon.Default();
  }

  // Create custom HTML for marker with badge
  const iconHtml = `
    <div class="custom-marker">
      <img src="/icons/marker-icon.png" class="marker-icon" />
      <div class="marker-badge">${count}</div>
    </div>
  `;

  return L.divIcon({
    html: iconHtml,
    className: 'custom-marker-wrapper',
    iconSize: [20, 33],
    iconAnchor: [10, 33],
    popupAnchor: [1, -28],
  });
}

const TravelMap = ({ travels, allYears, selectedYear, onYearToggle }) => {
  const { theme, systemTheme } = useTheme();
  const isDarkMode = theme === 'system' ? systemTheme === 'dark' : theme === 'dark';
  const [isClient, setIsClient] = useState(false);

  // Initialize Leaflet on client side only
  useEffect(() => {
    setIsClient(true);
    // Dynamically import Leaflet CSS
    import('leaflet/dist/leaflet.css');
    // Dynamically import Marker Cluster CSS
    import('react-leaflet-cluster/dist/assets/MarkerCluster.css');
    // Fix icon paths
    fixLeafletIcons();
  }, []);

  // Group travels by coordinates to handle multiple travels at same location
  const markerData = useMemo(() => {
    const grouped = {};

    travels.forEach(travel => {
      if (!travel.coordinates || !Array.isArray(travel.coordinates)) {
        return;
      }

      travel.coordinates.forEach(coord => {
        // Skip failed geocoding or invalid coordinates
        if (coord.failed || !coord.lat || !coord.lng) return;

        // Round to 4 decimal places for grouping (~11m precision)
        const key = `${coord.lat.toFixed(4)},${coord.lng.toFixed(4)}`;

        if (!grouped[key]) {
          grouped[key] = {
            lat: coord.lat,
            lng: coord.lng,
            place: coord.place,
            travels: [],
          };
        }

        // Avoid duplicate travels at same location
        if (!grouped[key].travels.find(t => t.id === travel.id)) {
          grouped[key].travels.push(travel);
        }
      });
    });

    return Object.values(grouped);
  }, [travels]);

  // Calculate map center and zoom based on markers
  const mapConfig = useMemo(() => {
    if (markerData.length === 0) {
      // Default to world view if no markers
      return { center: [20, 0], zoom: 2 };
    }

    if (markerData.length === 1) {
      // Single marker: center on it with closer zoom
      return { center: [markerData[0].lat, markerData[0].lng], zoom: 6 };
    }

    // Multiple markers: calculate center point
    const lats = markerData.map(m => m.lat);
    const lngs = markerData.map(m => m.lng);

    const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
    const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;

    // Calculate appropriate zoom level based on spread
    const latDiff = Math.max(...lats) - Math.min(...lats);
    const lngDiff = Math.max(...lngs) - Math.min(...lngs);
    const maxDiff = Math.max(latDiff, lngDiff);

    let zoom = 2;
    if (maxDiff < 1) zoom = 8;
    else if (maxDiff < 5) zoom = 6;
    else if (maxDiff < 20) zoom = 4;
    else if (maxDiff < 50) zoom = 3;

    return { center: [centerLat, centerLng], zoom };
  }, [markerData]);

  // Choose tile layer based on theme
  const tileUrl = isDarkMode
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  const tileAttribution = isDarkMode
    ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  // Show loading state on server side
  if (!isClient) {
    return (
      <div className={styles.mapWrapper}>
        <div style={{ padding: '48px 24px', textAlign: 'center', color: '#9a988b' }}>
          Loading map...
        </div>
      </div>
    );
  }

  // Show message if no locations to display
  if (markerData.length === 0) {
    return (
      <div className={styles.noDataMessage}>
        <p>No travel locations available yet. Add location data to your travels in Notion!</p>
      </div>
    );
  }

  return (
    <div className={styles.mapWrapper}>
      {/* Year Filter Overlay */}
      {allYears && allYears.length > 0 && (
        <div className={styles.yearFilterOverlay}>
          {allYears.map((year) => (
            <button
              key={year}
              className={`${styles.yearButton} ${
                selectedYear === year ? styles.yearButtonActive : ''
              }`}
              onClick={() => onYearToggle(year)}
            >
              {year}
            </button>
          ))}
        </div>
      )}

      <MapContainer
        center={mapConfig.center}
        zoom={mapConfig.zoom}
        className={styles.map}
        scrollWheelZoom={true}
        touchZoom={true}
        doubleClickZoom={true}
        zoomControl={true}
        maxZoom={13}
        minZoom={2}
      >
        <TileLayer attribution={tileAttribution} url={tileUrl} />

        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={50}
          spiderfyOnMaxZoom={true}
          showCoverageOnHover={false}
        >
          {markerData.map((marker, idx) => {
            const customIcon = createCustomIcon(marker.travels.length, isDarkMode);

            return (
              <Marker
                key={idx}
                position={[marker.lat, marker.lng]}
                icon={customIcon}
              >
                <Tooltip direction="top" offset={[0, -35]} opacity={0.9}>
                  {marker.place}
                </Tooltip>

                <Popup>
                  <div className={styles.popup}>
                    <h3 className={styles.popupPlace}>{marker.place}</h3>
                    <div className={styles.popupTravels}>
                      {marker.travels.map(travel => (
                        <a
                          key={travel.id}
                          href={`/travels/${travel.id}`}
                          className={styles.popupTravel}
                        >
                          <div className={styles.popupTravelInfo}>
                            <span className={styles.popupTravelTitle}>{travel.title}</span>
                            {travel.startDate && (
                              <span className={styles.popupTravelDate}>
                                {formatDuration(travel.startDate, travel.endDate)}
                              </span>
                            )}
                            {travel.countries && travel.countries.length > 0 && (
                              <div className={styles.popupTravelCountries}>
                                {travel.countries.map((country, idx) => (
                                  <span key={idx} className={styles.countryTag}>
                                    {country}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
};

export default TravelMap;
