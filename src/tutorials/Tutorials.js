import { Fragment } from "react";
import AppBar from "../common/components/AppBar";
import Resources from "./Resources";
import Header from "./Header";

const Tutorials = () => {
  return (
    <Fragment>
      <AppBar title={`Customer training and resources `} component={Header} position={"sticky"} />
      <div style={{ marginRight: "20%", marginLeft: "20%", marginTop: "15%" }}>
        <Resources />
      </div>
    </Fragment>
  );
};

export default Tutorials;
