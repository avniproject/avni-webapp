import { ReportCard } from "openchs-models";
import { isEmpty, isNil } from "lodash";
import WebStandardReportCardType from "./WebStandardReportCardType";

function populateRecordCardFields(reportCard, iconFileS3Key, name, description, query, nested, id, countOfCards) {
  reportCard.id = id;
  reportCard.iconFileS3Key = iconFileS3Key;
  reportCard.name = name;
  reportCard.description = description;
  reportCard.query = query;
  reportCard.nested = nested;
  reportCard.countOfCards = countOfCards;
}

class WebReportCard extends ReportCard {
  static MinimumNumberOfNestedCards = 1;
  static MaximumNumberOfNestedCards = 9;

  get id() {
    return this.that.id;
  }

  set id(x) {
    this.that.id = x;
  }

  get iconFileS3Key() {
    return this.that.iconFileS3Key;
  }

  set iconFileS3Key(x) {
    this.that.iconFileS3Key = x;
  }

  get standardReportCardType() {
    return this.toEntity("standardReportCardType", WebStandardReportCardType);
  }

  set standardReportCardType(x) {
    this.that.standardReportCardType = this.fromObject(x);
  }

  static createNewReportCard() {
    const webReportCard = new WebReportCard();
    populateRecordCardFields(webReportCard, "", "", "", [], false, null, WebReportCard.MinimumNumberOfNestedCards);
    webReportCard.colour = "#ff0000";
    return webReportCard;
  }

  static clone(other) {
    const webReportCard = new WebReportCard();
    populateRecordCardFields(
      webReportCard,
      other.iconFileS3Key,
      other.name,
      other.description,
      other.query,
      other.nested,
      other.id,
      other.countOfCards
    );
    webReportCard.standardReportCardType = other.standardReportCardType;
    webReportCard.colour = other.colour;
    return webReportCard;
  }

  static fromResource(resource) {
    const webReportCard = new WebReportCard();
    populateRecordCardFields(
      webReportCard,
      resource.iconFileS3Key,
      resource.name,
      resource.description,
      resource.query,
      resource.nested,
      resource.id,
      resource.count
    );
    webReportCard.colour = resource.color;
    if (!isNil(resource.standardReportCardType))
      webReportCard.standardReportCardType = WebStandardReportCardType.fromResource(resource.standardReportCardType);
    return webReportCard;
  }

  isNew() {
    return isNil(this.id);
  }

  validate(isStandardReportCard) {
    const errors = [];
    if (isEmpty(this.name)) {
      errors.push({ key: "EMPTY_NAME", message: "Name cannot be empty" });
    }
    if (isEmpty(this.colour)) {
      errors.push({ key: "EMPTY_COLOR", message: "Colour cannot be empty" });
    }
    if (isStandardReportCard && isEmpty(this.standardReportCardType)) {
      errors.push({ key: "EMPTY_TYPE", message: "Standard Report Type cannot be empty" });
    }
    if (!isStandardReportCard && isEmpty(this.query)) {
      errors.push({ key: "EMPTY_QUERY", message: "Query cannot be empty" });
    }
    if (isStandardReportCard && this.nested) {
      errors.push({
        key: "DISALLOWED_NESTED",
        message: "Standard Report Type Card cannot be marked as Nested"
      });
    }
    if (isStandardReportCard && this.countOfCards !== 1) {
      errors.push({
        key: "INVALID_NESTED_CARD_COUNT",
        message: "Standard Report Type Card count should always be 1"
      });
    }
    if (
      !isStandardReportCard &&
      this.nested &&
      (this.countOfCards < WebReportCard.MinimumNumberOfNestedCards || this.countOfCards > WebReportCard.MaximumNumberOfNestedCards)
    ) {
      errors.push({
        key: "INVALID_NESTED_CARD_COUNT",
        message: "Nested Card count cannot be less than 1 or greater than 9"
      });
    }
    return errors;
  }

  toResource() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      color: this.colour,
      query: this.query,
      nested: this.nested,
      count: this.countOfCards,
      standardReportCardTypeId: this.standardReportCardType && this.standardReportCardType.id,
      iconFileS3Key: this.iconFileS3Key
    };
  }
}

export default WebReportCard;
