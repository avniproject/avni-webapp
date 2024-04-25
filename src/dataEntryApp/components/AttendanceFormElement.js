import React, { useState, useEffect, Fragment } from "react";
import { useTranslation } from "react-i18next";
import { find, get, map, includes, sortBy, join } from "lodash";
import { Concept } from "openchs-models";
import { useSelector } from "react-redux";
import api from "../api";
import FormLabel from "@material-ui/core/FormLabel";
import FormGroup from "@material-ui/core/FormGroup";
import FormHelperText from "@material-ui/core/FormHelperText";
import { mapGroupMembers, mapIndividual } from "../../common/subjectModelMapper";
import { subjectService } from "../services/SubjectService";
import { Grid } from "@material-ui/core";
import Checkbox from "./Checkbox";
import makeStyles from "@material-ui/core/styles/makeStyles";

const useStyles = makeStyles(theme => ({
  evenBackground: {
    backgroundColor: "#ececec",
    paddingLeft: 10,
    paddingRight: 15
  },
  oddBackground: {
    backgroundColor: "#FFF",
    paddingLeft: 10,
    paddingRight: 15
  }
}));

const AttendanceFormElement = ({ formElement, update, validationResults, uuid, value = [], displayAllGroupMembers }) => {
  const classes = useStyles();
  const subjectUUID = useSelector(state => get(state, "dataEntry.subjectProfile.subjectProfile.uuid"));
  const [memberSubjects, setMemberSubjects] = useState([]);
  const { mandatory, name, answersToShow } = formElement;
  const { t } = useTranslation();
  const validationResult = find(
    validationResults,
    ({ formIdentifier, questionGroupIndex }) => formIdentifier === uuid && questionGroupIndex === formElement.questionGroupIndex
  );
  const label = `${t(name)} ${mandatory ? "*" : ""}`;

  useEffect(() => {
    if (displayAllGroupMembers) {
      api.fetchGroupMembers(subjectUUID).then(groupSubjects => {
        const subjectTypeUUID = formElement.concept.recordValueByKey(Concept.keys.subjectTypeUUID);
        const groupSubjectsMatchingRole = groupSubjects.filter(groupSubject => groupSubject.member.subjectType.uuid === subjectTypeUUID);
        const mappedGroupSubjects = mapGroupMembers(groupSubjectsMatchingRole);
        const memberSubjects = map(mappedGroupSubjects, ({ memberSubject }) => memberSubject);
        subjectService.addSubjects(memberSubjects);
        setMemberSubjects(sortBy(memberSubjects, s => s.nameString));
      });
    } else {
      //TODO: answersToShow not working right now. Rule gives error when executed.
      api.fetchSubjectForUUIDs(join(answersToShow, ",")).then(subjects => {
        const memberSubjects = map(subjects, mapIndividual);
        subjectService.addSubjects(memberSubjects);
        setMemberSubjects(sortBy(memberSubjects, s => s.nameString));
      });
    }
  }, []);

  const onsSwitchChange = event => {
    const uuid = event.target.value;
    update(uuid);
  };

  return (
    <Fragment>
      <FormLabel component="legend">{label}</FormLabel>
      <FormGroup>
        {map(memberSubjects, ({ uuid, nameString }, index) => {
          return (
            <Grid
              key={uuid}
              container
              sm={3}
              className={index % 2 === 0 ? classes.evenBackground : classes.oddBackground}
              alignItems="center"
              justifyContent="center"
            >
              <Grid item sm={11} justify={"center"}>
                <div>{nameString}</div>
              </Grid>
              <Grid item sm={1}>
                <Checkbox checked={includes(value, uuid)} onChange={onsSwitchChange} value={uuid} />
              </Grid>
            </Grid>
          );
        })}
      </FormGroup>
      <FormHelperText>{validationResult && t(validationResult.messageKey, validationResult.extra)}</FormHelperText>
    </Fragment>
  );
};

export default AttendanceFormElement;
