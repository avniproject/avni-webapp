import React, { Fragment } from "react";
import Typography from "@material-ui/core/Typography";
import { useTranslation } from "react-i18next";

const Stepper = ({ subjectTypeName, ...props }) => {
  const { t } = useTranslation();

  return (
    <Fragment>
      <Typography variant="h6" gutterBottom>
        {t("register")} {t(subjectTypeName)}
      </Typography>
    </Fragment>
  );
};

export default Stepper;
