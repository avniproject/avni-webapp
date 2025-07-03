import React from "react";
import { styled } from '@mui/material/styles';
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

const StyledContainer = styled('div')(({ isGrid }) => ({
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
                            }) => {
  const type = formElement.getType();
  if (type === Concept.dataType.Id) {
    formElement.keyValues = [...formElement.keyValues, KeyValue.fromResource({ key: "editable", value: false })];
    formElement.mandatory = false;
  }

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
  };
  const Element = elements[type];
  return (
    <StyledContainer isGrid={isGrid}>
      {!ignoreLineBreak && <LineBreak num={feIndex === 0 ? 0 : 2} />}
      {/* This check can be removed later when DEA supports all the data types (Encounter and GroupAffiliation is not supported yet) */}
      {Element && <Element {...props} />}
    </StyledContainer>
  );
};