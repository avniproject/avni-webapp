import Grid from "@material-ui/core/Grid";
import AsyncSelect from "react-select/async";
import React from "react";
import { useTranslation } from "react-i18next";
import SubjectSearchService from "../services/SubjectSearchService";
import { subjectService } from "../services/SubjectService";
import { debounce, find, first, isEmpty, xor } from "lodash";
import { FormHelperText } from "@material-ui/core";
import { Individual } from "avni-models";
import { Concept } from "openchs-models";

const SubjectFormElement = props => {
  const { t } = useTranslation();
  const subjectTypeUuid = props.formElement.concept.recordValueByKey(Concept.keys.subjectTypeUUID);
  const isMultiSelect = props.formElement.type === "MultiSelect";
  const isMandatory = props.formElement.mandatory;
  const fieldLabel = props.formElement.name;
  const [selectedSubjects, setSelectedSubjects] = React.useState();

  const constructSubjectLabel = (subject, isSearchFlow = false) => {
    if (isSearchFlow) {
      return subject.fullName + " | " + subject.addressLevel;
    } else {
      return Individual.getFullName(subject) + " | " + subject.addressLevel;
    }
  };

  React.useEffect(() => {
    if (props.value === null) return;
    if (isMultiSelect) {
      setSelectedSubjects(
        props.value.map(uuid => {
          const subject = subjectService.findByUUID(uuid);
          return { label: constructSubjectLabel(subject), value: subject };
        })
      );
    } else {
      const subject = subjectService.findByUUID(props.value);
      setSelectedSubjects({ label: constructSubjectLabel(subject), value: subject });
    }
  }, []);

  const validationResult = find(
    props.validationResults,
    ({ formIdentifier, questionGroupIndex }) => formIdentifier === props.uuid && questionGroupIndex === props.formElement.questionGroupIndex
  );

  const onSelectedSubjectsChange = event => {
    const toggledSubject = isMultiSelect ? first(xor(event, selectedSubjects)) : event || selectedSubjects;
    if (!isEmpty(toggledSubject)) {
      //empty check required as backspace on empty control triggers an onChange
      const changedSubjectUuid = toggledSubject.value.uuid;
      props.update(changedSubjectUuid);
      subjectService.addSubject(toggledSubject.value);
      setSelectedSubjects(event);
    }
  };

  const loadSubjects = (inputValue, callback) => {
    SubjectSearchService.search({
      name: inputValue,
      subjectType: subjectTypeUuid
    })
      .then(searchResults =>
        searchResults.listOfRecords
          .filter(subject =>
            isMultiSelect && selectedSubjects
              ? selectedSubjects.map(selectedSubject => selectedSubject.value.uuid).indexOf(subject.uuid) === -1
              : true
          )
          .map(subject => ({
            label: constructSubjectLabel(subject, true),
            value: {
              id: subject.id,
              uuid: subject.uuid,
              firstName: subject.firstName,
              middleName: subject.middleName,
              lastName: subject.lastName,
              fullName: subject.fullName,
              profilePicture: subject.profilePicture,
              addressLevel: subject.addressLevel
            }
          }))
      )
      .then(callback);
  };

  const debouncedLoadSubjects = debounce(loadSubjects, 500);

  const placeholder = "Type to search...";
  const noResults = "No results";
  return (
    <>
      <div>
        {t(fieldLabel)}
        {isMandatory ? "*" : ""}
      </div>
      <Grid container spacing={2} style={{ width: "100%" }}>
        <Grid item xs={10}>
          <AsyncSelect
            cacheOptions
            loadOptions={debouncedLoadSubjects}
            name={fieldLabel}
            isMulti={isMultiSelect}
            isSearchable
            isClearable
            defaultInputValue={selectedSubjects}
            placeholder={t(placeholder)}
            value={selectedSubjects}
            defaultOptions={selectedSubjects}
            onChange={onSelectedSubjectsChange}
            noOptionsMessage={() => {
              return t(noResults);
            }}
          />
        </Grid>
      </Grid>
      <FormHelperText error={true}>{validationResult && t(validationResult.messageKey, validationResult.extra)}</FormHelperText>
    </>
  );
};

export default SubjectFormElement;
