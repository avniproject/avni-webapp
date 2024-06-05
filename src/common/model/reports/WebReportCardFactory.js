import WebReportCard from "../WebReportCard";

class WebReportCardFactory {
  static create({ id, uuid, name }) {
    const webReportCard = new WebReportCard();
    webReportCard.id = id;
    webReportCard.uuid = uuid;
    webReportCard.name = name;
    return webReportCard;
  }
}

export default WebReportCardFactory;
