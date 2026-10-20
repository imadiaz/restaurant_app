import { useCallback, useEffect, useRef, useState } from 'react';
import { GoogleMap, InfoWindowF, MarkerF, useJsApiLoader } from '@react-google-maps/api';
import { Loader2, MapPin, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDialogAccessibility } from '../../hooks/use.dialog.accessibility';
import type { DriverLocation } from '../../service/drivers.service';
import { DEFAULT_MAP_CENTER, GOOGLE_MAPS_LIBRARIES } from '../../utils/maps/google.maps.config';

interface DriversMapModalProps {
  isOpen: boolean;
  locations: DriverLocation[];
  isLoading: boolean;
  isError: boolean;
  onClose: () => void;
}

const DriversMapModal = ({
  isOpen,
  locations,
  isLoading,
  isError,
  onClose,
}: DriversMapModalProps) => {
  const { t } = useTranslation();
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY ?? '';
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  useDialogAccessibility(isOpen, dialogRef, onClose);

  const fitLocations = useCallback((map: google.maps.Map, points: DriverLocation[]) => {
    if (points.length === 0) {
      map.setCenter(DEFAULT_MAP_CENTER);
      map.setZoom(12);
      return;
    }

    const bounds = new google.maps.LatLngBounds();
    points.forEach(({ lat, lng }) => bounds.extend({ lat, lng }));
    map.fitBounds(bounds);
    if (points.length === 1) map.setZoom(16);
  }, []);

  const handleMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    fitLocations(map, locations);
  }, [fitLocations, locations]);

  useEffect(() => {
    if (mapRef.current) fitLocations(mapRef.current, locations);
  }, [fitLocations, locations]);

  if (!isOpen) return null;

  const selectedDriver = locations.find(({ id }) => id === selectedDriverId);
  const showMap = apiKey && isLoaded && !loadError;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-6">
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drivers-map-title"
        className="relative h-[88dvh] w-full max-w-7xl overflow-hidden rounded-card border border-border bg-background-card shadow-2xl"
      >
        <div className="absolute left-4 top-4 z-10 max-w-[calc(100%-5rem)] rounded-xl border border-border bg-background-card/95 px-4 py-3 shadow-lg backdrop-blur-md">
          <h2 id="drivers-map-title" className="font-bold text-text-main">
            {t('drivers.map.title')}
          </h2>
          <p className="text-xs text-text-muted">
            {t('drivers.map.visible_count', { count: locations.length })}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label={t('common.close')}
          className="absolute right-4 top-4 z-10 rounded-full border border-border bg-background-card p-2.5 text-text-muted shadow-lg transition-colors hover:text-text-main"
        >
          <X className="h-5 w-5" />
        </button>

        {!showMap ? (
          <div className="flex h-full items-center justify-center p-8 text-center text-text-muted">
            {loadError || !apiKey
              ? t('drivers.map.configuration_error')
              : <Loader2 className="h-9 w-9 animate-spin text-primary" />}
          </div>
        ) : (
          <GoogleMap
            center={DEFAULT_MAP_CENTER}
            zoom={12}
            mapContainerStyle={{ width: '100%', height: '100%' }}
            onLoad={handleMapLoad}
            options={{
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: true,
              clickableIcons: false,
            }}
          >
            {locations.map((driver) => (
              <MarkerF
                key={driver.id}
                position={{ lat: driver.lat, lng: driver.lng }}
                title={driver.name}
                onClick={() => setSelectedDriverId(driver.id)}
              />
            ))}

            {selectedDriver && (
              <InfoWindowF
                position={{ lat: selectedDriver.lat, lng: selectedDriver.lng }}
                onCloseClick={() => setSelectedDriverId(null)}
              >
                <div className="min-w-48 space-y-1 text-sm text-slate-800">
                  <p className="font-bold">{selectedDriver.name}</p>
                  <p>{t('drivers.map.phone')}: {selectedDriver.phone || t('drivers.map.no_phone')}</p>
                  <p>Lat: {selectedDriver.lat.toFixed(6)}</p>
                  <p>Lng: {selectedDriver.lng.toFixed(6)}</p>
                </div>
              </InfoWindowF>
            )}
          </GoogleMap>
        )}

        {(isLoading || isError || (showMap && locations.length === 0)) && (
          <div className="pointer-events-none absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-xl border border-border bg-background-card/95 px-4 py-3 text-sm text-text-muted shadow-lg backdrop-blur-md">
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
            {!isLoading && <MapPin className="h-4 w-4 text-primary" />}
            {isLoading
              ? t('drivers.map.loading')
              : isError
                ? t('drivers.map.load_error')
                : t('drivers.map.empty')}
          </div>
        )}
      </div>
    </div>
  );
};

export default DriversMapModal;
