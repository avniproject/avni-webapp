import React from "react";
import SubjectButton from "./Button";
import { GridLegacy as Grid } from "@mui/material";
import { useTranslation } from "react-i18next";
import { InternalLink } from "../../../../common/components/utils";

export const NewVisitLinkButton = ({ to, label }) => {
  const { t } = useTranslation();
  return (
    <Grid
      container
      sx={{
        justifyContent: "flex-end"
      }}
    >
      <InternalLink to={to} noUnderline id={"new-general-visit"}>
        <SubjectButton btnLabel={t(label)} />
      </InternalLink>
    </Grid>
  );
};
