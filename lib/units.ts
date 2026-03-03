/**
 * Unit conversion utilities.
 * Tessie API returns: distances in miles, speeds in mph, temperatures in °C, pressure in bar.
 */

const MI_TO_KM = 1.60934;

// ===== Distance =====

export function convertDistance(miles: number, unit: "mi" | "km"): number {
  return unit === "km" ? miles * MI_TO_KM : miles;
}

export function formatDistance(miles: number, unit: "mi" | "km", decimals = 1): string {
  const value = convertDistance(miles, unit);
  return `${value.toFixed(decimals)} ${unit}`;
}

export function distanceLabel(unit: "mi" | "km"): string {
  return unit;
}

// ===== Speed =====

export function convertSpeed(mph: number, unit: "mi" | "km"): number {
  return unit === "km" ? mph * MI_TO_KM : mph;
}

export function formatSpeed(mph: number, unit: "mi" | "km", decimals = 0): string {
  const value = convertSpeed(mph, unit);
  return `${value.toFixed(decimals)} ${unit === "km" ? "km/h" : "mph"}`;
}

export function speedLabel(unit: "mi" | "km"): string {
  return unit === "km" ? "km/h" : "mph";
}

// ===== Efficiency =====

export function convertEfficiency(whPerMile: number, unit: "mi" | "km"): number {
  // Wh/mi → Wh/km: divide by conversion factor (more distance = fewer Wh per unit)
  return unit === "km" ? whPerMile / MI_TO_KM : whPerMile;
}

export function formatEfficiency(whPerMile: number, unit: "mi" | "km", decimals = 0): string {
  const value = convertEfficiency(whPerMile, unit);
  return `${value.toFixed(decimals)} Wh/${unit}`;
}

export function efficiencyLabel(unit: "mi" | "km"): string {
  return `Wh/${unit}`;
}

// ===== Charge Rate =====

export function formatChargeRate(miPerHr: number, unit: "mi" | "km", decimals = 0): string {
  const value = convertDistance(miPerHr, unit);
  return `${value.toFixed(decimals)} ${unit}/hr`;
}

// ===== Temperature =====

export function convertTemp(celsius: number, unit: "F" | "C"): number {
  return unit === "F" ? Math.round((celsius * 9) / 5 + 32) : Math.round(celsius);
}

export function formatTemp(celsius: number, unit: "F" | "C"): string {
  return `${convertTemp(celsius, unit)}°${unit}`;
}

// ===== Pressure =====

export function convertPressure(bar: number, unit: "psi" | "bar" | "kpa"): string {
  switch (unit) {
    case "psi":
      return (bar * 14.5038).toFixed(1);
    case "kpa":
      return (bar * 100).toFixed(0);
    case "bar":
    default:
      return bar.toFixed(2);
  }
}
