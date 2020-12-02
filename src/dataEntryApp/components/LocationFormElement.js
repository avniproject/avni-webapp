/* eslint-disable */ //TODO remove when this form element type is supported
import React from "react";
import { useTranslation } from "react-i18next";
import LocationSelect from "./LocationSelect";
import RadioButtonsGroup from "./RadioButtonsGroup";

const LocationFormElement = props => {
  const { t } = useTranslation();
  const lowestAddressLevelTypeUUIDs = JSON.parse(
    props.formElement.concept.keyValues.find(
      keyValue => keyValue.key === "lowestAddressLevelTypeUUIDs"
    ).value
  );
  // const lowestAddressLevelTypeId
  const isMandatory = props.formElement.mandatory;
  const fieldLabel = props.formElement.name;
  const isSingleLowestLocation = lowestAddressLevelTypeUUIDs.length === 1;
  return (
    <>
      {/*isSingleLowestLocation ? (<div>name of single location</div>): (*/}
      {/*<RadioButtonsGroup*/}
      {/*  label={t(fieldLabel) + isMandatory ? "*" : ""}*/}
      {/*  items={addressLevelTypesToRender.map(a => ({id: a.id, name: a.name}))}*/}
      {/*  value={props.selectedAddressLevelType.id}*/}
      {/*  onChange={item => props.selectAddressLevelType(item)}*/}
      {/*/>*/}){/*<LocationSelect*/}
      {/*  selectedLocation={}*/}
      {/*  subjectProps={}*/}
      {/*  onSelect={}*/}
      {/*  placeholder={}*/}
      {/*  typeId={}*/}
      {/*/>*/}
    </>
  );
};

export default LocationFormElement;
