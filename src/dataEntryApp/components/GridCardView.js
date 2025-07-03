import React from "react";
import { styled } from '@mui/material/styles';
import { Grid, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

const StyledGridContainer = styled(Grid)(({ theme }) => ({
  padding: theme.spacing(1.25), // 10px
  paddingBottom: theme.spacing(1.25),
}));

const StyledGridCard = styled(Grid)(({ theme }) => ({
  boxShadow: "0px 0px 0px 0px",
  borderRadius: 0,
  padding: theme.spacing(1.25), // 10px
}));

const GridCardView = ({ cards, xs = 12, sm = 6, md = 3, lg = 2, xl = 2, noDataMessage }) => {
  const { t } = useTranslation();

  return (
    <StyledGridContainer container>
      {cards && cards.length > 0 ? (
        cards.map((card, index) => (
          <StyledGridCard
            key={index}
            size={{
              xs,
              sm,
              md,
              lg,
              xl,
            }}
          >
            {card}
          </StyledGridCard>
        ))
      ) : (
        <Typography component="div">{noDataMessage || t("zeroNumberOfResults")}</Typography>
      )}
    </StyledGridContainer>
  );
};

export default GridCardView;