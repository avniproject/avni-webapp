import { CustomFilter, ReportCard, StandardReportCardType } from "openchs-models";
import { isEmpty, isNil, isInteger, toNumber, lowerCase } from "lodash";
import WebStandardReportCardType from "./WebStandardReportCardType";
import WebSubjectType from "./WebSubjectType";
import WebProgram from "./WebProgram";
import WebEncounterType from "./WebEncounterType";
import _ from "lodash";

function populateRecordCardFields(
  reportCard,
  iconFileS3Key,
  name,
  description,
  query,
  nested,
  id,
  countOfCards,
  standardReportCardInputSubjectTypes,
  standardReportCardInputPrograms,
  standardReportCardInputEncounterTypes,
  standardReportCardInputRecentDuration
) {
  reportCard.id = id;
  reportCard.iconFileS3Key = iconFileS3Key;
  reportCard.name = name;
  reportCard.description = description;
  reportCard.query = query;
  reportCard.nested = nested;
  reportCard.countOfCards = countOfCards;
  reportCard.standardReportCardInputSubjectTypes = standardReportCardInputSubjectTypes;
  reportCard.standardReportCardInputPrograms = standardReportCardInputPrograms;
  reportCard.standardReportCardInputEncounterTypes = standardReportCardInputEncounterTypes;
  reportCard.standardReportCardInputRecentDuration = standardReportCardInputRecentDuration;
}

class WebReportCard extends ReportCard {
  static MinimumNumberOfNestedCards = 1;
  static MaximumNumberOfNestedCards = 9;

  standardReportCardInputRecentDuration;

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
    populateRecordCardFields(webReportCard, "", "", "", [], false, null, WebReportCard.MinimumNumberOfNestedCards, [], [], [], {
      value: "1",
      unit: "days"
    });
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
      other.countOfCards,
      [...other.standardReportCardInputSubjectTypes],
      [...other.standardReportCardInputPrograms],
      [...other.standardReportCardInputEncounterTypes],
      other.standardReportCardInputRecentDuration
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
      resource.count,
      WebSubjectType.fromResources(resource.standardReportCardInputSubjectTypes),
      WebProgram.fromResources(resource.standardReportCardInputPrograms),
      WebEncounterType.fromResources(resource.standardReportCardInputEncounterTypes),
      resource.standardReportCardInputRecentDuration
    );
    webReportCard.colour = resource.color;
    if (!isNil(resource.standardReportCardType))
      webReportCard.standardReportCardType = WebStandardReportCardType.fromResource(resource.standardReportCardType);
    return webReportCard;
  }

  isNew() {
    return isNil(this.id);
  }

  validateCard(isStandardReportCard) {
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
    if (isStandardReportCard && this.isRecentType()) {
      const recentDurationValueAsNumber = toNumber(this.standardReportCardInputRecentDuration.value);
      if (
        !isInteger(recentDurationValueAsNumber) ||
        !(recentDurationValueAsNumber > 0) ||
        lowerCase(this.standardReportCardInputRecentDuration.value).indexOf("e") > -1
      ) {
        errors.push({
          key: "INVALID_DURATION",
          message: "Recent duration is mandatory and should be a positive number"
        });
      }
    }
    return errors;
  }

  static supportsFilter(card, filter) {
    const { PendingApproval, Approved, Rejected, CallTasks, OpenSubjectTasks, Comments, DueChecklist } = StandardReportCardType.types;
    const { Address } = CustomFilter.type;
    const dontSupportAllFilters = [PendingApproval, Approved, Rejected, CallTasks, OpenSubjectTasks, Comments, DueChecklist].includes(
      _.get(card, "standardReportCardType.type")
    );
    if (dontSupportAllFilters && ![Address].includes(filter.filterConfig.type)) {
      return false;
    }
    return true;
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
      iconFileS3Key: this.iconFileS3Key,
      standardReportCardInputSubjectTypes: this.standardReportCardInputSubjectTypes.map(x => x.uuid),
      standardReportCardInputPrograms: this.standardReportCardInputPrograms.map(x => x.uuid),
      standardReportCardInputEncounterTypes: this.standardReportCardInputEncounterTypes.map(x => x.uuid),
      standardReportCardInputRecentDuration: this.standardReportCardInputRecentDuration
    };
  }
}

export default WebReportCard;
