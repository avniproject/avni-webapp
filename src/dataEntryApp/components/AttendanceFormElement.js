import React, { useState, useEffect, Fragment } from "react";
import { useTranslation } from "react-i18next";
import { find, get, map, includes, sortBy } from "lodash";
import { useSelector } from "react-redux";
import api from "../api";
import FormLabel from "@material-ui/core/FormLabel";
import FormGroup from "@material-ui/core/FormGroup";
import Switch from "@material-ui/core/Switch";
import FormHelperText from "@material-ui/core/FormHelperText";
import { mapGroupMembers } from "../../common/subjectModelMapper";
import { subjectService } from "../services/SubjectService";
import { Grid } from "@material-ui/core";

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
    <Fragment>
      <FormLabel component="legend">{label}</FormLabel>
      <FormGroup>
        {map(memberSubjects, ({ uuid, nameString }) => {
          return (
            <Grid key={uuid} container sm={4}>
              <Grid item sm={10}>
                <FormLabel>{nameString}</FormLabel>
              </Grid>
              <Grid item sm={2}>
                <Switch
                  color="primary"
                  checked={includes(value, uuid)}
                  onChange={onsSwitchChange}
                  name={uuid}
                />
              </Grid>
            </Grid>
          );
        })}
      </FormGroup>
      <FormHelperText>
        {validationResult && t(validationResult.messageKey, validationResult.extra)}
      </FormHelperText>
    </Fragment>
  );
};

export default AttendanceFormElement;
