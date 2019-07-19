import CodedComponent from "./CodedComponent";
import React, { Component } from "react";

class MultiCodedComponent extends Component {
  render() {
    return <CodedComponent {...this.props} type="MultiSelect" />;
  }
}

export default MultiCodedComponent;
