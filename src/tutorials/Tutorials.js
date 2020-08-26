import React from "react";
import AppBar from "../common/components/AppBar";
import Resources from "./Resources";
import Header from "./Header";

const Tutorials = () => {
  return (
    <React.Fragment>
      <AppBar title={`Customer training and resources `} component={Header} position={"sticky"} />
      <div style={{ marginRight: "20%", marginLeft: "20%" }}>
        <Resources />
      </div>
    </React.Fragment>
  );
};

export default Tutorials;
