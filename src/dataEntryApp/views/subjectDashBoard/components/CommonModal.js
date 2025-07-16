import { useState, Fragment } from "react";
import { styled } from "@mui/material/styles";
import { Typography, Dialog, DialogActions as MuiDialogActions, IconButton, Fab } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { Link } from "react-router-dom";
import SubjectButton from "./Button";
import FloatingButton from "./FloatingButton";
import CustomizedDialog from "../../../components/Dialog";

const DialogTitleWrapper = styled("div")(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between"
}));

const StyledCloseButton = styled(IconButton)({
  color: "white"
});

const DialogActions = styled(MuiDialogActions)({
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

  const pick = type => buttonsSet.find(btn => btn.buttonType === type);

  const mainButton = pick("openButton");
  const filterButton = pick("filterButton");
  const saveButton = pick("saveButton");
  const cancelButton = pick("cancelButton");
  const applyButton = pick("applyButton");
  const findButton = pick("findButton");
  const modifySearchFloating = pick("modifySearchFloating");
  const applyFloating = pick("applyFloating");

  return (
    <Fragment>
      {mainButton && (
        <Fab id={mainButton.label.replaceAll(" ", "-")} variant="extended" color="primary" aria-label="add" onClick={handleClickOpen}>
          {mainButton.label}
        </Fab>
      )}

      {filterButton && (
        <Fab
          id={filterButton.label.replaceAll(" ", "-")}
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
        <DialogTitleWrapper id="customized-dialog-title">
          <Typography variant="h6">{title}</Typography>
          <StyledCloseButton aria-label="close" onClick={handleClose} size="large">
            <CloseIcon />
          </StyledCloseButton>
        </DialogTitleWrapper>

        {content}

        <DialogActions>
          {cancelButton && <SubjectButton id="cancel-dialog-button" btnLabel={cancelButton.label} btnClick={handleClose} />}
          {findButton && (
            <SubjectButton
              id="find-dialog-button"
              btnLabel={findButton.label}
              btnClick={findButton.click}
              btnDisabled={findButton.disabled}
            />
          )}
          {applyFloating && (
            <FloatingButton
              id="apply-floating-dialog-button"
              btnLabel={applyFloating.label}
              btnClick={() => {
                applyFloating.click();
                handleClose();
              }}
              btnDisabled={applyFloating.disabled}
              left={applyFloating.left}
            />
          )}
          {modifySearchFloating && (
            <FloatingButton
              id="modify-search-dialog-button"
              btnLabel={modifySearchFloating.label}
              btnClick={modifySearchFloating.click}
              btnDisabled={modifySearchFloating.disabled}
              left={modifySearchFloating.left}
            />
          )}
          {saveButton?.requiredField ? (
            <Link to={saveButton.redirectTo}>
              <SubjectButton id="save-required-dialog-button" btnLabel={saveButton.label} btnClick={handleClose} />
            </Link>
          ) : (
            saveButton && <SubjectButton id="save-dialog-button" btnLabel={saveButton.label} btnClick={() => handleError(true)} />
          )}
          {applyButton && (
            <SubjectButton
              id="apply-dialog-button"
              btnLabel={applyButton.label}
              btnClick={() => {
                applyButton.click();
                handleClose();
              }}
              btnDisabled={applyButton.disabled}
            />
          )}
        </DialogActions>
      </Dialog>

      {validMsg && (
        <CustomizedDialog showSuccessIcon message={validMsg} showOkbtn openDialogContainer onOk={() => setValidationMsg(false)} />
      )}
    </Fragment>
  );
};

export default CommonModal;
