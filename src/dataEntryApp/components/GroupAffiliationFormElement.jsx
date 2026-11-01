import { useEffect, useState } from "react";
import { FormHelperText, Grid } from "@mui/material";
import AsyncSelect from "react-select/async";
import Select from "react-select";
import { useTranslation } from "react-i18next";
import { debounce, filter, find, includes, isEmpty, isNil } from "lodash";
import SubjectSearchService from "../services/SubjectSearchService";
import { subjectService } from "../services/SubjectService";
import api from "../api";
import { groupSubjectTypeUUID } from "../services/GroupAffiliationService";

const groupName = (group) =>
  group.fullName ||
  [group.firstName, group.middleName, group.lastName]
    .filter((part) => !isEmpty(part))
    .join(" ") ||
  group.name ||
  group.uuid;

const toOption = (group) => ({ label: groupName(group), value: group.uuid });

// The phone offers the groups of the question's group subject type, narrowed by a rule's answers
// to show, and adds the subject in the role set on the question (GroupAffiliationFormElement).
export default function GroupAffiliationFormElement({
  formElement,
  value,
  update,
  validationResults,
  uuid,
}) {
  const { t } = useTranslation();
  const allowedGroupUUIDs = formElement.answersToShow;
  const hasAllowedList = !isEmpty(allowedGroupUUIDs);
  const [allowedOptions, setAllowedOptions] = useState([]);

  useEffect(() => {
    if (!hasAllowedList) return;
    api.fetchSubjectForUUIDs(allowedGroupUUIDs.join(",")).then((groups) => {
      (groups || []).forEach((group) => subjectService.addSubject(group));
      setAllowedOptions((groups || []).map(toOption));
    });
  }, [hasAllowedList, allowedGroupUUIDs]);

  const selectedGroup = isNil(value) ? null : subjectService.findByUUID(value);
  const selected = isNil(value)
    ? null
    : selectedGroup
      ? toOption(selectedGroup)
      : { label: value, value };

  const loadGroups = (inputValue, callback) => {
    SubjectSearchService.search({
      name: inputValue,
      subjectType: groupSubjectTypeUUID(formElement),
    })
      .then((searchResults) =>
        searchResults.listOfRecords.map((group) => {
          subjectService.addSubject(group);
          return toOption(group);
        }),
      )
      .then(callback);
  };
  const debouncedLoadGroups = debounce(loadGroups, 500);

  const validationResult = find(
    validationResults,
    ({ formIdentifier }) => formIdentifier === uuid,
  );
  const onChange = (option) => update(option ? option.value : null);
  const commonProps = {
    name: formElement.name,
    isClearable: true,
    isSearchable: true,
    placeholder: t("Type to search..."),
    value: selected,
    onChange,
    noOptionsMessage: () => t("No results"),
  };

  return (
    <>
      <div>
        {t(formElement.name)}
        {formElement.mandatory ? "*" : ""}
      </div>
      <Grid container spacing={2} style={{ width: "100%" }}>
        <Grid size={10}>
          {hasAllowedList ? (
            <Select
              {...commonProps}
              options={filter(allowedOptions, ({ value: groupUuid }) =>
                includes(allowedGroupUUIDs, groupUuid),
              )}
            />
          ) : (
            <AsyncSelect
              {...commonProps}
              loadOptions={debouncedLoadGroups}
              defaultOptions
              cacheOptions
            />
          )}
        </Grid>
      </Grid>
      <FormHelperText error={true}>
        {validationResult &&
          !validationResult.success &&
          t(validationResult.messageKey, validationResult.extra)}
      </FormHelperText>
    </>
  );
}
