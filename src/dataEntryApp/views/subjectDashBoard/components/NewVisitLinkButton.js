import React from "react";
import SubjectButton from "./Button";
import Grid from "@material-ui/core/Grid";
import { useTranslation } from "react-i18next";
import { InternalLink } from "../../../../common/components/utils";

export const NewVisitLinkButton = ({ to, label }) => {
  const { t } = useTranslation();
  return (
    <Grid container justify="flex-end">
      <InternalLink to={to} noUnderline id={"new-general-visit"}>
        <SubjectButton btnLabel={t(label)} />
      </InternalLink>
    </Grid>
  );
};
