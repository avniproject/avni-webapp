export const sampleFormElementRule = entityName => {
  return `//SAMPLE RULE EXAMPLE
'use strict';
({params, imports}) => {
  const ${entityName} = params.entity;
  const formElement = params.formElement;
  const statusBuilder = new imports.rulesConfig.FormElementStatusBuilder({${entityName}, formElement});
  //read the value of form element using ${entityName}.getObservationValue(CONCEPT_NAME);
  const formElementValue1 = "1";
  const formElementValue2 = "1";
  //form element will be shown only when below condition is true
  const showCondition = formElementValue1 === formElementValue2;
  statusBuilder.show().whenItem(showCondition).is.truthy;
  //for form element validation error
  statusBuilder.validationError("Values are not equal").whenItem(showCondition).is.falsy;
  return statusBuilder.build();
};`;
};

export const sampleFormElementGroupRule = () => {
  return `//SAMPLE RULE EXAMPLE
'use strict';
({params, imports}) => {
    const formElementGroup = params.formElementGroup;
    return formElementGroup.formElements.map(({uuid}) => {
        return new imports.rulesConfig.FormElementStatus(uuid, true, null);
    });
};`;
};

export const sampleEnrolmentSummaryRule = () => {
  return `//SAMPLE RULE EXAMPLE
'use strict';
({params, imports}) =>  {
    const summaries = [];
    const programEnrolment = params.programEnrolment;
    //value can be fetched from entire enrolment using programEnrolment.findObservationInEntireEnrolment(CONCEPT_NAME);
    const someValue = "valueFromEnrolment";
    //condition to check when to add it to summary
    if (!someValue) {
    //make sure that concept with proper data type exists in the system exists 
      summaries.push({name: CONCEPT_NAME, value: someValue});
    }
    return summaries;
};`;
};

export const sampleEnrolmentEligibilityCheckRule = () => {
  return `//SAMPLE RULE EXAMPLE
'use strict';
({params, imports}) => {
  const individual = params.entity;
  //sample condition individual.isFemale() && individual.getAgeInYears() > 5;
  return true;
};`;
};

export const sampleEncounterEligibilityCheckRule = () => {
  return `//SAMPLE RULE EXAMPLE
'use strict';
({params, imports}) => {
  const individual = params.entity;
  return true;
};`;
};

const decisionType = entityName => {
  switch (entityName) {
    case "individual":
      return "registrationDecisions";
    case "programEnrolment":
      return "enrolmentDecisions";
    case "programEncounter":
    case "encounter":
      return "encounterDecisions";
  }
};
export const sampleDecisionRule = entityName => {
  return `//SAMPLE RULE EXAMPLE
  "use strict";
({params, imports}) => {
    const ${entityName} = params.entity;
    const decisions = params.decisions;
    //create complicationBuilder using ${entityName} and then push to ${decisionType(
    entityName
  )} array.
    return decisions;
};`;
};

export const sampleVisitScheduleRule = entityName => {
  return `//SAMPLE RULE EXAMPLE
"use strict";
({ params, imports }) => {
  const ${entityName} = params.entity;
  const scheduleBuilder = new imports.rulesConfig.VisitScheduleBuilder({
    ${entityName}
  });
  //add new visit schedule object to scheduleBuilder
  return scheduleBuilder.getAll();
};`;
};

export const sampleValidationRule = entityName => {
  return `//SAMPLE RULE EXAMPLE
'use strict';
({params, imports}) => {
  const ${entityName} = params.entity;
  const validationResults = [];
  //use imports.common.createValidationError('sample error') to create validation error and push it to validationResults
  return validationResults;
};`;
};

export const sampleChecklistRule = () => {
  return `//SAMPLE RULE EXAMPLE
'use strict';
({params, imports}) => {
  const programEnrolment = params.entity;
  const checklistDetails = params.checklistDetails;
  return [];
};`;
};

export const sampleWorkListUpdationRule = () => {
  return `//SAMPLE RULE EXAMPLE
  ({params, imports}) => {
    const workLists = params.workLists;
    const context = params.context;
    const WorkItem = imports.models.WorkItem;

    const main = () => {
        // const currentWorkItem = workLists.getCurrentWorkItem();
        // if (currentWorkItem.type === WorkItem.type.PROGRAM_ENROLMENT) {
        //     Push some item to the current worklist
        // }
        // if (currentWorkItem.type === WorkItem.type.PROGRAM_ENCOUNTER) {
        //     Remove some items from the current worklist
        // }
        return workLists;
    };

    return main();

};`;
};
