import {
  LayoutDashboard,
  Joystick,
  BatteryCharging,
  Route,
  MapPin,
  Thermometer,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Controls", href: "/controls", icon: Joystick },
  { label: "Charging", href: "/charging", icon: BatteryCharging },
  { label: "Drives", href: "/drives", icon: Route },
  { label: "Map", href: "/map", icon: MapPin },
  { label: "Climate", href: "/climate", icon: Thermometer },
  { label: "Settings", href: "/settings", icon: Settings },
];

export const CLIMATE_KEEPER_MODES = [
  { value: 0, label: "Off", icon: "power" },
  { value: 1, label: "Keep", icon: "thermometer" },
  { value: 2, label: "Dog", icon: "dog" },
  { value: 3, label: "Camp", icon: "tent" },
] as const;

export const SEAT_NAMES = [
  { id: "driver", label: "Driver", position: "front-left" },
  { id: "passenger", label: "Passenger", position: "front-right" },
  { id: "rear_left", label: "Rear Left", position: "rear-left" },
  { id: "rear_center", label: "Rear Center", position: "rear-center" },
  { id: "rear_right", label: "Rear Right", position: "rear-right" },
] as const;

export const SOFTWARE_UPDATE_DELAYS = [
  { label: "Now", seconds: 0 },
  { label: "2 hours", seconds: 7200 },
  { label: "4 hours", seconds: 14400 },
  { label: "8 hours", seconds: 28800 },
] as const;

export const GOOGLE_MAPS_DARK_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#1d1d2e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1d1d2e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8ec3b9" }] },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#2a2a3e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#3c3c50" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#1a1a2e" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#1a1a2e" }],
  },
] as const;
