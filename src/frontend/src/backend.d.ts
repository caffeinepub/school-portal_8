import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface MediaItem {
    studentId: bigint;
    fileType: FileType;
    timestamp: string;
    caption: string;
    blobReferenceId: string;
}
export interface UserProfile {
    studentId?: bigint;
    name: string;
}
export enum FileType {
    video = "video",
    photo = "photo"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addMedia(media: MediaItem): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteMedia(blobReferenceId: string): Promise<void>;
    getAllKeys(): Promise<Array<string>>;
    getAllMedia(): Promise<Array<MediaItem>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getData(key: string): Promise<string | null>;
    getMedia(blobReferenceId: string): Promise<MediaItem | null>;
    getMediaByStudentId(studentId: bigint): Promise<Array<MediaItem>>;
    getMediaByType(studentId: bigint, fileType: FileType): Promise<Array<MediaItem>>;
    getStudentMediaCount(studentId: bigint): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setData(key: string, value: string): Promise<void>;
    updateCaption(blobReferenceId: string, newCaption: string): Promise<void>;
}
