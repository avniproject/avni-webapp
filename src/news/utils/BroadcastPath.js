class BroadcastPath {
  static Root = "broadcast";
  static News = "news";
  static WhatsApp = "whatsApp";
  static WhatsAppFullPath = `${this.Root}/${this.WhatsApp}`;
  static ContactGroup = "contactGroup";
  static ContactGroupFullPath = `${this.Root}/${this.WhatsApp}/${this.ContactGroup}`;
}

export default BroadcastPath;
