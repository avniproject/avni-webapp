import { StandardReportCardType } from "openchs-models";

class WebStandardReportCardType extends StandardReportCardType {
  get id() {
    return this.that.id;
  }

  set id(x) {
    this.that.id = x;
  }

  static fromResource(resource) {
    const webStandardReportCardType = new WebStandardReportCardType();
    webStandardReportCardType.id = resource.id;
    webStandardReportCardType.uuid = resource.uuid;
    webStandardReportCardType.name = resource.name;
    webStandardReportCardType.description = resource.description;
    webStandardReportCardType.voided = resource.voided;
    return webStandardReportCardType;
  }
}

export default WebStandardReportCardType;
