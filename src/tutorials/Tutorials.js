import React from "react";
import AppBar from "../common/components/AppBar";
import { Box } from "@material-ui/core";
import Resources from "./Resources";
import Header from "./Header";

const Tutorials = () => {
  return (
    <React.Fragment>
      <AppBar title={`Customer training and resources `} component={Header} />
      <div style={{ backgroundColor: "#FFFFFF", height: "100vh", paddingTop: 25 }}>
        <div style={{ marginRight: "20%", marginLeft: "20%" }}>
          <Box mt={25} />
          <Resources />
        </div>
      </div>
    </React.Fragment>
  );
};

export default Tutorials;
