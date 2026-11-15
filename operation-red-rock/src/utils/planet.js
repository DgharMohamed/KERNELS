export function toMapLongitude(longitude) {
  return longitude > 180 ? longitude - 360 : longitude
}

export function getFocusZoom(diameterKm) {
  if (diameterKm >= 1500) return 3
  if (diameterKm >= 400) return 5
  return 7
}
