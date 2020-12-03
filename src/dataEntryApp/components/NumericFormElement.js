import React, { Fragment } from "react";
import { TextField, Typography } from "@material-ui/core";
import { isNaN, isEmpty, find, isNil } from "lodash";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/core/styles";
import Colors from "../Colors";

const useStyles = makeStyles(theme => ({
  lableStyle: {
    width: "50%",
    marginBottom: 10
  }
}));

export default ({ formElement: fe, value, update, validationResults, uuid }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const validationResult = find(
    validationResults,
    validationResult => validationResult.formIdentifier === uuid
  );

  const error = () => {
    if (isNil(value)) {
      return false;
    }
    return fe.concept.isAbnormal(value) || (validationResult && !validationResult.success);
  };

  const textColor = error() ? Colors.ValidationError : Colors.DefaultPrimary;

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
    <Fragment>
      <Typography variant="body1" gutterBottom className={classes.lableStyle}>
        {t(fe.display || fe.name)}
        {fe.mandatory ? "*" : ""}
        {!isNil(fe.concept.unit) && !isEmpty(fe.concept.unit.trim()) ? ` (${fe.concept.unit})` : ""}
        {rangeText(fe.concept.lowNormal, fe.concept.hiNormal)}
      </Typography>
      <TextField
        // label={t(fe.display || fe.name)}
        type={"numeric"}
        autoComplete="off"
        required={fe.mandatory}
        name={fe.name}
        value={isNaN(parseInt(value)) ? "" : value}
        style={{ width: "30%" }}
        helperText={validationResult && t(validationResult.messageKey, validationResult.extra)}
        error={error()}
        inputProps={{ style: { color: textColor } }}
        onChange={e => {
          const v = e.target.value;
          isEmpty(v) ? update(null) : update(parseInt(v));
        }}
        disabled={!fe.editable}
      />
    </Fragment>
  );
};
