import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { useTranslation } from "react-i18next";
import Dialog from "@material-ui/core/Dialog";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import MuiDialogActions from "@material-ui/core/DialogActions";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import SubjectButton from "./Button";
import Fab from "@material-ui/core/Fab";
//import Link from "@material-ui/core/Link";
import { Link } from "react-router-dom";
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

const DialogTitle = withStyles(styles)(props => {
  const { children, classes, onClose, ...other } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
});

const DialogActions = withStyles(theme => ({
  root: {
    margin: 0,
    padding: "11px",
    backgroundColor: "#F8F9F9",
    float: "left",
    display: "inline"
  }
}))(MuiDialogActions);

const CommonModal = ({ content, buttonsSet, title, handleError }) => {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const [validMsg, setValidationMsg] = React.useState(false);

  //const { t } = useTranslation();

  const handleClickOpen = () => {
    setOpen(true);
    handleError(false);
  };
  const handleClose = () => {
    setOpen(false);
    handleError(false);
  };

  const mainButton = buttonsSet.filter(element => element.buttonType === "openButton").shift();
  const filterButton = buttonsSet.filter(element => element.buttonType === "filterButton").shift();
  const saveButton = buttonsSet.filter(element => element.buttonType === "saveButton").shift();
  const cancelButton = buttonsSet.filter(element => element.buttonType === "cancelButton").shift();
  const applyButton = buttonsSet.filter(element => element.buttonType === "applyButton").shift();

  return (
    <React.Fragment>
      {mainButton ? (
        <Fab
          className={mainButton.classes}
          variant="extended"
          color="primary"
          aria-label="add"
          onClick={handleClickOpen}
        >
          {mainButton.label}
        </Fab>
      ) : (
        ""
      )}

      {filterButton ? (
        <Fab
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
      ) : (
        ""
      )}

      <Dialog onClose={handleClose} aria-labelledby="customized-dialog-title" open={open}>
        <DialogTitle
          id="customized-dialog-title"
          onClose={handleClose}
          styles={{ backgroundColor: "black" }}
        >
          {title}
        </DialogTitle>
        {content}
        <DialogActions className={classes.borderBottom}>
          {saveButton && saveButton.requiredField ? (
            <Link to={saveButton.redirectTo}>
              <SubjectButton
                btnLabel={saveButton.label}
                btnClass={saveButton.classes}
                btnClick={handleClose}
              />
            </Link>
          ) : saveButton ? (
            <SubjectButton
              btnLabel={saveButton.label}
              btnClass={saveButton.classes}
              btnClick={handleError.bind(this, true)}
            />
          ) : (
            ""
          )}
          {applyButton ? (
            <SubjectButton
              btnLabel={applyButton.label}
              btnClass={applyButton.classes}
              btnClick={() => {
                applyButton.click();
                handleClose();
              }}
            />
          ) : (
            ""
          )}
          {cancelButton ? (
            <SubjectButton
              btnLabel={cancelButton.label}
              btnClass={cancelButton.classes}
              btnClick={handleClose}
            />
          ) : (
            ""
          )}
        </DialogActions>
      </Dialog>
      {validMsg ? (
        <CustomizedDialog
          showSuccessIcon="true"
          message={validMsg}
          showOkbtn={validMsg}
          openDialogContainer={validMsg}
          onOk={() => {
            setValidationMsg(false);
          }}
        />
      ) : (
        ""
      )}
    </React.Fragment>
  );
};

export default CommonModal;
