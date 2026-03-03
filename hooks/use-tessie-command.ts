"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useVehicleStore } from "@/lib/store";
import type { VehicleFullState } from "@/lib/types";

interface UseTessieCommandOptions {
  successMessage?: string;
  errorMessage?: string;
  invalidateKeys?: string[][];
  /**
   * Immediately update the vehicle state in the UI before the API confirms.
   * Receives the current state and returns the modified state.
   * Rolled back automatically if the command fails.
   */
  optimisticUpdate?: (state: VehicleFullState) => VehicleFullState;
}

/** Retry delays (ms) for fetching fresh state after a command. */
const REFRESH_DELAYS = [1500, 3000, 5000];

export function useTessieCommand(
  commandName: string,
  commandFn: () => Promise<unknown>,
  options?: UseTessieCommandOptions
) {
  const queryClient = useQueryClient();
  const addPending = useVehicleStore((s) => s.addPendingCommand);
  const removePending = useVehicleStore((s) => s.removePendingCommand);

  return useMutation({
    mutationKey: [commandName],

    onMutate: async () => {
      // Save snapshot for rollback
      const previousState = useVehicleStore.getState().vehicleState;

      // Apply optimistic update immediately
      if (options?.optimisticUpdate && previousState) {
        const optimisticState = options.optimisticUpdate(previousState);
        useVehicleStore.getState().setVehicleState(optimisticState);
        queryClient.setQueryData(["vehicle-state"], optimisticState);
      }

      return { previousState };
    },

    mutationFn: async () => {
      addPending(commandName);
      return commandFn();
    },

    onSuccess: async () => {
      removePending(commandName);
      toast.success(
        options?.successMessage ??
          `${formatCommandName(commandName)} successful`
      );

      // Retry-fetch fresh state — Tessie's cache may lag behind the actual command
      const { tessie } = await import("@/lib/tessie");

      for (const delay of REFRESH_DELAYS) {
        await new Promise((r) => setTimeout(r, delay));
        try {
          const freshState = await tessie.getVehicleState(false);
          useVehicleStore.getState().setVehicleState(freshState);
          queryClient.setQueryData(["vehicle-state"], freshState);
          break; // success — stop retrying
        } catch {
          // will try again on next delay, or fall through
        }
      }

      queryClient.invalidateQueries({ queryKey: ["battery"] });
      options?.invalidateKeys?.forEach((key) =>
        queryClient.invalidateQueries({ queryKey: key })
      );
    },

    onError: (error: Error, _variables, context) => {
      removePending(commandName);

      // Roll back optimistic update
      if (context?.previousState) {
        useVehicleStore.getState().setVehicleState(context.previousState);
        queryClient.setQueryData(["vehicle-state"], context.previousState);
      }

      toast.error(
        options?.errorMessage ??
          `${formatCommandName(commandName)} failed: ${error.message}`
      );
    },
  });
}

function formatCommandName(name: string): string {
  return name
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
