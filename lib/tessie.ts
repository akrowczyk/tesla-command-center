import type {
  VehicleFullState,
  BatteryResponse,
  BatteryHealthResponse,
  WeatherResponse,
  ConsumptionResponse,
  LocationResponse,
  DrivesResponse,
  DriveQueryParams,
  ChargesResponse,
  ChargeQueryParams,
  CommandResponse,
  DrivePathPoint,
} from "./types";

class TessieApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "TessieApiError";
  }
}

function buildQuery(params?: Record<string, string | number | boolean | undefined>): string {
  if (!params) return "";
  const filtered = Object.entries(params).filter(([, v]) => v !== undefined);
  if (filtered.length === 0) return "";
  const searchParams = new URLSearchParams();
  filtered.forEach(([k, v]) => searchParams.set(k, String(v)));
  return `?${searchParams.toString()}`;
}

type CredentialsGetter = () => {
  apiKey: string | null;
  vin: string | null;
} | null;

class TessieClient {
  private baseUrl = "/api/tessie";
  private credentialsGetter: CredentialsGetter | null = null;

  /** Wire up a getter so BYOK credentials are injected into every request. */
  setCredentialsGetter(fn: CredentialsGetter) {
    this.credentialsGetter = fn;
  }

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const byokHeaders: Record<string, string> = {};
    if (this.credentialsGetter) {
      const creds = this.credentialsGetter();
      if (creds?.apiKey) byokHeaders["X-Tessie-Key"] = creds.apiKey;
      if (creds?.vin) byokHeaders["X-Tessie-VIN"] = creds.vin;
    }

    const res = await fetch(`${this.baseUrl}/${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...byokHeaders,
        ...options?.headers,
      },
    });

    if (!res.ok) {
      let message = res.statusText;
      try {
        const err = await res.json();
        message = err.error || err.message || message;
      } catch {
        // use statusText
      }
      throw new TessieApiError(res.status, message);
    }

    return res.json();
  }

  // ===== State Queries =====

  getVehicleState(useCache = true): Promise<VehicleFullState> {
    return this.request(`state${buildQuery({ use_cache: useCache })}`);
  }

  getBattery(): Promise<BatteryResponse> {
    return this.request("battery");
  }

  getBatteryHealth(params?: { from?: number; to?: number; distance_format?: string }): Promise<BatteryHealthResponse> {
    return this.request(`battery_health${buildQuery(params)}`);
  }

  getLocation(): Promise<LocationResponse> {
    return this.request("location");
  }

  getWeather(): Promise<WeatherResponse> {
    return this.request("weather");
  }

  getConsumption(): Promise<ConsumptionResponse> {
    return this.request("consumption_since_charge");
  }

  getFirmwareAlerts(): Promise<unknown> {
    return this.request("firmware_alerts");
  }

  // ===== History Queries =====

  getDrives(params?: DriveQueryParams): Promise<DrivesResponse> {
    return this.request(`drives${buildQuery(params as Record<string, string | number | boolean | undefined>)}`);
  }

  getCharges(params?: ChargeQueryParams): Promise<ChargesResponse> {
    return this.request(`charges${buildQuery(params as Record<string, string | number | boolean | undefined>)}`);
  }

  async getDrivePath(from: number, to: number, details = true): Promise<DrivePathPoint[]> {
    const res = await this.request<{ results: DrivePathPoint[] }>(`path${buildQuery({ from, to, details })}`);
    return res.results;
  }

  // ===== Commands =====

  private command(cmd: string, body?: Record<string, unknown>): Promise<CommandResponse> {
    return this.request(`command/${cmd}`, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  // Access
  lock() { return this.command("lock"); }
  unlock() { return this.command("unlock"); }
  flashLights() { return this.command("flash"); }
  honk() { return this.command("honk"); }
  remoteStart() { return this.command("remote_start"); }

  // Trunks & Openings
  openFrontTrunk() { return this.command("activate_front_trunk"); }
  openRearTrunk() { return this.command("activate_rear_trunk"); }
  ventWindows() { return this.command("vent_windows"); }
  closeWindows() { return this.command("close_windows"); }
  openChargePort() { return this.command("open_charge_port"); }
  closeChargePort() { return this.command("close_charge_port"); }

  // Climate
  startClimate() { return this.command("start_climate"); }
  stopClimate() { return this.command("stop_climate"); }
  setTemperature(temp: number) { return this.command("set_temperatures", { temperature: temp }); }
  setSeatHeat(seat: string, level: number) { return this.command("set_seat_heat", { seat, level }); }
  setSeatCool(seat: string, level: number) { return this.command("set_seat_cool", { seat, level }); }
  startDefrost() { return this.command("start_max_defrost"); }
  stopDefrost() { return this.command("stop_max_defrost"); }
  startSteeringWheelHeater() { return this.command("start_steering_wheel_heater"); }
  stopSteeringWheelHeater() { return this.command("stop_steering_wheel_heater"); }
  setBioweaponMode(on: boolean) { return this.command("set_bioweapon_mode", { on }); }
  setCabinOverheatProtection(on: boolean, fanOnly?: boolean) {
    return this.command("set_cabin_overheat_protection", { on, fan_only: fanOnly });
  }
  setClimateKeeperMode(mode: number) { return this.command("set_climate_keeper_mode", { mode }); }

  // Charging
  startCharging() { return this.command("start_charging"); }
  stopCharging() { return this.command("stop_charging"); }
  setChargeLimit(percent: number) { return this.command("set_charge_limit", { percent }); }
  setChargingAmps(amps: number) { return this.command("set_charging_amps", { amps }); }

  // Security Modes
  enableSentryMode() { return this.command("enable_sentry"); }
  disableSentryMode() { return this.command("disable_sentry"); }
  enableValetMode() { return this.command("enable_valet"); }
  disableValetMode() { return this.command("disable_valet"); }
  enableGuestMode() { return this.command("enable_guest"); }
  disableGuestMode() { return this.command("disable_guest"); }
  enableSpeedLimit(limitMph?: number) { return this.command("enable_speed_limit", { limit_mph: limitMph }); }
  disableSpeedLimit(pin?: string) { return this.command("disable_speed_limit", { pin }); }

  // Software
  scheduleSoftwareUpdate(offsetSec: number) { return this.command("schedule_software_update", { offset_sec: offsetSec }); }
  cancelSoftwareUpdate() { return this.command("cancel_software_update"); }

  // Drives
  setDriveTag(driveId: number, tag: string): Promise<CommandResponse> {
    return this.request(`drives/set_tag${buildQuery({ drives: String(driveId), tag })}`, { method: "POST" });
  }

  // Fun
  boombox() { return this.command("remote_boombox"); }
  triggerHomelink() { return this.command("trigger_homelink"); }

  // Wake — uses /{vin}/wake, not /{vin}/command/wake
  wake(): Promise<CommandResponse> {
    return this.request("wake", { method: "POST" });
  }
}

export const tessie = new TessieClient();
