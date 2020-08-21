import { Box } from "@material-ui/core";
import React from "react";
import Typography from "@material-ui/core/Typography";

const Header = () => {
  return (
    <Box pt={10} pb={10} mt={6.2} mb={5} bgcolor={"#f8f4f4"}>
      <Typography variant="h3" align={"center"}>
        We are here to help!
      </Typography>
    </Box>
  );
};

export default Header;
