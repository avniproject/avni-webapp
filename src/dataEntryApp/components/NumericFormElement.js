import React from "react";
import { TextField, Typography } from "@material-ui/core";
import { find, isEmpty, isNil, toNumber } from "lodash";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/core/styles";
import Colors from "../Colors";

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

export default ({ formElement: fe, value, update, validationResults, uuid, isGrid }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const validationResult = find(
    validationResults,
    ({ formIdentifier, questionGroupIndex }) => formIdentifier === uuid && questionGroupIndex === fe.questionGroupIndex
  );

  const error = () => {
    if (validationResult && !validationResult.success) {
      return true;
    }
    if (fe.concept.isAbnormal(value)) {
      return !isNil(value);
    }
    return false;
  };

  const textColor = error() ? Colors.ValidationError : fe.editable ? Colors.DefaultPrimary : Colors.DefaultDisabled;

  const rangeText = (lowNormal, hiNormal) => {
    let rangeText = null;
    if (!isNil(lowNormal)) {
      if (!isNil(hiNormal)) {
        rangeText = `${lowNormal} - ${hiNormal}`;
      } else {
        rangeText = `>=${lowNormal}`;
      }
    } else if (!isNil(hiNormal)) {
      rangeText = `<=${hiNormal}`;
    }
    return isNil(rangeText) ? "" : ` (${rangeText})`;
  };

  return (
    <div className={isGrid ? classes.gridContainerStyle : classes.containerStyle}>
      <Typography variant="body1" gutterBottom={!isGrid} className={isGrid ? classes.gridLabelStyle : classes.labelStyle}>
        {t(fe.name)}
        {fe.mandatory ? "*" : ""}
        {!isNil(fe.concept.unit) && !isEmpty(fe.concept.unit.trim()) ? ` (${fe.concept.unit})` : ""}
        {rangeText(fe.concept.lowNormal, fe.concept.hiNormal)}
      </Typography>
      <TextField
        type="number"
        autoComplete="off"
        required={fe.mandatory}
        name={fe.name}
        value={value == null ? "" : value}
        style={{ width: "30%" }}
        helperText={validationResult && t(validationResult.messageKey, validationResult.extra)}
        error={error()}
        InputProps={{ style: { color: textColor }, disableUnderline: !fe.editable }}
        onChange={e => {
          const v = e.target.value;
          isEmpty(v) ? update(null) : update(v.replace(/[^0-9.]/g, ""));
        }}
        disabled={!fe.editable}
        onBlur={() => (isNil(value) ? update(null) : update(toNumber(value)))}
      />
    </div>
  );
};
