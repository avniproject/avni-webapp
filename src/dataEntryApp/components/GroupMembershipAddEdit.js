import { useState } from "react";
import { styled } from "@mui/material/styles";
import Breadcrumbs from "./Breadcrumbs";
import { Box, Button, Grid, Paper, Typography, RadioGroup, FormControlLabel, Radio, FormLabel } from "@mui/material";
import { useTranslation } from "react-i18next";
import { withRouter } from "react-router-dom";
import { withParams } from "../../common/components/utils";
import { connect } from "react-redux";
import api from "../api/index";
import AsyncSelect from "react-select/async";
import SubjectSearchService from "../services/SubjectSearchService";
import { debounce } from "lodash";

const StyledPaper = styled(Paper)(({ theme }) => ({
  margin: theme.spacing(1, 3),
  flexGrow: 1,
  boxShadow: "0px 0px 3px 0px rgba(0,0,0,0.4), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 2px 1px -1px rgba(0,0,0,0.12)"
}));

const StyledInnerContainer = styled("div")(({ theme }) => ({
  padding: theme.spacing(2),
  margin: theme.spacing(1),
  height: 500
}));

const StyledMainHeading = styled(Typography)(({ theme }) => ({
  fontSize: 20,
  fontWeight: 500,
  marginLeft: theme.spacing(1.25), // 10px
  marginBottom: theme.spacing(1.25)
}));

const StyledButtonContainer = styled(Box)(({ theme }) => ({
  backgroundColor: "#f8f4f4",
  height: 80,
  width: "100%",
  padding: theme.spacing(3.125), // 25px
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "flex-start"
}));

const StyledGridContainer = styled(Grid)(({ theme }) => ({
  marginTop: theme.spacing(2) // Replace <br />
}));

const renderMember = member => <Typography component="div">{member.memberSubject.nameString}</Typography>;

const constructSubjectLabel = (subject, isSearchFlow = false) => {
  if (isSearchFlow) {
    return `${subject.fullName} | ${subject.addressLevel}`;
  }
  return `${subject.nameString} | ${subject.addressLevel}`;
};

const GroupMembershipAddEdit = ({ match, groupSubject, memberGroupSubjects, groupRoles, ...props }) => {
  const { t } = useTranslation();

  const memberGroupSubject = memberGroupSubjects && memberGroupSubjects.find(mgs => mgs.uuid === match.queryParams.uuid);
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

  const renderSearch = () => (
    <AsyncSelect
      loadOptions={debounceSearchSubjects}
      name="Search by Name"
      isMulti={false}
      isSearchable
      isClearable
      isDisabled={selectedRole === null}
      placeholder={selectedRole === null ? t("selectRoleToEnable") : t("typeNameToSearch")}
      value={memberSubject}
      onChange={subject => setMemberSubject(subject)}
      noOptionsMessage={() => t("zeroNumberOfResults")}
    />
  );

  const handleSave = () => {
    api
      .addEditGroupSubject({
        uuid: editFlow ? match.queryParams.uuid : null,
        groupSubjectUUID: groupSubject.uuid,
        memberSubjectUUID: memberSubject.value.uuid,
        groupRoleUUID: selectedRole.uuid
      })
      .then(returnToGroupSubjectProfile);
  };

  const onRoleChange = uuid => {
    const updatedRole = groupRoles.find(role => role.uuid === uuid);
    if (!editFlow && selectedRole && selectedRole.memberSubjectTypeUUID !== updatedRole.memberSubjectTypeUUID) {
      setMemberSubject(null);
    }
    setSelectedRole(updatedRole);
  };

  const hasSelectionChanged = () =>
    memberSubject && (groupRole ? selectedRole && selectedRole.uuid !== groupRole.uuid : selectedRole && selectedRole.uuid !== null);

  return (
    <>
      <Breadcrumbs path={match.path} />
      <StyledPaper>
        <StyledInnerContainer>
          <Grid container>
            <StyledMainHeading component="span">{editFlow ? t("editGroupMemberTitle") : t("addGroupMemberTitle")}</StyledMainHeading>
          </Grid>
          <StyledGridContainer container>
            <Grid size={10}>
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
            <StyledGridContainer size={6}>
              <FormLabel component="legend">{t("member")}</FormLabel>
              {editFlow ? renderMember(memberGroupSubject) : renderSearch()}
            </StyledGridContainer>
          </StyledGridContainer>
        </StyledInnerContainer>
        <StyledButtonContainer>
          <Box sx={{ display: "flex", gap: 2.5 }}>
            <Button
              variant="outlined"
              sx={{
                color: "orange",
                width: 110,
                height: 30,
                fontSize: 12,
                borderColor: "orange",
                borderRadius: 50,
                padding: "4px 25px"
              }}
              onClick={returnToGroupSubjectProfile}
            >
              {t("cancel")}
            </Button>
            <Button
              variant="contained"
              sx={{
                color: "white",
                width: 110,
                height: 30,
                fontSize: 12,
                borderRadius: 50,
                padding: "4px 25px",
                backgroundColor: "orange",
                "&:hover": { backgroundColor: "darkorange" }
              }}
              onClick={handleSave}
              disabled={!hasSelectionChanged()}
            >
              {t("save")}
            </Button>
          </Box>
        </StyledButtonContainer>
      </StyledPaper>
    </>
  );
};

const mapStateToProps = state => ({
  subjectTypes: state.dataEntry.metadata.operationalModules.subjectTypes,
  groupRoles: state.dataEntry.subjectProfile.subjectProfile.roles,
  groupSubject: state.dataEntry.subjectProfile.subjectProfile,
  memberGroupSubjects: state.dataEntry.subjectProfile.groupMembers
});

export default withRouter(withParams(connect(mapStateToProps)(GroupMembershipAddEdit)));
