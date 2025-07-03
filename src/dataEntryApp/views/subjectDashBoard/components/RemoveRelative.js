import React from "react";
import { styled } from '@mui/material/styles';
import { Grid, DialogContent, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { connect } from "react-redux";
import { first, noop } from "lodash";
import { useHistory, withRouter } from "react-router-dom";
import Modal from "./CommonModal";
import { removeRelationShip, saveRelationShip } from "../../../reducers/relationshipReducer";
import { getSubjectProfile } from "../../../reducers/subjectDashboardReducer";

const StyledDialogContent = styled(DialogContent)({
  width: 600,
  height: "auto",
});

const StyledGrid = styled(Grid)({
  justifyContent: "flex-end",
  alignItems: "flex-start",
});

const removeButtonStyle = {
  height: "28px",
  zIndex: 1,
  marginTop: "1px",
  boxShadow: "none",
  color: "#0e6eff",
  backgroundColor: "#fff",
  "&:hover": {
    color: "#0e6eff",
    backgroundColor: "#fff",
  },
};

const applyButtonStyle = {
  float: "left",
  backgroundColor: "#f27510",
  height: "30px",
  boxShadow: "none",
  "&:hover": {
    backgroundColor: "#f27510",
  },
};

const cancelButtonStyle = {
  float: "left",
  backgroundColor: "#F8F9F9",
  color: "#fc9153",
  border: "1px solid #fc9153",
  height: "30px",
  boxShadow: "none",
  "&:hover": {
    backgroundColor: "#F8F9F9",
  },
};

const RemoveRelative = props => {
  const { t } = useTranslation();
  const history = useHistory();

  const close = () => {};

  const removeClick = () => {
    const RelationData = {
      individualAUUID: props.relationAuuid,
      individualBUUID: props.relationBuuid,
      relationshipTypeUUID: props.relationBTypeuuid,
      uuid: props.relationuuid,
      voided: true,
    };
    props.saveRelationShip(RelationData);
    (async function fetchData() {
      await setTimeout(() => {
        props.getSubjectProfile(props.relationAuuid);
        history.push(`/app/subject/subjectProfile?uuid=${props.relationAuuid}`);
      }, 500);
    })();
  };

  const searchContent = (
    <StyledDialogContent>
      <StyledGrid container direction="row">
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Do you want to remove the relationship between {props.relationAname} and {props.relationBname}?
        </Typography>
      </StyledGrid>
    </StyledDialogContent>
  );

  return (
    <Modal
      content={searchContent}
      handleError={noop}
      buttonsSet={[
        {
          buttonType: "openButton",
          label: "Remove",
          sx: removeButtonStyle,
        },
        {
          buttonType: "applyButton",
          label: "Remove",
          redirectTo: `/app/subject?uuid=${props.relationAuuid}`,
          sx: applyButtonStyle,
          click: removeClick,
        },
        {
          buttonType: "cancelButton",
          label: t("cancel"),
          sx: cancelButtonStyle,
        },
      ]}
      title="Remove Relative"
      btnHandleClose={close}
    />
  );
};

const mapStateToProps = state => ({
  Relations: state.dataEntry.relations,
  subjects: state.dataEntry.search.subjects,
  searchParams: state.dataEntry.search.subjectSearchParams,
  subjectTypes: first(state.dataEntry.metadata.operationalModules.subjectTypes),
});

const mapDispatchToProps = {
  removeRelationShip,
  saveRelationShip,
  getSubjectProfile,
};

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(RemoveRelative)
);