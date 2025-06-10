import { makeStyles } from "@mui/styles";
import React from "react";
import { isEmpty } from "lodash";

import ShowMoreText from "react-show-more-text";

const useStyles = makeStyles(() => ({
  container: {
    width: "50%",
    marginBottom: "20px",
    color: "rgba(69,69,69,0.54)"
  }
}));

export const HelpText = ({ text, t }) => {
  const classes = useStyles();
  const renderText = () => (
    <div className={classes.container}>
      <ShowMoreText
        lines={2}
        more="Show more"
        less="Show less"
        className="content-css"
        anchorClass="my-anchor-css-class"
        expanded={false}
        truncatedEndingComponent={"... "}
      >
        {t(text)}
      </ShowMoreText>
    </div>
  );

  return isEmpty(text) ? null : renderText();
};
