"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  APIProvider,
  useMapsLibrary,
  Map,
  Marker,
} from "@vis.gl/react-google-maps";
import { Input } from "./input";
import { cn } from "@/lib/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

// Interfaces para el manejo de datos
interface Location {
  lat: number;
  lng: number;
}

interface Place {
  id: string;
  name: string;
  address: string;
  location: Location;
}

interface PlacesAutocompleteProps {
  value: string;
  onChange: (address: string) => void;
  required?: boolean;
  agencyType: 'mrw' | 'zoom';  // Remove the optional marker
  placeholder?: string;
  className?: string;
}

function PlacesAutocompleteInput({
  value,
  onChange,
  required,
  agencyType = 'mrw', // Add default value
  className,
}: PlacesAutocompleteProps) {
  const places = useMapsLibrary("places");
  // Change to useRef instead of useState for the input element
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [mapCenter, setMapCenter] = useState<Location>({
    lat: 10.4806, // Coordenadas centrales de Venezuela
    lng: -66.9036,
  });
  const [nearbyPlaces, setNearbyPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Move searchNearbyPlaces to useCallback to maintain reference stability
  const searchNearbyPlaces = useCallback(async (location: Location) => {
    if (!places) return;

    setIsLoading(true);
    try {
      const service = new google.maps.places.PlacesService(
        document.createElement("div")
      );
      
      const request = {
        location: location,
        radius: 50000,
        keyword: agencyType === "zoom" ? "ZOOM Envios" : "MRW Agencia",
        type: "establishment",
      };

      service.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          const placesData = results
            .filter((place) => {
              const name = place.name?.toLowerCase() || "";
              return agencyType === "zoom"
                ? name.includes("zoom")
                : name.includes("mrw");
            })
            .map((place) => ({
              id: place.place_id!,
              name: place.name!,
              address: place.vicinity!,
              location: {
                lat: place.geometry!.location!.lat(),
                lng: place.geometry!.location!.lng(),
              },
            }));
          setNearbyPlaces(placesData);
        }
        setIsLoading(false);
      });
    } catch (error) {
      console.error("Error buscando lugares cercanos:", error);
      setIsLoading(false);
    }
  }, [places, agencyType]); // Only depend on places and agencyType

  // Configuración del autocomplete
  useEffect(() => {
    if (!places || !inputRef.current) return;

    const options: google.maps.places.AutocompleteOptions = {
      componentRestrictions: { country: "VE" },
      fields: ["formatted_address", "name", "geometry", "place_id"],
    };

    const autocompleteInstance = new places.Autocomplete(inputRef.current, options);
    
    const placeChangedListener = () => {
      const place = autocompleteInstance.getPlace();
      if (place.geometry?.location) {
        const newLocation = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        setMapCenter(newLocation);
        searchNearbyPlaces(newLocation);
      }
    };

    autocompleteInstance.addListener("place_changed", placeChangedListener);

    return () => {
      if (autocompleteInstance) {
        google.maps.event.clearListeners(autocompleteInstance, 'place_changed');
      }
    };
  }, [places, searchNearbyPlaces]); // Remove inputElement from dependencies

  // Manejar selección de lugar desde el mapa o la lista
  const handlePlaceSelect = (place: Place) => {
    onChange(place.address);
    // Centrar el mapa en la ubicación de la agencia seleccionada
    setMapCenter(place.location);
  };

  return (
    <div className="relative space-y-4">
      <div className="relative">
        <Input
          ref={inputRef} // Use ref instead of callback
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Introduce la zona donde deseas recibir el envío`}
          required={required}
          className={cn(
            "pl-10 pr-4 w-full",
            "focus:ring-2 focus:ring-primary",
            className
          )}
        />
        <FontAwesomeIcon
          icon={faSearch}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
      </div>

      <div className="rounded-lg overflow-hidden border shadow-lg">
        <Map
          zoom={15} 
          center={mapCenter}
          className="w-full h-[300px]"
          
        >
          {nearbyPlaces.map((place) => (
            <Marker
              key={place.id}
              position={place.location}
              title={place.name}
              onClick={() => handlePlaceSelect(place)}
              icon={{
                url:
                  agencyType === "zoom"
                    ? "https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                    : "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
              }}
            />
          ))}
        </Map>

        {isLoading ? (
          <div className="bg-background p-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">
              Buscando agencias...
            </p>
          </div>
        ) : nearbyPlaces.length > 0 ? (
          <div className="bg-background p-4 space-y-2">
            <h3 className="font-medium text-sm">
              Agencias {agencyType?.toUpperCase()} en la zona:
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {nearbyPlaces.map((place) => (
                <button
                  key={place.id}
                  onClick={() => handlePlaceSelect(place)}
                  className="w-full text-left p-2 hover:bg-accent rounded-md text-sm"
                >
                  <p className="font-medium">{place.name}</p>
                  <p className="text-muted-foreground text-xs">
                    {place.address}
                  </p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-background p-4">
            <p className="text-sm text-muted-foreground text-center">
              Introduce una zona para buscar la agencia más cercana
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export function PlacesAutocomplete(props: PlacesAutocompleteProps) {
  return (
    <APIProvider
      apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
      libraries={["places"]}
    >
      <PlacesAutocompleteInput {...props} />
    </APIProvider>
  );
}
