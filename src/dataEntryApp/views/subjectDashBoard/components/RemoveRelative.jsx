import { styled } from "@mui/material/styles";
import { DialogContent, Grid, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { first, noop } from "lodash";
import { useNavigate } from "react-router-dom";
import Modal from "./CommonModal";
import {
  clearRelationshipError,
  saveRelationShip,
} from "../../../reducers/relationshipReducer";
import MessageDialog from "../../../components/MessageDialog";
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

const RemoveRelative = (props) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const Relations = useSelector((state) => state.dataEntry.relations);
  const subjects = useSelector((state) => state.dataEntry.search.subjects);
  const searchParams = useSelector(
    (state) => state.dataEntry.search.subjectSearchParams,
  );
  const subjectTypes = useSelector((state) =>
    first(state.dataEntry.metadata.operationalModules.subjectTypes),
  );
  const relationshipError = useSelector(
    (state) => state.dataEntry.relations.relationshipError,
  );

  const close = () => {};

  const handleCloseError = () => {
    dispatch(clearRelationshipError());
  };

  const removeClick = () => {
    const RelationData = {
      individualAUUID: props.relationAuuid,
      individualBUUID: props.relationBuuid,
      relationshipTypeUUID: props.relationBTypeuuid,
      uuid: props.relationuuid,
      voided: true,
    };
    dispatch(saveRelationShip(RelationData));

    setTimeout(() => {
      dispatch(getSubjectProfile(props.relationAuuid));
      navigate(`/app/subject/subjectProfile?uuid=${props.relationAuuid}`);
    }, 500);
  };

  const searchContent = (
    <StyledDialogContent>
      <StyledGrid container direction="row">
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Do you want to remove the relationship between {props.relationAname}{" "}
          and {props.relationBname}?
        </Typography>
      </StyledGrid>
    </StyledDialogContent>
  );

  return (
    <>
      <MessageDialog
        title={t("relationshipError")}
        message={t(relationshipError)}
        open={!!relationshipError}
        onOk={handleCloseError}
      />
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
    </>
  );
};

export default RemoveRelative;
