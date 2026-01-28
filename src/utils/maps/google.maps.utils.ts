
export interface AddressResult {
  streetAddress: string;
  colony: string;
  city: string;
  state: string;
  zipCode: string;
  lat: number;
  lng: number;
}

export const extractAddressComponents = (
  result: google.maps.GeocoderResult
): AddressResult => {
  let street = "";
  let number = "";
  let colony = "";
  let city = "";
  let state = "";
  let zipCode = "";

  result.address_components.forEach((component) => {
    const types = component.types;

    if (types.includes("street_number")) {
      number = component.long_name;
    }
    if (types.includes("route")) {
      street = component.long_name;
    }
    if (types.includes("sublocality") || types.includes("neighborhood")) {
      colony = component.long_name;
    }
    if (types.includes("locality")) {
      city = component.long_name;
    }
    // Fallback for city if locality is missing
    if (!city && types.includes("administrative_area_level_2")) {
      city = component.long_name;
    }
    if (types.includes("administrative_area_level_1")) {
      state = component.long_name; // e.g. "Ciudad de México"
    }
    if (types.includes("postal_code")) {
      zipCode = component.long_name;
    }
  });

  return {
    streetAddress: `${street} ${number}`.trim(),
    colony,
    city,
    state,
    zipCode,
    lat: result.geometry.location.lat(),
    lng: result.geometry.location.lng(),
  };
};