// Stub config module — canister ID is read from environment variables
export async function loadConfig(): Promise<{ backend_canister_id: string }> {
  const id = import.meta.env.VITE_CANISTER_ID_BACKEND ?? "Not available";
  return { backend_canister_id: id };
}
