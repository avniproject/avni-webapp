import React from "react";
import { TextField, Typography } from "@material-ui/core";
import { find, isEmpty } from "lodash";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/core/styles";
import { HelpText } from "../../common/components/HelpText";

const useStyles = makeStyles(theme => ({
  labelStyle: {
    width: "50%",
    marginBottom: 10,
    color: "rgba(0, 0, 0, 0.54)"
  },
  containerStyle: {},
  gridContainerStyle: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    width: "50%"
  },
  gridLabelStyle: {
    color: "rgba(0, 0, 0, 0.54)",
    flex: 0.5,
    marginRight: "15px",
    borderRight: "1px solid rgba(0, 0, 0, 0.12)"
  }
}));

export default ({ formElement: fe, value, update, validationResults, uuid, isGrid, helpText }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const validationResult = find(
    validationResults,
    ({ formIdentifier, questionGroupIndex }) => formIdentifier === uuid && questionGroupIndex === fe.questionGroupIndex
  );
  return (
    <div className={isGrid ? classes.gridContainerStyle : classes.containerStyle}>
      <Typography
        variant="body1"
        gutterBottom={!isGrid && isEmpty(helpText)}
        className={isGrid ? classes.gridLabelStyle : classes.labelStyle}
      >
        {t(fe.name)}
        {fe.mandatory ? "*" : ""}
      </Typography>
      <HelpText text={helpText} t={t} />
      <TextField
        multiline={true}
        id={fe.name.replaceAll(" ", "-")}
        type={"text"}
        autoComplete="off"
        required={fe.mandatory}
        name={fe.name}
        value={value ? value : ""}
        style={{ width: "30%" }}
        helperText={validationResult && t(validationResult.messageKey, validationResult.extra)}
        error={validationResult && !validationResult.success}
        onChange={e => {
          const v = e.target.value;
          isEmpty(v) ? update() : update(v);
        }}
        InputProps={{ disableUnderline: !fe.editable }}
        disabled={!fe.editable}
      />
    </div>
  );
};
