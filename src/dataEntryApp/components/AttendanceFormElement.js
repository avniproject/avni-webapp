import React, { useState, useEffect, Fragment, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { find, get, map, includes, sortBy, join, size } from "lodash";
import { Concept } from "openchs-models";
import { useSelector } from "react-redux";
import api from "../api";
import { makeStyles } from "@mui/styles";
import { FormLabel, FormGroup, FormHelperText, Grid, Link } from "@mui/material";
import { mapGroupMembers, mapIndividual } from "../../common/subjectModelMapper";
import { subjectService } from "../services/SubjectService";
import Checkbox from "./Checkbox";

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
  const [isSelectAll, setSelectAll] = useState(false);
  const { t } = useTranslation();
  const validationResult = find(
    validationResults,
    ({ formIdentifier, questionGroupIndex }) => formIdentifier === uuid && questionGroupIndex === formElement.questionGroupIndex
  );
  const label = `${t(name)} ${mandatory ? "*" : ""}`;
  const memberUUIDs = useMemo(() => memberSubjects.map(({ uuid }) => uuid), [memberSubjects]);
  const selectLabel = isSelectAll ? t("unselectAllLabel") : t("selectAllLabel");

  useEffect(() => {
    const fetchMembers = async () => {
      let fetchedSubjects = [];
      if (displayAllGroupMembers) {
        const subjectTypeUUID = formElement.concept.recordValueByKey(Concept.keys.subjectTypeUUID);
        const groupSubjects = await api.fetchGroupMembers(subjectUUID);
        const groupSubjectsMatchingRole = groupSubjects.filter(groupSubject => groupSubject.member.subjectType.uuid === subjectTypeUUID);
        const mappedGroupSubjects = mapGroupMembers(groupSubjectsMatchingRole);
        fetchedSubjects = map(mappedGroupSubjects, ({ memberSubject }) => memberSubject);
      } else {
        const subjects = await api.fetchSubjectForUUIDs(join(answersToShow, ","));
        fetchedSubjects = map(subjects, mapIndividual);
      }
      subjectService.addSubjects(fetchedSubjects);
      return fetchedSubjects;
    };

    fetchMembers().then(fetchedSubjects => {
      const validSubjects = fetchedSubjects.filter(s => s && s.nameString);
      setMemberSubjects(sortBy(validSubjects, s => s.nameString));
    });
  }, [displayAllGroupMembers, subjectUUID, formElement]);

  useEffect(() => {
    setSelectAll(size(memberUUIDs) === size(value));
  }, [memberUUIDs, value]);

  const onsSwitchChange = useCallback(
    event => {
      const uuid = event.target.value;
      update(uuid);
    },
    [update]
  );

  const toggleSelectAll = useCallback(() => {
    setSelectAll(prev => {
      const newSelectAll = !prev;
      memberUUIDs.forEach(memberUUID => {
        if ((newSelectAll && !includes(value, memberUUID)) || (!newSelectAll && includes(value, memberUUID))) {
          update(memberUUID);
        }
      });
      return newSelectAll;
    });
  }, [memberUUIDs, value, update]);

  return (
    <Fragment>
      <Grid container direction="column" xs={4} spacing={0.5} style={{ height: "100%" }}>
        <Grid item>
          <FormLabel component="legend">{label}</FormLabel>
        </Grid>
        <Grid item />
        {memberSubjects.length > 0 && (
          <Grid
            item
            container
            sx={{
              justifyContent: "flex-end"
            }}
          >
            <Link
              underline="hover"
              href="#"
              onClick={e => {
                e.preventDefault();
                toggleSelectAll();
              }}
            >
              {selectLabel}
            </Link>
          </Grid>
        )}
      </Grid>
      <FormGroup>
        {memberSubjects.length > 0
          ? map(memberSubjects, ({ uuid, nameString }, index) => {
              return (
                <Grid
                  key={uuid}
                  container
                  xs={4}
                  className={index % 2 === 0 ? classes.evenBackground : classes.oddBackground}
                  sx={{
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <Grid item xs={11}>
                    <div>{nameString}</div>
                  </Grid>
                  <Grid item xs={1}>
                    <Checkbox checked={includes(value, uuid)} onChange={onsSwitchChange} value={uuid} />
                  </Grid>
                </Grid>
              );
            })
          : null}
      </FormGroup>
      <FormHelperText>{validationResult && t(validationResult.messageKey, validationResult.extra)}</FormHelperText>
    </Fragment>
  );
};
export default AttendanceFormElement;
