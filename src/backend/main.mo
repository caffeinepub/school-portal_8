import Map "mo:core/Map";
import Text "mo:core/Text";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Int "mo:core/Int";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  type MediaItem = {
    studentId : Nat;
    blobReferenceId : Text;
    fileType : FileType;
    caption : Text;
    timestamp : Text;
  };

  type FileType = {
    #photo;
    #video;
  };

  public type UserProfile = {
    name : Text;
    studentId : ?Nat;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  let mediaStore = Map.empty<Text, MediaItem>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // User profile management functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Media management functions - Admin only
  public shared ({ caller }) func addMedia(media : MediaItem) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add media");
    };
    mediaStore.add(media.blobReferenceId, media);
  };

  public shared ({ caller }) func updateCaption(blobReferenceId : Text, newCaption : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update media captions");
    };
    switch (mediaStore.get(blobReferenceId)) {
      case (null) { Runtime.trap("Media not found") };
      case (?media) {
        let updatedMedia = { media with caption = newCaption };
        mediaStore.add(blobReferenceId, updatedMedia);
      };
    };
  };

  public shared ({ caller }) func deleteMedia(blobReferenceId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete media");
    };
    ignore mediaStore.remove(blobReferenceId);
  };

  // Query functions - Accessible to students, parents, and guests (no authorization check)
  public query ({ caller }) func getMediaByStudentId(studentId : Nat) : async [MediaItem] {
    mediaStore.values().toArray().filter(
      func(media) {
        media.studentId == studentId;
      }
    );
  };

  public query ({ caller }) func getAllMedia() : async [MediaItem] {
    mediaStore.values().toArray();
  };

  public query ({ caller }) func getMedia(blobReferenceId : Text) : async ?MediaItem {
    mediaStore.get(blobReferenceId);
  };

  public query ({ caller }) func getMediaByType(studentId : Nat, fileType : FileType) : async [MediaItem] {
    mediaStore.values().toArray().filter(
      func(media) {
        media.studentId == studentId and media.fileType == fileType;
      }
    );
  };

  public query ({ caller }) func getStudentMediaCount(studentId : Nat) : async Nat {
    mediaStore.values().toArray().filter(
      func(media) {
        media.studentId == studentId;
      }
    ).size();
  };
};

