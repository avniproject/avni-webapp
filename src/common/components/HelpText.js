import React from "react";
import { styled } from '@mui/material/styles';
import { isEmpty } from "lodash";
import ShowMoreText from "react-show-more-text";

const StyledContainer = styled('div')(({ theme }) => ({
  width: "50%",
  marginBottom: theme.spacing(2.5), // 20px
  color: "rgba(69,69,69,0.54)",
}));

export const HelpText = ({ text, t }) => {
  const renderText = () => (
    <StyledContainer>
      <ShowMoreText
        lines={2}
        more="Show more"
        less="Show less"
        className="content-css"
        anchorClass="my-anchor-css-class"
        expanded={false}
        truncatedEndingComponent="... "
      >
        {t(text)}
      </ShowMoreText>
    </StyledContainer>
  );

  return isEmpty(text) ? null : renderText();
};