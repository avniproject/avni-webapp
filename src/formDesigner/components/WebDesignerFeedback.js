import React from "react";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import { Title } from "react-admin";

function WebDesignerFeedback() {
  function handleClick() {
    window.open("https://forms.gle/65q4DkxbS4onroys9", "_blank");
  }
  return (
    <Box boxShadow={2} p={3} bgcolor="background.paper">
      <Title title="Feedback Form" />
      <Button onClick={handleClick}>Fill Feedback Form</Button>
    </Box>
  );
}

export default WebDesignerFeedback;
