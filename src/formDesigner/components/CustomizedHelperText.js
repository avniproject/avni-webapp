import React from "react";
import Tooltip from "@material-ui/core/Tooltip";
import Box from "@material-ui/core/Box";
import HelpIcon from "@material-ui/icons/Help";
import Button from "@material-ui/core/Button";
import { helperText } from "../common/constants";

const TooltipBox = props => {
  return (
    <Box
      p={5}
      style={{
        maxWidth: "350px"
      }}
    >
      <p style={{ color: "white", fontSize: 15 }}>{helperText[props.name]["text"]}</p>
      <Button
        style={{ float: "right" }}
        variant="contained"
        color="primary"
        onClick={() => window.open(helperText[props.name]["url"], "_blank")}
      >
        Read More
      </Button>
    </Box>
  );
};

export default function CustomizedHelperText(props) {
  return (
    <Tooltip title={<TooltipBox {...props} />} interactive="true" arrow>
      <HelpIcon color="primary" />
    </Tooltip>
  );
}
