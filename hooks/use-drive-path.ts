"use client";

import { useQuery } from "@tanstack/react-query";
import { tessie } from "@/lib/tessie";
import type { DriveRecord } from "@/lib/types";

export function useDrivePath(drive: DriveRecord | null) {
  return useQuery({
    queryKey: ["drive-path", drive?.id],
    queryFn: () => {
      if (!drive) throw new Error("No drive selected");
      return tessie.getDrivePath(drive.started_at, drive.ended_at, true);
    },
    enabled: !!drive,
    staleTime: Infinity, // Path data doesn't change
  });
}
