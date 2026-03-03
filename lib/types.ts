// ===== Vehicle State Types =====

export interface ChargeState {
  battery_heater_on: boolean;
  battery_level: number;
  battery_range: number;
  charge_amps: number;
  charge_current_request: number;
  charge_current_request_max: number;
  charge_enable_request: boolean;
  charge_energy_added: number;
  charge_limit_soc: number;
  charge_limit_soc_max: number;
  charge_limit_soc_min: number;
  charge_limit_soc_std: number;
  charge_miles_added_ideal: number;
  charge_miles_added_rated: number;
  charge_port_cold_weather_mode: boolean;
  charge_port_color: string;
  charge_port_door_open: boolean;
  charge_port_latch: string;
  charge_rate: number;
  charger_actual_current: number;
  charger_phases: number | null;
  charger_pilot_current: number;
  charger_power: number;
  charger_voltage: number;
  charging_state: "Charging" | "Disconnected" | "Complete" | "Stopped" | "NoPower";
  conn_charge_cable: string;
  est_battery_range: number;
  fast_charger_brand: string;
  fast_charger_present: boolean;
  fast_charger_type: string;
  ideal_battery_range: number;
  minutes_to_full_charge: number;
  off_peak_charging_enabled: boolean;
  preconditioning_enabled: boolean;
  scheduled_charging_mode: string;
  scheduled_charging_pending: boolean;
  scheduled_charging_start_time: number | null;
  time_to_full_charge: number;
  timestamp: number;
  trip_charging: boolean;
  usable_battery_level: number;
  energy_remaining: number;
  lifetime_energy_used: number;
}

export interface ClimateState {
  allow_cabin_overheat_protection: boolean;
  auto_seat_climate_left: boolean;
  auto_seat_climate_right: boolean;
  auto_steering_wheel_heat: boolean;
  battery_heater: boolean;
  bioweapon_mode: boolean;
  cabin_overheat_protection: string;
  cabin_overheat_protection_actively_cooling: boolean;
  climate_keeper_mode: string;
  cop_activation_temperature: string;
  defrost_mode: number;
  driver_temp_setting: number;
  fan_status: number;
  inside_temp: number;
  is_auto_conditioning_on: boolean;
  is_climate_on: boolean;
  is_front_defroster_on: boolean;
  is_preconditioning: boolean;
  is_rear_defroster_on: boolean;
  max_avail_temp: number;
  min_avail_temp: number;
  outside_temp: number;
  passenger_temp_setting: number;
  seat_fan_front_left: number;
  seat_fan_front_right: number;
  seat_heater_left: number;
  seat_heater_rear_left: number;
  seat_heater_rear_right: number;
  seat_heater_right: number;
  side_mirror_heaters: boolean;
  steering_wheel_heat_level: number;
  steering_wheel_heater: boolean;
  supports_fan_only_cabin_overheat_protection: boolean;
  timestamp: number;
  wiper_blade_heater: boolean;
}

export interface DriveState {
  gps_as_of: number;
  heading: number;
  latitude: number;
  longitude: number;
  power: number;
  shift_state: string | null;
  speed: number | null;
  timestamp: number;
  active_route_destination: string | null;
  active_route_energy_at_arrival: number | null;
  active_route_latitude: number | null;
  active_route_longitude: number | null;
  active_route_miles_to_arrival: number | null;
  active_route_minutes_to_arrival: number | null;
}

export interface SoftwareUpdate {
  download_perc: number;
  expected_duration_sec: number;
  install_perc: number;
  status: string;
  version: string;
}

export interface SpeedLimitMode {
  active: boolean;
  current_limit_mph: number;
  max_limit_mph: number;
  min_limit_mph: number;
  pin_code_set: boolean;
}

export interface VehicleState {
  car_version: string;
  center_display_state: number;
  dashcam_state: string;
  df: number;
  dr: number;
  pf: number;
  pr: number;
  fd_window: number;
  fp_window: number;
  rd_window: number;
  rp_window: number;
  ft: number;
  rt: number;
  locked: boolean;
  odometer: number;
  sentry_mode: boolean;
  sentry_mode_available: boolean;
  valet_mode: boolean;
  valet_pin_needed: boolean;
  vehicle_name: string;
  remote_start: boolean;
  remote_start_enabled: boolean;
  remote_start_supported: boolean;
  software_update: SoftwareUpdate;
  speed_limit_mode: SpeedLimitMode;
  tpms_pressure_fl: number;
  tpms_pressure_fr: number;
  tpms_pressure_rl: number;
  tpms_pressure_rr: number;
  tpms_soft_warning_fl: boolean;
  tpms_soft_warning_fr: boolean;
  tpms_soft_warning_rl: boolean;
  tpms_soft_warning_rr: boolean;
  homelink_device_count: number;
  homelink_nearby: boolean;
  guest_mode: boolean | null;
  pin_to_drive_enabled: boolean;
  timestamp: number;
}

export interface VehicleConfig {
  can_actuate_trunks: boolean;
  car_type: string;
  charge_port_type: string;
  driver_assist: string;
  efficiency_package: string;
  exterior_color: string;
  exterior_trim: string;
  has_air_suspension: boolean;
  has_seat_cooling: boolean;
  interior_trim_type: string;
  rear_drive_unit: string;
  rear_seat_heaters: number;
  roof_color: string;
  sun_roof_installed: number | null;
  third_row_seats: string;
  trim_badging: string;
  wheel_type: string;
  timestamp: number;
}

export interface GuiSettings {
  gui_24_hour_time: boolean;
  gui_charge_rate_units: string;
  gui_distance_units: string;
  gui_range_display: string;
  gui_temperature_units: string;
  gui_tirepressure_units: string;
  show_range_units: boolean;
  timestamp: number;
}

export interface VehicleFullState {
  id: number;
  vin: string;
  state: "online" | "asleep" | "offline";
  display_name: string;
  charge_state: ChargeState;
  climate_state: ClimateState;
  drive_state: DriveState;
  gui_settings: GuiSettings;
  vehicle_config: VehicleConfig;
  vehicle_state: VehicleState;
}

// ===== Battery =====

export interface BatteryResponse {
  timestamp: number;
  battery_level: number;
  battery_range: number;
  ideal_battery_range: number;
  phantom_drain_percent: number;
  energy_remaining: number;
  lifetime_energy_used: number;
  pack_current: number | null;
  pack_voltage: number | null;
  module_temp_min: number | null;
  module_temp_max: number | null;
}

export interface BatteryHealthResult {
  max_range: number;
  max_ideal_range: number;
  capacity: number;
}

export interface BatteryHealthResponse {
  result: BatteryHealthResult;
}

// ===== Weather =====

export interface WeatherResponse {
  location: string;
  condition: string;
  temperature: number;
  feels_like: number;
  humidity: number;
  visibility: number;
  pressure: number;
  sunrise: number;
  sunset: number;
  cloudiness: number;
  wind_speed: number;
  wind_direction: number;
  timezone: number;
}

// ===== Consumption =====

export interface ConsumptionResponse {
  last_charge_at: number;
  distance_driven: number;
  battery_percent_used: number;
  battery_percent_used_by_driving: number;
  rated_range_used: number;
  rated_range_used_by_driving: number;
  energy_used: number;
  energy_used_by_driving: number;
}

// ===== Location =====

export interface LocationResponse {
  latitude: number;
  longitude: number;
  address: string;
  saved_location: string;
}

// ===== Drive History =====

export interface DriveRecord {
  id: number;
  started_at: number;
  ended_at: number;
  starting_location: string;
  starting_saved_location?: string;
  starting_latitude: number;
  starting_longitude: number;
  starting_odometer: number;
  ending_location: string;
  ending_saved_location?: string;
  ending_latitude: number;
  ending_longitude: number;
  ending_odometer: number;
  starting_battery: number;
  ending_battery: number;
  average_inside_temperature: number;
  average_outside_temperature: number;
  average_speed: number;
  max_speed: number;
  rated_range_used: number;
  odometer_distance: number;
  autopilot_distance: number;
  energy_used: number;
  tag: string | null;
}

export interface DrivesResponse {
  results: DriveRecord[];
}

export interface DriveQueryParams {
  from?: number;
  to?: number;
  limit?: number;
  tag?: string;
  exclude_tag?: string;
  minimum_distance?: number;
  distance_format?: "mi" | "km";
  temperature_format?: "f" | "c";
}

// ===== Drive Path =====

export interface DrivePathPoint {
  timestamp: number;
  latitude: number;
  longitude: number;
  speed?: number;
  battery_level?: number;
  heading?: number;
}

// ===== Charge History =====

export interface ChargeRecord {
  id: number;
  started_at: number;
  ended_at: number;
  location: string;
  saved_location: string;
  latitude: number;
  longitude: number;
  is_supercharger: boolean;
  is_fast_charger: boolean;
  odometer: number;
  energy_added: number;
  energy_used: number;
  miles_added: number;
  starting_battery: number;
  ending_battery: number;
  max_range: number;
  max_ideal_range: number;
  capacity: number;
  cost: number;
  since_last_charge: number;
}

export interface ChargesResponse {
  results: ChargeRecord[];
}

export interface ChargeQueryParams {
  from?: number;
  to?: number;
  limit?: number;
  superchargers_only?: boolean;
  minimum_energy_added?: number;
  distance_format?: "mi" | "km";
}

// ===== Tire Pressure =====

export interface TirePressureResponse {
  front_left: number;
  front_right: number;
  rear_left: number;
  rear_right: number;
  front_left_status: string;
  front_right_status: string;
  rear_left_status: string;
  rear_right_status: string;
  timestamp: number;
}

// ===== Command Response =====

export interface CommandResponse {
  result: boolean;
  woke?: boolean;
}

// ===== App Settings =====

export interface AppSettings {
  refreshInterval: number;
  distanceUnit: "mi" | "km";
  temperatureUnit: "F" | "C";
  pressureUnit: "psi" | "bar" | "kpa";
}
