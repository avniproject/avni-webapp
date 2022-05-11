import React, { useState, Fragment } from "react";
import { isEmpty } from "lodash";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Box from "@material-ui/core/Box";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";

const useStyles = makeStyles(() => ({
  customBox: {
    display: "-webkit-box",
    boxOrient: "vertical",
    lineClamp: 2,
    wordBreak: "break-all",
    overflow: "hidden",
    marginBottom: "20px",
    color: "rgba(0, 0, 0, 0.54)",
    "&:hover": {
      cursor: "pointer"
    }
  }
}));

export const HelpText = ({ text, t }) => {
  const classes = useStyles();
  const [showDialog, setShowDialog] = useState(false);

  const renderText = () => (
    <Fragment>
      <Box
        onClick={() => setShowDialog(true)}
        width={"50%"}
        fontSize="0.9rem"
        component="div"
        classes={{ root: classes.customBox }}
      >
        {t(text)}
      </Box>
      <Dialog onClose={() => setShowDialog(false)} open={showDialog}>
        <DialogContent>{t(text)}</DialogContent>
      </Dialog>
    </Fragment>
  );

  return isEmpty(text) ? null : renderText();
};
