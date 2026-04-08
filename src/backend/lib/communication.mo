import Types "../types/communication";
import Common "../types/common";
import List "mo:core/List";
import Time "mo:core/Time";

module {
  public type Notice = Types.Notice;
  public type ParentMessage = Types.ParentMessage;
  public type Inquiry = Types.Inquiry;
  public type DiaryEntry = Types.DiaryEntry;
  public type UserId = Common.UserId;
  public type SchoolId = Common.SchoolId;

  // Notices
  public func createNotice(
    notices : List.List<Notice>,
    nextId : Nat,
    title : Text,
    message : Text,
    targetPortals : [Types.TargetPortal],
    priority : { #low; #medium; #high },
    createdBy : UserId,
    schoolId : SchoolId
  ) : Notice {
    let n : Notice = {
      id = nextId;
      title;
      message;
      targetPortals;
      priority;
      createdBy;
      createdAt = Time.now();
      schoolId;
    };
    notices.add(n);
    n
  };

  public func listNotices(notices : List.List<Notice>, schoolId : SchoolId) : [Notice] {
    notices.filter(func(n) { n.schoolId == schoolId }).toArray()
  };

  public func deleteNotice(notices : List.List<Notice>, id : Nat, schoolId : SchoolId) : () {
    let kept = notices.filter(func(n) { not (n.id == id and n.schoolId == schoolId) });
    notices.clear();
    notices.append(kept)
  };

  // Parent Messages
  public func sendParentMessage(
    messages : List.List<ParentMessage>,
    nextId : Nat,
    teacherId : UserId,
    studentId : UserId,
    message : Text,
    schoolId : SchoolId
  ) : ParentMessage {
    let m : ParentMessage = {
      id = nextId;
      teacherId;
      studentId;
      message;
      timestamp = Time.now();
      read = false;
      schoolId;
    };
    messages.add(m);
    m
  };

  public func getMessagesByStudent(messages : List.List<ParentMessage>, studentId : UserId, schoolId : SchoolId) : [ParentMessage] {
    messages.filter(func(m) { m.studentId == studentId and m.schoolId == schoolId }).toArray()
  };

  public func markMessageRead(messages : List.List<ParentMessage>, id : Nat, schoolId : SchoolId) : () {
    messages.mapInPlace(func(m) {
      if (m.id == id and m.schoolId == schoolId) { { m with read = true } }
      else { m }
    })
  };

  // Inquiries
  public func createInquiry(
    inquiries : List.List<Inquiry>,
    nextId : Nat,
    studentName : Text,
    parentName : Text,
    phone : Text,
    email : Text,
    class_ : Text,
    schoolId : SchoolId
  ) : Inquiry {
    let i : Inquiry = {
      id = nextId;
      studentName;
      parentName;
      phone;
      email;
      class_;
      status = #new_;
      notes = "";
      createdAt = Time.now();
      schoolId;
    };
    inquiries.add(i);
    i
  };

  public func listInquiries(inquiries : List.List<Inquiry>, schoolId : SchoolId) : [Inquiry] {
    inquiries.filter(func(i) { i.schoolId == schoolId }).toArray()
  };

  public func updateInquiryStatus(
    inquiries : List.List<Inquiry>,
    id : Nat,
    status : { #new_; #inProgress; #closed },
    notes : Text,
    schoolId : SchoolId
  ) : () {
    inquiries.mapInPlace(func(i) {
      if (i.id == id and i.schoolId == schoolId) { { i with status; notes } }
      else { i }
    })
  };

  // Diary
  public func createDiaryEntry(
    entries : List.List<DiaryEntry>,
    nextId : Nat,
    class_ : Text,
    section : Text,
    date : Text,
    content : Text,
    teacherId : UserId,
    schoolId : SchoolId
  ) : DiaryEntry {
    let d : DiaryEntry = {
      id = nextId;
      class_;
      section;
      date;
      content;
      teacherId;
      schoolId;
      createdAt = Time.now();
    };
    entries.add(d);
    d
  };

  public func getDiaryByClass(entries : List.List<DiaryEntry>, class_ : Text, schoolId : SchoolId) : [DiaryEntry] {
    entries.filter(func(d) { d.class_ == class_ and d.schoolId == schoolId }).toArray()
  };

  public func deleteDiaryEntry(entries : List.List<DiaryEntry>, id : Nat, schoolId : SchoolId) : () {
    let kept = entries.filter(func(d) { not (d.id == id and d.schoolId == schoolId) });
    entries.clear();
    entries.append(kept)
  };
};
