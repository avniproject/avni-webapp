import React from "react";
import { withStyles, makeStyles } from "@mui/styles";
import { Typography, Dialog, DialogActions, IconButton, Fab } from "@mui/material";
import { Close } from "@mui/icons-material";
import { Link } from "react-router-dom";
import SubjectButton from "./Button";
import FloatingButton from "./FloatingButton";
import CustomizedDialog from "../../../components/Dialog";

const useStyles = makeStyles(theme => ({
  tableCell: {
    borderBottom: "none",
    padding: "0px 0px 0px 16px"
  },
  enrollButtonStyle: {
    backgroundColor: "#fc9153",
    height: "38px",
    zIndex: 1
  },
  bigAvatar: {
    width: 42,
    height: 42
  },
  tableView: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  mainHeading: {
    fontSize: "20px"
  },
  tableHeader: {
    color: "#555555",
    fontSize: "12px",
    fontFamily: "Roboto Reg"
  },
  btnCustom: {
    float: "left",
    backgroundColor: "#fc9153",
    height: "30px"
  },
  cancelBtnCustom: {
    float: "left",
    backgroundColor: "#F8F9F9",
    color: "#fc9153",
    border: "1px solid #fc9153",
    height: "30px"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    margin: "auto",
    minWidth: "450px",
    minHeight: "170px"
  },
  formControl: {
    marginTop: theme.spacing(2),
    minWidth: 120,
    width: "211px"
  },
  formControlLabel: {
    marginTop: theme.spacing(1)
  },
  selectEmpty: {
    width: "211px"
  },
  btnBottom: {
    margin: 0,
    padding: "11px",
    backgroundColor: "#F8F9F9",
    float: "left",
    display: "inline"
  },
  root: {
    width: "100%",
    "& > * + *": {
      marginTop: theme.spacing(2)
    }
  }
}));

const styles = theme => ({
  root: {
    margin: 0,
    backgroundColor: "#555555",
    padding: "6px 16px",
    color: "white"
  },
  closeButton: {
    position: "absolute",
    right: theme.spacing(1),
    top: "0px",
    color: "white"
  }
});

const StyledDialogTitle = withStyles(styles)(props => {
  const { children, classes, onClose, ...other } = props;
  return (
    <div className={classes.root} {...other}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton aria-label="close" className={classes.closeButton} onClick={onClose} size="large">
          <Close />
        </IconButton>
      ) : null}
    </div>
  );
});

const StyledDialogActions = withStyles(theme => ({
  root: {
    margin: 0,
    padding: "11px",
    backgroundColor: "#F8F9F9",
    float: "left",
    display: "inline"
  }
}))(DialogActions);

const CommonModal = ({ content, buttonsSet, title, handleError, btnHandleClose, ...props }) => {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const [validMsg, setValidationMsg] = React.useState(false);

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
    <React.Fragment>
      {mainButton && (
        <Fab
          id={mainButton.label.replaceAll(" ", "-")}
          className={mainButton.classes}
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
          className={filterButton.classes}
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
        <StyledDialogTitle id="customized-dialog-title" onClose={handleClose} style={{ backgroundColor: "black" }}>
          {title}
        </StyledDialogTitle>
        {content}
        <StyledDialogActions className={classes.borderBottom} style={{ backgroundColor: "#FFF" }}>
          {cancelButton && (
            <SubjectButton btnLabel={cancelButton.label} btnClass={cancelButton.classes} btnClick={handleClose} id="cancel-dialog-button" />
          )}
          {findButton && (
            <SubjectButton
              btnLabel={findButton.label}
              btnClass={findButton.classes}
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
              btnClass={applyFloating.classes}
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
              btnClass={modifySearchFloating.classes}
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
              <SubjectButton
                btnLabel={saveButton.label}
                btnClass={saveButton.classes}
                btnClick={handleClose}
                id="save-required-dialog-button"
              />
            </Link>
          ) : (
            saveButton && (
              <SubjectButton
                btnLabel={saveButton.label}
                btnClass={saveButton.classes}
                btnClick={handleError.bind(null, true)}
                id="save-dialog-button"
              />
            )
          )}
          {applyButton && (
            <SubjectButton
              btnLabel={applyButton.label}
              btnClass={applyButton.classes}
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
    </React.Fragment>
  );
};

export default CommonModal;
