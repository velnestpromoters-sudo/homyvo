export const getCurrentPrecisePosition = (
  onSuccess: PositionCallback,
  onError?: PositionErrorCallback,
  options?: PositionOptions
) => {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    if (onError) {
      onError({
        code: 0,
        message: 'Geolocation not supported',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      } as GeolocationPositionError);
    }
    return;
  }

  const defaultOptions: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 0, // Force fresh location query (bypasses cache)
    ...options
  };

  navigator.geolocation.getCurrentPosition(
    onSuccess,
    onError || (() => {}),
    defaultOptions
  );
};

export const isWithinTamilNadu = (lat: number, lng: number) => {
  return lat >= 8.0 && lat <= 14.5 && lng >= 75.0 && lng <= 81.0;
};
