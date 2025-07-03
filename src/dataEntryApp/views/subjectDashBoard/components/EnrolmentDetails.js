import { styled } from '@mui/material/styles';
import {
  AccordionSummary,
  Typography,
  AccordionDetails,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Accordion,
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import moment from "moment";
import { Link } from "react-router-dom";
import { DeleteButton } from "../../../components/DeleteButton";
import React, { Fragment } from "react";
import Observations from "../../../components/Observations";

const StyledAccordion = styled(Accordion)(({ theme }) => ({
  marginBottom: "11px",
  borderRadius: "5px",
  boxShadow: "0px 0px 3px 0px rgba(0,0,0,0.4), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 2px 1px -1px rgba(0,0,0,0.12)",
}));

const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
  '& .MuiAccordionSummary-content': {
    fontSize: theme.typography.pxToRem(16),
    flexBasis: "33.33%",
    flexShrink: 0,
    fontWeight: "500",
  },
}));

const StyledExpandMore = styled(ExpandMore)(({ theme }) => ({
  color: "#0e6eff",
}));

const StyledAccordionDetails = styled(AccordionDetails)(({ theme }) => ({
  paddingTop: "0px",
}));

export const EnrolmentDetails = ({
                                   t,
                                   isExit,
                                   label,
                                   programData,
                                   programEnrolmentForm,
                                   subjectUuid,
                                   subjectProfile,
                                   undoExitEnrolment,
                                   handleUpdateComponent,
                                   setVoidConfirmation,
                                 }) => {
  const [open, setOpen] = React.useState(false);

  const getURLOfFormType = formType =>
    `/app/subject/enrol?uuid=${subjectUuid}&programName=${
      programData.program.operationalProgramName
    }&formType=${formType}&programEnrolmentUuid=${programData.uuid}&subjectTypeName=${subjectProfile.subjectType.name}`;

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleUndoExit = (programEnrolmentUuid) => {
    undoExitEnrolment(programEnrolmentUuid);
    handleClose();
    handleUpdateComponent(subjectUuid);
  };

  const getExitInfo = () => {
    return [
      {
        label: "Exit Enrolment Date",
        value: moment(programData.programExitDateTime).format("DD-MMM-YYYY"),
      },
    ];
  };

  const getEnrolmentInfo = () => {
    return [
      {
        label: "Enrolment Date",
        value: moment(programData.enrolmentDateTime).format("DD-MMM-YYYY"),
      },
    ];
  };

  const renderObservations = () => {
    const obs = isExit ? programData.exitObservations : programData.observations;
    const additionalRows = isExit ? getExitInfo() : getEnrolmentInfo();
    return <Observations observations={obs} additionalRows={additionalRows} form={programEnrolmentForm} />;
  };

  const ActionButton = ({ to, label, id }) => {
    return (
      <Link to={to}>
        <Button id={id} color="primary">
          {t(label)}
        </Button>
      </Link>
    );
  };

  return (
    <StyledAccordion>
      <StyledAccordionSummary expandIcon={<StyledExpandMore />} id="enrolment-details">
        <Typography component="span">{t(label)}</Typography>
      </StyledAccordionSummary>
      <StyledAccordionDetails>
        <Grid size={12}>
          {renderObservations()}
          {!isExit ? (
            <Fragment>
              <ActionButton to={getURLOfFormType("ProgramExit")} label="Exit" id="exit-program" />
              <ActionButton to={getURLOfFormType("ProgramEnrolment")} label="Edit" id="edit-program" />
            </Fragment>
          ) : (
            <Fragment>
              <ActionButton to={getURLOfFormType("ProgramExit")} label="Edit Exit" id="edit-exit" />
              <Button id="undo-exit" color="primary" onClick={handleClickOpen}>
                {t("Undo Exit")}
              </Button>
            </Fragment>
          )}
          {!isExit && <DeleteButton onDelete={() => setVoidConfirmation(true)} />}
        </Grid>
        <Dialog open={open} onClose={handleClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
          <DialogTitle id="alert-dialog-title">Undo Exit</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Do you want to undo the exit and restore to the enrolled state?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Cancel
            </Button>
            <Button
              onClick={() => handleUndoExit(programData.uuid)}
              color="primary"
              autoFocus
            >
              Undo Exit
            </Button>
          </DialogActions>
        </Dialog>
      </StyledAccordionDetails>
    </StyledAccordion>
  );
};