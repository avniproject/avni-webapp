import { CustomFilter, ReportCard, StandardReportCardType } from "openchs-models";
import _, { isEmpty, isInteger, isNil, lowerCase, toNumber } from "lodash";
import WebStandardReportCardType from "./WebStandardReportCardType";
import WebSubjectType from "./WebSubjectType";
import WebProgram from "./WebProgram";
import WebEncounterType from "./WebEncounterType";

function populateRecordCardFields(
  reportCard,
  iconFileS3Key,
  name,
  description,
  query,
  nested,
  id,
  count,
  standardReportCardInputSubjectTypes,
  standardReportCardInputPrograms,
  standardReportCardInputEncounterTypes,
  standardReportCardInputRecentDuration,
) {
  reportCard.id = id;
  reportCard.iconFileS3Key = iconFileS3Key;
  reportCard.name = name;
  reportCard.description = description;
  reportCard.query = query;
  reportCard.nested = nested;
  reportCard.count = count;
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

  static getStandardReportCardTypeName(card) {
    return card.standardReportCardType ? card.standardReportCardType.name : "";
  }

  set standardReportCardType(x) {
    this.that.standardReportCardType = this.fromObject(x);
  }

  static createNewReportCard() {
    const webReportCard = new WebReportCard();
    populateRecordCardFields(webReportCard, "", "", "", [], false, null, WebReportCard.MinimumNumberOfNestedCards, [], [], [], {
      value: "1",
      unit: "days",
    });
    webReportCard.colour = "#ffffff";
    webReportCard.action = null;
    webReportCard.actionDetailSubjectTypeUUID = null;
    webReportCard.actionDetailProgramUUID = null;
    webReportCard.actionDetailEncounterTypeUUID = null;
    webReportCard.actionDetailVisitType = null;
    webReportCard.customCardConfig = null;
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
      other.count,
      [...other.standardReportCardInputSubjectTypes],
      [...other.standardReportCardInputPrograms],
      [...other.standardReportCardInputEncounterTypes],
      other.standardReportCardInputRecentDuration,
    );
    webReportCard.standardReportCardType = other.standardReportCardType;
    webReportCard.colour = other.colour;
    webReportCard.action = other.action;
    webReportCard.actionDetailSubjectTypeUUID = other.actionDetailSubjectTypeUUID;
    webReportCard.actionDetailProgramUUID = other.actionDetailProgramUUID;
    webReportCard.actionDetailEncounterTypeUUID = other.actionDetailEncounterTypeUUID;
    webReportCard.actionDetailVisitType = other.actionDetailVisitType;
    webReportCard.customCardConfig = other.customCardConfig;
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
      resource.standardReportCardInputRecentDuration,
    );
    webReportCard.colour = resource.color;
    if (!isNil(resource.standardReportCardType))
      webReportCard.standardReportCardType = WebStandardReportCardType.fromResource(resource.standardReportCardType);
    webReportCard.action = resource.action || null;
    webReportCard.actionDetailSubjectTypeUUID = resource.actionDetailSubjectTypeUUID || null;
    webReportCard.actionDetailProgramUUID = resource.actionDetailProgramUUID || null;
    webReportCard.actionDetailEncounterTypeUUID = resource.actionDetailEncounterTypeUUID || null;
    webReportCard.actionDetailVisitType = resource.actionDetailVisitType || null;
    webReportCard.customCardConfig = resource.customCardConfigUUID
      ? { uuid: resource.customCardConfigUUID, name: resource.customCardConfigName }
      : null;
    return webReportCard;
  }

  isNew() {
    return isNil(this.id);
  }

  validateCard(cardType) {
    const isStandardReportCard = cardType === ReportCard.cardTypes.standard;
    const isNestedCard = cardType === ReportCard.cardTypes.nested;
    const isCustomDataCard = cardType === ReportCard.cardTypes.customData;
    const isFullyCustomCard = cardType === ReportCard.cardTypes.fullyCustom;
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
    if ((isCustomDataCard || isNestedCard) && isEmpty(this.query)) {
      errors.push({ key: "EMPTY_QUERY", message: "Query cannot be empty" });
    }
    if (isFullyCustomCard && isNil(this.customCardConfig)) {
      errors.push({ key: "MISSING_CUSTOM_CARD_CONFIG", message: "Custom card config selection is required" });
    }
    if (isNestedCard && (this.count < WebReportCard.MinimumNumberOfNestedCards || this.count > WebReportCard.MaximumNumberOfNestedCards)) {
      errors.push({
        key: "INVALID_NESTED_CARD_COUNT",
        message: "Nested Card count cannot be less than 1 or greater than 9",
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
          message: "Recent duration is mandatory and should be a positive number",
        });
      }
    }
    if (this.action === ReportCard.actionTypes.DoVisit) {
      if (isNil(this.actionDetailEncounterTypeUUID)) {
        errors.push({ key: "MISSING_ENCOUNTER_TYPE", message: "Encounter type is required for Do visit action" });
      }
      if (isNil(this.actionDetailVisitType)) {
        errors.push({ key: "MISSING_VISIT_TYPE", message: "Visit type is required for Do visit action" });
      }
    }
    return errors;
  }

  static supportsFilter(card, filter) {
    const { PendingApproval, Approved, Rejected, CallTasks, OpenSubjectTasks, Comments, DueChecklist } = StandardReportCardType.types;
    const { Address } = CustomFilter.type;
    const dontSupportAllFilters = [PendingApproval, Approved, Rejected, CallTasks, OpenSubjectTasks, Comments, DueChecklist].includes(
      _.get(card, "standardReportCardType.type"),
    );
    if (dontSupportAllFilters && ![Address].includes(filter.filterConfig.type)) {
      return false;
    }
    return true;
  }

  static getShortDisplayName(reportCard) {
    return reportCard.standardReportCardType
      ? `${reportCard.name} (StandardType: ${reportCard.standardReportCardType.name})`
      : reportCard.name;
  }

  toResource() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      color: this.colour,
      query: this.query,
      nested: this.nested,
      count: this.count,
      standardReportCardTypeId: this.standardReportCardType && this.standardReportCardType.id,
      iconFileS3Key: this.iconFileS3Key,
      standardReportCardInputSubjectTypes: this.standardReportCardInputSubjectTypes.map((x) => x.uuid),
      standardReportCardInputPrograms: this.standardReportCardInputPrograms.map((x) => x.uuid),
      standardReportCardInputEncounterTypes: this.standardReportCardInputEncounterTypes.map((x) => x.uuid),
      standardReportCardInputRecentDuration: this.standardReportCardInputRecentDuration,
      action: this.action,
      actionDetailSubjectTypeUUID: this.actionDetailSubjectTypeUUID,
      actionDetailProgramUUID: this.actionDetailProgramUUID,
      actionDetailEncounterTypeUUID: this.actionDetailEncounterTypeUUID,
      actionDetailVisitType: this.actionDetailVisitType,
      customCardConfigUUID: this.customCardConfig ? this.customCardConfig.uuid : null,
    };
  }
}

export default WebReportCard;
