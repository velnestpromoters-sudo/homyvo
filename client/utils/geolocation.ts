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
    timeout: 8000,
    maximumAge: 10000,
    ...options
  };

  navigator.geolocation.getCurrentPosition(
    onSuccess,
    (err) => {
      console.warn("High accuracy geolocation failed, trying low accuracy fallback...", err);
      navigator.geolocation.getCurrentPosition(
        onSuccess,
        onError || (() => {}),
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    },
    defaultOptions
  );
};
