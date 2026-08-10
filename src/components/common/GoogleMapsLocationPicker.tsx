import React, { useState, useRef, useCallback, useEffect } from "react";
import { GoogleMap, useJsApiLoader, MarkerF, Autocomplete } from "@react-google-maps/api";
import { Crosshair, Loader2, MapPin, Search } from "lucide-react";
import { extractAddressComponents, type AddressResult } from "../../utils/maps/google.maps.utils";
import AnatomyText from "../anatomy/AnatomyText";



const LIBRARIES: ("places" | "geometry" | "drawing" | "visualization")[] = ["places"];
const DEFAULT_CENTER = { lat: 18.9213584, lng: -99.244986 };

interface LocationPickerProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelect: (data: AddressResult) => void;
  apiKey: string;
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  initialLat,
  initialLng,
  onLocationSelect,
  apiKey,
}) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: LIBRARIES,
  });

  const initialPosition = initialLat && initialLng && initialLat !== 0
    ? { lat: Number(initialLat), lng: Number(initialLng) }
    : DEFAULT_CENTER;
  const [center, setCenter] = useState(initialPosition);
  const [markerPos, setMarkerPos] = useState(initialPosition);
  
  const mapRef = useRef<google.maps.Map | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // --- 1. GEOLOCATION & INIT LOGIC ---
  useEffect(() => {
    if (initialLat && initialLng && initialLat !== 0) return;

    // B. CREATE MODE: Try to get User's Current Location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCenter(userPos);
          setMarkerPos(userPos);
          
          // Optional: If you want to auto-fill address based on current location immediately:
          // triggerReverseGeocode(userPos.lat, userPos.lng);
        },
        () => {
        }
      );
    }
  }, [initialLat, initialLng]);

  // --- HANDLERS ---

  const triggerReverseGeocode = useCallback((lat: number, lng: number) => {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        const extracted = extractAddressComponents(results[0]);
        onLocationSelect(extracted);
      }
    });
  }, [onLocationSelect]);

  const onMarkerDragEnd = useCallback(async (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setMarkerPos({ lat, lng });
    triggerReverseGeocode(lat, lng);
  }, [triggerReverseGeocode]);

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        
        setCenter({ lat, lng });
        setMarkerPos({ lat, lng });
        mapRef.current?.panTo({ lat, lng });
        mapRef.current?.setZoom(17);
        triggerReverseGeocode(lat, lng);
      }
    }
  };

  const handleRecenter = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const pos = { lat: position.coords.latitude, lng: position.coords.longitude };
            setCenter(pos);
            setMarkerPos(pos);
            mapRef.current?.panTo(pos);
            mapRef.current?.setZoom(16);
        });
    }
  };

  if (!isLoaded) {
    return (
      <div className="w-full h-80 bg-surface-muted flex items-center justify-center rounded-card border border-border">
        <Loader2 className="w-8 h-8 animate-spin text-text-subtle" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-[min(600px,70dvh)] rounded-card overflow-hidden shadow-sm border border-border">
      <GoogleMap
        center={center}
        zoom={15}
        mapContainerStyle={{ width: "100%", height: "100%" }}
        onLoad={(map) => { mapRef.current = map; }}
        options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
            zoomControl: true, // Keep zoom buttons
        }}
      >
        {/* --- SEARCH BAR OVERLAY --- */}
        <div className="absolute top-4 left-4 right-4 z-10 max-w-md mx-auto">
            <Autocomplete
                onLoad={(ref) => (autocompleteRef.current = ref)}
                onPlaceChanged={onPlaceChanged}
            >
                {/* Solid Background Container */}
                <div className="relative shadow-xl rounded-control bg-input ring-1 ring-border group focus-within:ring-2 focus-within:ring-primary transition-all">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400 group-focus-within:text-primary" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search address (e.g. Reforma 222)..."
                        className="
                            w-full py-3.5 pl-12 pr-12 rounded-control border-none 
                            bg-transparent 
                            text-sm font-medium text-text-main placeholder:text-text-subtle
                            focus:outline-none focus:ring-0
                        "
                    />
                </div>
            </Autocomplete>
        </div>

        {/* --- RECENTER BUTTON --- */}
        <button
            onClick={handleRecenter}
            className="absolute bottom-20 right-3 z-10 bg-input p-2.5 rounded-full shadow-lg border border-border text-text-muted hover:text-primary transition-colors"
            title="My Location"
            aria-label="My location"
            type="button"
        >
            <Crosshair className="w-6 h-6" />
        </button>

        {/* Draggable Marker */}
        <MarkerF
          position={markerPos}
          draggable={true}
          onDragEnd={onMarkerDragEnd}
          animation={google.maps.Animation.DROP}
        />
      </GoogleMap>
      
      {/* Footer Instruction */}
      <div className="absolute bottom-4 left-4 right-14 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 flex items-start gap-3 text-xs">
         <div className="p-1.5 bg-primary/10 rounded-full text-primary shrink-0">
            <MapPin className="w-4 h-4" />
         </div>
         <div>
            <AnatomyText.Label className="text-primary mb-0.5">Como usar</AnatomyText.Label>
            <p className="text-gray-600 dark:text-gray-400 leading-snug">
                Arrastra el <span className="text-red-500 font-bold">Pin Rojo</span> al lugar, la información se cargara automaticamente.
            </p>
         </div>
      </div>
    </div>
  );
};

export default LocationPicker;
