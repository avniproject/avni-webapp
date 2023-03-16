class BroadcastPath {
  static Root = "broadcast";
  static News = "news";
  static WhatsApp = "whatsApp";
  static WhatsAppFullPath = `${this.Root}/${this.WhatsApp}`;
  static ContactGroup = "contactGroup";
  static User = "users";
  static Subject = "subjects";
  static ContactGroupFullPath = `${this.Root}/${this.WhatsApp}/${this.ContactGroup}`;
  static UserFullPath = `/${this.Root}/${this.WhatsApp}/${this.User}`;
  static SubjectFullPath = `/${this.Root}/${this.WhatsApp}/${this.Subject}`;
}

export default BroadcastPath;
