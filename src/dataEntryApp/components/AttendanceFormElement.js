import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { find, get, map, includes, sortBy } from "lodash";
import { useSelector } from "react-redux";
import api from "../api";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import FormHelperText from "@material-ui/core/FormHelperText";
import { mapGroupMembers } from "../../common/subjectModelMapper";
import { subjectService } from "../services/SubjectService";

const AttendanceFormElement = ({ formElement, update, validationResults, uuid, value = [] }) => {
  const subjectUUID = useSelector(state =>
    get(state, "dataEntry.subjectProfile.subjectProfile.uuid")
  );
  const [memberSubjects, setMemberSubjects] = useState([]);
  const { mandatory, name } = formElement;
  const { t } = useTranslation();
  const validationResult = find(validationResults, ({ formIdentifier }) => formIdentifier === uuid);
  const label = `${t(name)} ${mandatory ? "*" : ""}`;

  useEffect(() => {
    api.fetchGroupMembers(subjectUUID).then(groupSubjects => {
      const mappedGroupSubjects = mapGroupMembers(groupSubjects);
      const memberSubjects = map(mappedGroupSubjects, ({ memberSubject }) => memberSubject);
      subjectService.addSubjects(memberSubjects);
      setMemberSubjects(sortBy(memberSubjects, s => s.nameString));
    });
  }, []);

  const onsSwitchChange = event => {
    const uuid = event.target.name;
    update(uuid);
  };

  return (
    <FormControl component="fieldset" variant="standard">
      <FormLabel component="legend">{label}</FormLabel>
      <FormGroup>
        {map(memberSubjects, ({ uuid, nameString }) => {
          return (
            <FormControlLabel
              control={
                <Switch
                  color="primary"
                  checked={includes(value, uuid)}
                  onChange={onsSwitchChange}
                  name={uuid}
                />
              }
              label={nameString}
            />
          );
        })}
      </FormGroup>
      <FormHelperText>
        {validationResult && t(validationResult.messageKey, validationResult.extra)}
      </FormHelperText>
    </FormControl>
  );
};

export default AttendanceFormElement;
