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
    maximumAge: 300000, // 5 minutes cache lookup
    ...options
  };

  navigator.geolocation.getCurrentPosition(
    onSuccess,
    onError || (() => {}),
    defaultOptions
  );
};
