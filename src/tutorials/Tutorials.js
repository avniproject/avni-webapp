import React from "react";
import AppBar from "../common/components/AppBar";
import { Box } from "@material-ui/core";
import Header from "./Header";
import Resources from "./Resources";
import Body from "./Body";

const Tutorials = () => {
  return (
    <React.Fragment>
      <AppBar title={`Customer training and resources `} />
      <div style={{ backgroundColor: "#FFFFFF", height: "100vh" }}>
        <Header />
        <div style={{ marginRight: "20%", marginLeft: "20%" }}>
          <Body />
          <Box mt={5} />
          <Resources />
        </div>
      </div>
    </React.Fragment>
  );
};

export default Tutorials;
