// Migration: drops old stable fields from caffeineai-object-storage and caffeineai-authorization
// extensions that are no longer used in this version.
module {
  // --- Old types (copied inline from previous version's stable signature) ---
  type UserRole = { #admin; #guest; #user };
  type OldData<K, V> = { var count : Nat; kvs : [var ?(K, V)] };
  type OldLeaf<K, V> = { data : OldData<K, V> };
  type OldInternal<K, V> = { children : [var ?OldNode<K, V>]; data : OldData<K, V> };
  type OldNode<K, V> = { #leaf : OldLeaf<K, V>; #internal : OldInternal<K, V> };
  type OldMap<K, V> = { var root : OldNode<K, V>; var size : Nat };

  type OldAccessControlState = {
    var adminAssigned : Bool;
    userRoles : OldMap<Principal, UserRole>;
  };

  type FileType = { #photo; #video };
  type MediaItem = {
    blobReferenceId : Text;
    caption : Text;
    fileType : FileType;
    studentId : Nat;
    timestamp : Text;
  };

  type UserProfile = { name : Text; studentId : ?Nat };

  type OldActor = {
    accessControlState : OldAccessControlState;
    mediaStore : OldMap<Text, MediaItem>;
    storedData : OldMap<Text, Text>;
    userProfiles : OldMap<Principal, UserProfile>;
  };

  // New actor has no stable fields — everything is initialized fresh.
  type NewActor = {};

  // Drop all old fields intentionally; the new backend manages its own fresh state.
  public func run(_old : OldActor) : NewActor {
    {};
  };
};
