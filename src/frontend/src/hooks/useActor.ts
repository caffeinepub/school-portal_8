// useActor hook — provides a typed actor interface backed by stubs.
// The real ICP backend methods may not be wired up yet; localStorage is the source of truth.
// All stub methods silently succeed so the UI continues to function.

interface MediaInput {
  studentId: bigint;
  fileType: unknown;
  timestamp: string;
  caption: string;
  blobReferenceId: string;
}

export interface ActorInterface {
  getData(key: string): Promise<string | null>;
  setData(key: string, value: string): Promise<void>;
  getAllKeys(): Promise<string[]>;
  deleteData(key: string): Promise<void>;
  addMedia(input: MediaInput): Promise<void>;
  deleteMedia(blobReferenceId: string): Promise<void>;
  getMedia(studentId: number): Promise<unknown[]>;
  updateCaption(blobReferenceId: string, caption: string): Promise<void>;
}

const stubActor: ActorInterface = {
  getData: async () => null,
  setData: async () => {},
  getAllKeys: async () => [],
  deleteData: async () => {},
  addMedia: async () => {},
  deleteMedia: async () => {},
  getMedia: async () => [],
  updateCaption: async () => {},
};

export function useActor(): { actor: ActorInterface; isFetching: boolean } {
  return { actor: stubActor, isFetching: false };
}
