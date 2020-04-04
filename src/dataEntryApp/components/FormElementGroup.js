import _, { invoke, get } from "lodash";
import React from "react";
import { LineBreak } from "../../common/components/utils";
import { FormElement } from "./FormElement";
import ValidationResult from "./validationResult";
import { Concept, Filter } from "avni-models";

export const FormElementGroup = ({ children: feg, obs, updateObs }) => {
  // const isMultiSelect = type => {
  //   return type === Filter.types.MultiSelect;
  // };

  // const validate = (value, uuid, concept, mandatory, validFormat, type) => {
  //   console.log("Inside Validate..Form Element");
  //   console.log(value);
  //   console.log("uuid " + uuid);
  //   console.log(concept);
  //   console.log(mandatory);
  //   console.log(validFormat);
  //   const failure = new ValidationResult(false, uuid);
  //   if (mandatory && _.isEmpty(_.toString(value))) {
  //     failure.messageKey = "emptyValidationMessage";
  //   } else if (concept.datatype === Concept.dataType.Numeric && isNaN(value)) {
  //     failure.messageKey = "numericValueValidation";
  //   } else if (concept.isBelowLowAbsolute(value)) {
  //     failure.messageKey = "numberBelowLowAbsolute";
  //     failure.extra = { limit: this.concept.lowAbsolute };
  //   } else if (concept.isAboveHiAbsolute(value)) {
  //     failure.messageKey = "numberAboveHiAbsolute";
  //     failure.extra = { limit: this.concept.hiAbsolute };
  //   } else if (
  //     !_.isEmpty(validFormat) &&
  //     !_.isEmpty(_.toString(value)) &&
  //     !validFormat.valid(value)
  //   ) {
  //     failure.messageKey = validFormat.descriptionKey;
  //   } else if (isMultiSelect(type) && !_.isEmpty(value)) {
  //     return _validateMultiSelect(value);
  //   }
  //   // else if (concept.datatype === Concept.dataType.DateTime
  //   //     && General.hoursAndMinutesOfDateAreZero(value)) {
  //   //   failure.messageKey = "timeValueValidation";
  //   // }
  //   else {
  //     return new ValidationResult(true, uuid, null);
  //   }
  //   return failure;
  // };

  return (
    <div>
      <LineBreak num={1} />
      {feg.getFormElements().map(fe => (
        <FormElement
          key={fe.uuid}
          concept={fe.concept}
          obsHolder={obs}
          value={get(obs.findObservation(fe.concept), "valueJSON.answer")}
          update={value => {
            updateObs(fe, value);
            //FormElement.validate(value);
            //validate(value, fe.uuid, fe.concept, fe.mandatory, fe.validFormat, fe.type);
          }}
        >
          {fe}
        </FormElement>
      ))}
      <LineBreak num={1} />
    </div>
  );
};
