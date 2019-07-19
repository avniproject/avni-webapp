import CodedComponent from "./CodedComponent";
import React, { Component } from "react";

class SingleCodedComponent extends Component {
  render() {
    return <CodedComponent {...this.props} type="SingleSelect" />;
  }
}

export default SingleCodedComponent;
