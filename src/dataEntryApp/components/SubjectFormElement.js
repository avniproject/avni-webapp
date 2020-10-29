import Grid from "@material-ui/core/Grid";
import AsyncSelect from "react-select/async";
import React from "react";
import { useTranslation } from "react-i18next";
import SubjectSearchService from "../services/SubjectSearchService";
import { subjectService } from "../services/SubjectService";
import { xor, first, find, isEmpty } from "lodash";
import { FormHelperText } from "@material-ui/core";

const SubjectFormElement = props => {
  const { t } = useTranslation();
  const subjectTypeUuid = JSON.parse(
    props.formElement.concept.keyValues.find(keyValue => keyValue.key === "subjectTypeUUID").value
  );
  const isMultiSelect = props.formElement.type === "MultiSelect";
  const isMandatory = props.formElement.mandatory;
  const fieldLabel = props.formElement.name;
  const [selectedSubjects, setSelectedSubjects] = React.useState(isMultiSelect ? [] : "");

  const constructSubjectLabel = (subject, isSearchFlow = false) => {
    if (isSearchFlow) {
      return subject.fullName + " | " + subject.addressLevel.title;
    } else {
      return (
        subject.firstName +
        (isEmpty(subject.lastName) ? "" : " " + subject.lastName) +
        " | " +
        subject.addressLevel
      );
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
    validationResult => validationResult.formIdentifier === props.uuid
  );

  const onSelectedSubjectsChange = event => {
    const toggledSubject = isMultiSelect
      ? first(xor(event, selectedSubjects))
      : event || selectedSubjects;
    if (!isEmpty(toggledSubject)) {
      //handling required as backspace on empty control triggers an onChange
      const changedSubjectUuid = toggledSubject.value.uuid;
      props.update(changedSubjectUuid);
      subjectService.addSubject(toggledSubject.value);
      setSelectedSubjects(isEmpty(event) ? (isMultiSelect ? [] : "") : event);
    }
  };

  const loadSubjects = async inputValue => {
    const searchResults = await SubjectSearchService.search({
      name: inputValue,
      subjectTypeUUID: subjectTypeUuid
    });

    const filteredSubjects = isMultiSelect
      ? searchResults.content.filter(
          subject =>
            selectedSubjects
              .map(selectedSubject => selectedSubject.value.uuid)
              .indexOf(subject.uuid) === -1
        )
      : searchResults.content;

    return filteredSubjects.map(subject => ({
      label: constructSubjectLabel(subject, true),
      value: {
        id: subject.id,
        uuid: subject.uuid,
        firstName: subject.firstName,
        lastName: subject.lastName,
        fullName: subject.fullName,
        addressLevel: subject.addressLevel.title
      }
    }));
  };

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
            loadOptions={loadSubjects}
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
      <FormHelperText>
        {validationResult && t(validationResult.messageKey, validationResult.extra)}
      </FormHelperText>
    </>
  );
};

export default SubjectFormElement;
