export function formatLatitude(value) {
  const hemisphere = value >= 0 ? 'N' : 'S'
  return `${Math.abs(value).toFixed(2)}°${hemisphere}`
}

export function formatLongitude(value) {
  const normalized = ((value % 360) + 360) % 360
  const hemisphere = normalized <= 180 ? 'E' : 'W'
  const degrees = normalized <= 180 ? normalized : 360 - normalized
  return `${degrees.toFixed(2)}°${hemisphere}`
}

export function formatCoordinates(latitude, longitude) {
  return `${formatLatitude(latitude)}, ${formatLongitude(longitude)}`
}

export function formatLatLngPair(latitude, longitude) {
  return `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`
}
