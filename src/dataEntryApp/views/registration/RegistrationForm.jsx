import { useSelector, useDispatch } from "react-redux";
import {
  onNext,
  onPrevious,
  saveSubject,
  selectRegistrationState,
  setValidationResults,
  updateObs,
  addNewQuestionGroup,
  removeQuestionGroup
} from "dataEntryApp/reducers/registrationReducer";
import { ObservationsHolder } from "openchs-models";
import FormWizard from "dataEntryApp/views/registration/FormWizard";

const RegistrationForm = ({ children }) => {
  const dispatch = useDispatch();
  const registrationState = useSelector(selectRegistrationState);

  return (
    <div>
      {children}
      <FormWizard
        form={registrationState.registrationForm}
        obsHolder={
          new ObservationsHolder(registrationState.subject.observations)
        }
        observations={registrationState.subject.observations}
        saved={registrationState.saved}
        subject={registrationState.subject}
        onSaveGoto={`/app/subject?uuid=${registrationState.subject.uuid}`}
        validationResults={registrationState.validationResults}
        registrationFlow={true}
        filteredFormElements={registrationState.filteredFormElements}
        entity={registrationState.subject}
        formElementGroup={registrationState.formElementGroup}
        onSummaryPage={registrationState.onSummaryPage}
        wizard={registrationState.wizard}
        saveErrorMessageKey={registrationState.saveErrorMessageKey}
        updateObs={(formElement, value, childFormElement, questionGroupIndex) =>
          dispatch(
            updateObs(formElement, value, childFormElement, questionGroupIndex)
          )
        }
        addNewQuestionGroup={formElement =>
          dispatch(addNewQuestionGroup(formElement))
        }
        removeQuestionGroup={(formElement, questionGroupIndex) =>
          dispatch(removeQuestionGroup(formElement, questionGroupIndex))
        }
        onSave={() => dispatch(saveSubject())}
        setValidationResults={validationResults =>
          dispatch(setValidationResults(validationResults))
        }
        onNext={() => dispatch(onNext())}
        onPrevious={() => dispatch(onPrevious())}
      />
    </div>
  );
};

export default RegistrationForm;
