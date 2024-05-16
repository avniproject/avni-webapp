import React, { Fragment } from "react";
import Breadcrumbs from "./Breadcrumbs";
import { Box, Button, Grid, Paper, Typography } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/core/styles";
import { withRouter } from "react-router-dom";
import { withParams } from "../../common/components/utils";
import { connect } from "react-redux";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import api from "../api/index";
import AsyncSelect from "react-select/async";
import SubjectSearchService from "../services/SubjectSearchService";
import FormLabel from "@material-ui/core/FormLabel";
import { debounce } from "lodash";

const useStyles = makeStyles(theme => ({
  root: {
    // padding: theme.spacing(3, 2),
    margin: theme.spacing(1, 3),
    flexGrow: 1,
    boxShadow: "0px 0px 3px 0px rgba(0,0,0,0.4), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 2px 1px -1px rgba(0,0,0,0.12)"
  },
  innerPaper: {
    padding: theme.spacing(2, 2),
    margin: theme.spacing(1, 1),
    height: 500
  },
  mainHeading: {
    fontSize: "20px",
    fontWeight: "500",
    marginLeft: 10,
    marginBottom: 10
  },
  cancelBtn: {
    color: "orange",
    width: 110,
    cursor: "pointer",
    height: 30,
    padding: "4px 25px",
    fontSize: 12,
    borderRadius: 50,
    borderColor: "orange"
  },
  addBtn: {
    color: "white",
    width: 110,
    cursor: "pointer",
    height: 30,
    padding: "4px 25px",
    fontSize: 12,
    borderRadius: 50,
    marginLeft: 20
  },
  bottomboxstyle: {
    backgroundColor: "#f8f4f4",
    height: 80,
    width: "100%",
    padding: 25
  }
}));
const renderMember = member => {
  return <Typography component={"div"}>{member.memberSubject.nameString}</Typography>;
};

const constructSubjectLabel = (subject, isSearchFlow = false) => {
  if (isSearchFlow) {
    return subject.fullName + " | " + subject.addressLevel;
  } else {
    return subject.nameString + " | " + subject.addressLevel;
  }
};

const GroupMembershipAddEdit = ({ match, groupSubject, memberGroupSubjects, groupRoles, ...props }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const memberGroupSubject =
    memberGroupSubjects && memberGroupSubjects.find(memberGroupSubject => memberGroupSubject.uuid === match.queryParams.uuid);
  const [memberSubject, setMemberSubject] = React.useState(
    memberGroupSubject && {
      label: constructSubjectLabel(memberGroupSubject.memberSubject),
      value: memberGroupSubject.memberSubject
    }
  );
  const groupRole = memberGroupSubject && memberGroupSubject.groupRole;
  const [selectedRole, setSelectedRole] = React.useState(groupRole ? groupRoles.find(role => role.uuid === groupRole.uuid) : null);
  // const isHousehold = groupSubject.isHousehold();
  const editFlow = match.queryParams.uuid != null && memberGroupSubject != null && groupRole != null;

  const returnToGroupSubjectProfile = () => {
    props.history.push(`/app/subject/subjectProfile?uuid=${groupSubject.uuid}`);
  };

  const searchSubjects = (subjectName, callback) => {
    SubjectSearchService.search({ name: subjectName, subjectTypeUUID: selectedRole.memberSubjectTypeUUID })
      .then(searchResults =>
        searchResults.listOfRecords
          .filter(subject =>
            memberGroupSubjects
              ? memberGroupSubjects.map(groupSubject => groupSubject.memberSubject.uuid).indexOf(subject.uuid) === -1
              : true
          )
          .map(subject => ({ label: constructSubjectLabel(subject, true), value: subject }))
      )
      .then(callback);
  };

  const debounceSearchSubjects = debounce(searchSubjects, 500);

  const renderSearch = () => {
    return (
      <AsyncSelect
        // cacheOptions          //disabled because subject types could be different depending on role
        loadOptions={debounceSearchSubjects}
        name={"Search by Name"}
        isMulti={false}
        isSearchable
        isClearable
        isDisabled={selectedRole === null}
        placeholder={selectedRole === null ? t("selectRoleToEnable") : t("typeNameToSearch")}
        value={memberSubject}
        onChange={subject => setMemberSubject(subject)}
        noOptionsMessage={() => {
          return t("zeroNumberOfResults");
        }}
      />
    );
  };

  const handleSave = () => {
    api
      .addEditGroupSubject({
        uuid: editFlow ? match.queryParams.uuid : null,
        groupSubjectUUID: groupSubject.uuid,
        memberSubjectUUID: memberSubject.value.uuid,
        groupRoleUUID: selectedRole.uuid
      })
      .then(() => returnToGroupSubjectProfile());
  };

  const onRoleChange = uuid => {
    const updatedRole = groupRoles.find(role => role.uuid === uuid);
    if (!editFlow && selectedRole && selectedRole.memberSubjectTypeUUID !== updatedRole.memberSubjectTypeUUID) {
      setMemberSubject(null);
    }
    setSelectedRole(updatedRole);
  };

  const hasSelectionChanged = () => {
    return memberSubject && (groupRole ? selectedRole && selectedRole.uuid !== groupRole.uuid : selectedRole && selectedRole.uuid !== null);
  };

  return (
    <Fragment>
      <Breadcrumbs path={match.path} />

      <Paper className={classes.root}>
        <div className={classes.innerPaper}>
          <Grid container>
            <Typography component={"span"} className={classes.mainHeading}>
              {editFlow ? t("editGroupMemberTitle") : t("addGroupMemberTitle")}
            </Typography>
          </Grid>
          <br />
          <Grid container>
            <Grid item xs={10}>
              <FormLabel component="legend">{t("role")}</FormLabel>
              <RadioGroup
                row
                aria-label="roles"
                name="roles"
                value={selectedRole ? selectedRole.uuid : ""}
                onChange={event => onRoleChange(event.target.value)}
              >
                {groupRoles.map((item, index) => (
                  <FormControlLabel
                    key={index}
                    value={item.uuid}
                    control={
                      <Radio
                        color="primary"
                        disabled={item.maximumNumberOfMembers <= memberGroupSubjects.filter(mgs => mgs.groupRole.uuid === item.uuid).length}
                      />
                    }
                    label={t(item.role)}
                  />
                ))}
              </RadioGroup>
            </Grid>
            <br />
            <Grid item xs={6}>
              <FormLabel component="legend">{t("member")}</FormLabel>
              {editFlow ? renderMember(memberGroupSubject) : renderSearch()}
            </Grid>
          </Grid>
        </div>
        <Box className={classes.bottomboxstyle} display="flex" flexDirection={"row"} flexWrap="wrap" justifyContent="flex-start">
          <Box>
            <Button variant="outlined" className={classes.cancelBtn} onClick={returnToGroupSubjectProfile}>
              CANCEL
            </Button>
            <Button variant="contained" className={classes.addBtn} color="primary" onClick={handleSave} disabled={!hasSelectionChanged()}>
              SAVE
            </Button>
          </Box>
        </Box>
      </Paper>
    </Fragment>
  );
};

const mapStateToProps = state => ({
  subjectTypes: state.dataEntry.metadata.operationalModules.subjectTypes,
  groupRoles: state.dataEntry.subjectProfile.subjectProfile.roles,
  groupSubject: state.dataEntry.subjectProfile.subjectProfile,
  memberGroupSubjects: state.dataEntry.subjectProfile.groupMembers
});

export default withRouter(withParams(connect(mapStateToProps)(GroupMembershipAddEdit)));
