import { useActor } from "./useActor";

/**
 * Hook for syncing data to/from the ICP backend.
 * localStorage remains the primary fast cache; ICP is the source of truth across devices.
 * All calls are fire-and-forget and silently fall back on error.
 */
export function useBackendSync() {
  const { actor } = useActor();

  const syncToBackend = async (key: string, data: unknown): Promise<void> => {
    if (!actor) return;
    try {
      await actor.setData(key, JSON.stringify(data));
    } catch {
      // silently ignore — localStorage is the cache
    }
  };

  const loadFromBackend = async (key: string): Promise<unknown | null> => {
    if (!actor) return null;
    try {
      const result = await actor.getData(key);
      if (result === null || result === undefined) return null;
      return JSON.parse(result);
    } catch {
      return null;
    }
  };

  return { syncToBackend, loadFromBackend, actor };
}
