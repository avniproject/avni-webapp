import { styled } from "@mui/material/styles";
import { Typography } from "@mui/material";
import { LineBreak } from "../../common/components/utils";
import TextFormElement from "./TextFormElement";
import NotesFormElement from "./NotesFormElement";
import SingleSelectFormElement from "./SingleSelectFormElement";
import MultiSelectFormElement from "./MultiSelectFormElement";
import NumericFormElement from "./NumericFormElement";
import { DateFormElement, DateTimeFormElement } from "./DateFormElement";
import TimeFormElement from "./TimeFormElement";
import DurationFormElement from "./DurationFormElement";
import { Concept, KeyValue } from "avni-models";
import MediaFormElement from "./MediaFormElement";
import PhoneNumberFormElement from "./PhoneNumberFormElement";
import LocationFormElement from "./LocationFormElement";
import LandingSubjectFormElement from "./LandingSubjectFormElement";
import QuestionGroupFormElement from "./QuestionGroupFormElement";
import { RepeatableQuestionGroupElement } from "./RepeatableQuestionGroupElement";
import { getAllowedSyncValuesForConcept } from "../services/UserSyncSettingsUtil";

const StyledContainer = styled("div")(({ isGrid }) => ({
  ...(isGrid && {
    borderWidth: "2px",
    borderStyle: "inset",
    padding: "5px",
  }),
}));

const div = () => <div />;

const elements = {
  Date: DateFormElement,
  DateTime: DateTimeFormElement,
  Time: TimeFormElement,
  Duration: DurationFormElement,
  SingleSelect: SingleSelectFormElement,
  MultiSelect: MultiSelectFormElement,
  Numeric: NumericFormElement,
  Boolean: div,
  Text: TextFormElement,
  Notes: NotesFormElement,
  NA: div,
  Image: MediaFormElement,
  Video: MediaFormElement,
  Audio: MediaFormElement,
  File: MediaFormElement,
  Id: TextFormElement,
  PhoneNumber: PhoneNumberFormElement,
  Subject: LandingSubjectFormElement,
  Location: LocationFormElement,
  QuestionGroup: QuestionGroupFormElement,
  RepeatableQuestionGroup: RepeatableQuestionGroupElement,
};

export const FormElement = ({
  children: formElement,
  value,
  update,
  obsHolder,
  validationResults,
  uuid,
  feIndex,
  filteredFormElements,
  ignoreLineBreak,
  isGrid,
  updateObs,
  addNewQuestionGroup,
  removeQuestionGroup,
  subjectType,
  subjectTypeSyncSettings,
}) => {
  const type = formElement.getType();
  if (type === Concept.dataType.Id) {
    formElement.keyValues = [
      ...formElement.keyValues,
      KeyValue.fromResource({ key: "editable", value: false }),
    ];
    formElement.mandatory = false;
  }

  const allowedValues = getAllowedSyncValuesForConcept(
    subjectType,
    subjectTypeSyncSettings,
    formElement.concept,
  );

  const props = {
    formElement,
    value,
    update,
    obsHolder,
    validationResults,
    uuid,
    filteredFormElements,
    isGrid,
    updateObs,
    addNewQuestionGroup,
    removeQuestionGroup,
    allowedValues,
  };
  const Element = elements[type];
  // A type this app cannot draw used to vanish without trace, and when it was mandatory the page
  // could never be completed and nothing said why (#1801, #1528, #1508). Say so instead.
  const unsupportedNotice = !Element && (
    <Typography
      data-testid="unsupported-form-element"
      variant="body2"
      color={formElement.mandatory ? "error" : "textSecondary"}
    >
      {`${formElement.name || formElement.concept?.name}: the question type "${type}" is not supported in the Data Entry App yet. Fill it in on the mobile app.`}
      {formElement.mandatory &&
        " This question is mandatory, so this page cannot be completed here."}
    </Typography>
  );
  return (
    <StyledContainer isGrid={isGrid}>
      {!ignoreLineBreak && <LineBreak num={feIndex === 0 ? 0 : 2} />}
      {Element ? <Element {...props} /> : unsupportedNotice}
    </StyledContainer>
  );
};
