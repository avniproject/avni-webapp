import { useTranslation } from "react-i18next";
import moment from "moment";
import { Typography } from "@material-ui/core";
import { LineBreak } from "common/components/utils";
import React from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";

const useStyle = makeStyles(theme => ({
  detailsstyle: {
    color: "#000",
    fontSize: "bold"
  },
  details: {
    color: "rgba(0, 0, 0, 0.54)",
    backgroundColor: "#F8F9F9",
    height: 40,
    width: "100%",
    padding: 8,
    marginBottom: 10
  }
}));

const FormWizardHeader = ({ subject }) => {
  const classes = useStyle();
  const { t } = useTranslation();
  const fullName = subject.firstName + " " + subject.lastName || "-";
  const gender = subject.gender ? subject.gender.name || "-" : "";
  const lowestAddressLevel = subject.lowestAddressLevel
    ? subject.lowestAddressLevel.name || "-"
    : "";
  const lowestAddressLevelType = subject.lowestAddressLevel
    ? subject.lowestAddressLevel.type || "-"
    : "";
  const dateOfBirth = moment().diff(subject.dateOfBirth, "years") + "yrs" || "-";
  return (
    <div className={classes.details}>
      <Typography variant="caption" gutterBottom>
        {t("name")}:{" "}
        <Typography className={classes.detailsstyle} variant="caption" gutterBottom>
          {fullName}
        </Typography>{" "}
        | {t("age")}:{" "}
        <Typography className={classes.detailsstyle} variant="caption" gutterBottom>
          {dateOfBirth}
        </Typography>{" "}
        | {t("gender")}:{" "}
        <Typography className={classes.detailsstyle} variant="caption" gutterBottom>
          {gender}
        </Typography>{" "}
        | {t(lowestAddressLevelType)}:{" "}
        <Typography className={classes.detailsstyle} variant="caption" gutterBottom>
          {lowestAddressLevel}
        </Typography>
      </Typography>
      <LineBreak num={2} />
    </div>
  );
};

export default FormWizardHeader;
