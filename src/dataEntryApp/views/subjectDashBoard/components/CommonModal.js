import { useState, Fragment } from "react";
import { styled } from "@mui/material/styles";
import { Typography, Dialog, DialogActions, IconButton, Fab } from "@mui/material";
import { Close } from "@mui/icons-material";
import { Link } from "react-router-dom";
import SubjectButton from "./Button";
import FloatingButton from "./FloatingButton";
import CustomizedDialog from "../../../components/Dialog";

const StyledDialogTitle = styled("div")({
  margin: 0,
  backgroundColor: "#555555",
  padding: "6px 16px",
  color: "white"
});

const StyledCloseButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  right: theme.spacing(1),
  top: "0px",
  color: "white"
}));

const StyledDialogActions = styled(DialogActions)({
  margin: 0,
  padding: "11px",
  backgroundColor: "#F8F9F9",
  float: "left",
  display: "inline"
});

const CommonModal = ({ content, buttonsSet, title, handleError, btnHandleClose, ...props }) => {
  const [open, setOpen] = useState(false);
  const [validMsg, setValidationMsg] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
    handleError(false);
  };

  const handleClose = () => {
    setOpen(false);
    handleError(false);
    btnHandleClose();
  };

  const mainButton = buttonsSet.filter(element => element.buttonType === "openButton").shift();
  const filterButton = buttonsSet.filter(element => element.buttonType === "filterButton").shift();
  const saveButton = buttonsSet.filter(element => element.buttonType === "saveButton").shift();
  const cancelButton = buttonsSet.filter(element => element.buttonType === "cancelButton").shift();
  const applyButton = buttonsSet.filter(element => element.buttonType === "applyButton").shift();
  const findButton = buttonsSet.filter(element => element.buttonType === "findButton").shift();
  const modifySearchFloating = buttonsSet.filter(element => element.buttonType === "modifySearchFloating").shift();
  const applyFloating = buttonsSet.filter(element => element.buttonType === "applyFloating").shift();

  return (
    <Fragment>
      {mainButton && (
        <Fab
          id={mainButton.label.replaceAll(" ", "-")}
          sx={mainButton.sx}
          variant="extended"
          color="primary"
          aria-label="add"
          onClick={handleClickOpen}
        >
          {mainButton.label}
        </Fab>
      )}
      {filterButton && (
        <Fab
          id={filterButton.label.replaceAll(" ", "-")}
          sx={filterButton.sx}
          variant="extended"
          color="primary"
          aria-label="add"
          onClick={() => {
            handleClickOpen();
            filterButton.click();
          }}
        >
          {filterButton.label}
        </Fab>
      )}
      <Dialog onClose={handleClose} aria-labelledby="customized-dialog-title" open={open} {...props}>
        <StyledDialogTitle id="customized-dialog-title">
          <Typography variant="h6">{title}</Typography>
          <StyledCloseButton aria-label="close" onClick={handleClose} size="large">
            <Close />
          </StyledCloseButton>
        </StyledDialogTitle>
        {content}
        <StyledDialogActions>
          {cancelButton && (
            <SubjectButton btnLabel={cancelButton.label} btnClass={cancelButton.sx} btnClick={handleClose} id="cancel-dialog-button" />
          )}
          {findButton && (
            <SubjectButton
              btnLabel={findButton.label}
              btnClass={findButton.sx}
              btnClick={() => {
                findButton.click();
              }}
              btnDisabled={findButton.disabled}
              id="find-dialog-button"
            />
          )}
          {applyFloating && (
            <FloatingButton
              btnLabel={applyFloating.label}
              btnClass={applyFloating.sx}
              btnClick={() => {
                applyFloating.click();
                handleClose();
              }}
              btnDisabled={applyFloating.disabled}
              id="apply-floating-dialog-button"
              left={applyFloating.left}
            />
          )}
          {modifySearchFloating && (
            <FloatingButton
              btnLabel={modifySearchFloating.label}
              btnClass={modifySearchFloating.sx}
              btnClick={() => {
                modifySearchFloating.click();
              }}
              btnDisabled={modifySearchFloating.disabled}
              id="modify-search-dialog-button"
              left={modifySearchFloating.left}
            />
          )}
          {saveButton && saveButton.requiredField ? (
            <Link to={saveButton.redirectTo}>
              <SubjectButton btnLabel={saveButton.label} btnClass={saveButton.sx} btnClick={handleClose} id="save-required-dialog-button" />
            </Link>
          ) : (
            saveButton && (
              <SubjectButton
                btnLabel={saveButton.label}
                btnClass={saveButton.sx}
                btnClick={handleError.bind(null, true)}
                id="save-dialog-button"
              />
            )
          )}
          {applyButton && (
            <SubjectButton
              btnLabel={applyButton.label}
              btnClass={applyButton.sx}
              btnClick={() => {
                applyButton.click();
                handleClose();
              }}
              btnDisabled={applyButton.disabled}
              id="apply-dialog-button"
            />
          )}
        </StyledDialogActions>
      </Dialog>
      {validMsg && (
        <CustomizedDialog
          showSuccessIcon
          message={validMsg}
          showOkbtn={validMsg}
          openDialogContainer={validMsg}
          onOk={() => {
            setValidationMsg(false);
          }}
        />
      )}
    </Fragment>
  );
};

export default CommonModal;
