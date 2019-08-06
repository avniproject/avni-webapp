import React from "react";
import Body from "./Body";
import AppBar from "../AppBar";
import { Container } from "@material-ui/core";

/**
 * This is the typical view you will need for most of your screens.
 * It gives your basic screen with an app bar and a white background for your content.
 *
 * @param props
 * @returns {*}
 * @constructor
 */
const ScreenWithAppBar = props => {
  return (
    <Container fixed>
      <AppBar title={props.appbarTitle} />
      <Body>{props.children}</Body>
    </Container>
  );
};

export default ScreenWithAppBar;
