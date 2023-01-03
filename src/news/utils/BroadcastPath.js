class BroadcastPath {
  static Root = "broadcast";
  static News = "news";
  static WhatsApp = "whatsApp";
  static ContactGroup = `${this.WhatsApp}/contactGroup`;
}

export default BroadcastPath;
