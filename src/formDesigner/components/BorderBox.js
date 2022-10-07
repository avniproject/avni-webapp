import React from "react";
import Box from "@material-ui/core/Box";

export default ({ children }) => {
  return (
    <Box border={1} my={2} borderColor={"#ddd"} p={2}>
      {children}
    </Box>
  );
};
