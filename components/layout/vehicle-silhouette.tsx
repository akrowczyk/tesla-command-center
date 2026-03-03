"use client";

import { useVehicleStore } from "@/lib/store";

export function VehicleSilhouette() {
  const vs = useVehicleStore((s) => s.vehicleState);

  const doors = {
    df: vs?.vehicle_state?.df ?? 0,
    dr: vs?.vehicle_state?.dr ?? 0,
    pf: vs?.vehicle_state?.pf ?? 0,
    pr: vs?.vehicle_state?.pr ?? 0,
  };

  const trunks = {
    ft: vs?.vehicle_state?.ft ?? 0,
    rt: vs?.vehicle_state?.rt ?? 0,
  };

  const charging = vs?.charge_state?.charging_state === "Charging";
  const chargePortOpen = vs?.charge_state?.charge_port_door_open ?? false;
  const sentryOn = vs?.vehicle_state?.sentry_mode ?? false;
  const locked = vs?.vehicle_state?.locked ?? true;

  const doorColor = (open: number) =>
    open ? "#e31937" : "rgba(255,255,255,0.15)";
  const doorGlow = (open: number) =>
    open ? "drop-shadow(0 0 4px rgba(227,25,55,0.6))" : "none";

  return (
    <div className="relative w-full max-w-[180px] mx-auto">
      <svg
        viewBox="0 0 200 340"
        className={`w-full ${charging ? "animate-pulse-charging" : ""}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Car body outline */}
        <path
          d="M60 40 Q60 20 100 15 Q140 20 140 40 L145 60 Q150 80 150 100 L155 140 L155 240 Q155 280 145 300 L140 310 Q100 330 60 310 L55 300 Q45 280 45 240 L45 140 L50 100 Q50 80 55 60 Z"
          fill="rgba(255,255,255,0.04)"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1.5"
        />

        {/* Windshield */}
        <path
          d="M70 65 Q100 55 130 65 L135 100 Q100 95 65 100 Z"
          fill="rgba(255,255,255,0.06)"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1"
        />

        {/* Rear window */}
        <path
          d="M70 275 Q100 285 130 275 L135 250 Q100 245 65 250 Z"
          fill="rgba(255,255,255,0.06)"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1"
        />

        {/* Driver front door */}
        <rect
          x="45"
          y="105"
          width="15"
          height="65"
          rx="3"
          fill={doorColor(doors.df)}
          style={{ filter: doorGlow(doors.df) }}
          className="transition-all duration-300"
        />

        {/* Driver rear door */}
        <rect
          x="45"
          y="175"
          width="15"
          height="65"
          rx="3"
          fill={doorColor(doors.dr)}
          style={{ filter: doorGlow(doors.dr) }}
          className="transition-all duration-300"
        />

        {/* Passenger front door */}
        <rect
          x="140"
          y="105"
          width="15"
          height="65"
          rx="3"
          fill={doorColor(doors.pf)}
          style={{ filter: doorGlow(doors.pf) }}
          className="transition-all duration-300"
        />

        {/* Passenger rear door */}
        <rect
          x="140"
          y="175"
          width="15"
          height="65"
          rx="3"
          fill={doorColor(doors.pr)}
          style={{ filter: doorGlow(doors.pr) }}
          className="transition-all duration-300"
        />

        {/* Front trunk */}
        <rect
          x="70"
          y="30"
          width="60"
          height="25"
          rx="8"
          fill={trunks.ft ? "#e31937" : "rgba(255,255,255,0.06)"}
          stroke={trunks.ft ? "#e31937" : "rgba(255,255,255,0.1)"}
          strokeWidth="1"
          className="transition-all duration-300"
        />

        {/* Rear trunk */}
        <rect
          x="70"
          y="290"
          width="60"
          height="25"
          rx="8"
          fill={trunks.rt ? "#e31937" : "rgba(255,255,255,0.06)"}
          stroke={trunks.rt ? "#e31937" : "rgba(255,255,255,0.1)"}
          strokeWidth="1"
          className="transition-all duration-300"
        />

        {/* Charge port (left rear) */}
        <circle
          cx="42"
          cy="250"
          r="6"
          fill={
            charging
              ? "#3b82f6"
              : chargePortOpen
              ? "#22c55e"
              : "rgba(255,255,255,0.08)"
          }
          stroke={
            charging
              ? "#3b82f6"
              : chargePortOpen
              ? "#22c55e"
              : "rgba(255,255,255,0.15)"
          }
          strokeWidth="1"
          className={`transition-all duration-300 ${
            charging ? "animate-pulse" : ""
          }`}
        />

        {/* Sentry mode eye */}
        {sentryOn && (
          <g>
            <circle
              cx="100"
              cy="80"
              r="8"
              fill="none"
              stroke="#e31937"
              strokeWidth="1.5"
              className="animate-pulse"
            />
            <circle cx="100" cy="80" r="3" fill="#e31937" />
          </g>
        )}

        {/* Lock indicator */}
        <g transform="translate(88, 155)">
          {locked ? (
            <>
              <rect
                x="3"
                y="8"
                width="18"
                height="14"
                rx="2"
                fill="rgba(34,197,94,0.3)"
                stroke="#22c55e"
                strokeWidth="1"
              />
              <path
                d="M7 8 V5 Q7 0 12 0 Q17 0 17 5 V8"
                fill="none"
                stroke="#22c55e"
                strokeWidth="1.5"
              />
            </>
          ) : (
            <>
              <rect
                x="3"
                y="8"
                width="18"
                height="14"
                rx="2"
                fill="rgba(227,25,55,0.3)"
                stroke="#e31937"
                strokeWidth="1"
              />
              <path
                d="M7 8 V5 Q7 0 12 0 Q17 0 17 5"
                fill="none"
                stroke="#e31937"
                strokeWidth="1.5"
              />
            </>
          )}
        </g>
      </svg>
    </div>
  );
}
