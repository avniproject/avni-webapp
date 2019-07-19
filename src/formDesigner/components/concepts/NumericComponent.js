import React, { Component } from "react";
import PropTypes from "prop-types";

import NumericConcept from "./NumericConcept";

class NumericComponent extends Component {
  render() {
    return (
      <NumericConcept readOnly={true} concept={this.props.field.concept} />
    );
  }
}

NumericComponent.propTypes = {
  field: PropTypes.object.isRequired
};

export default NumericComponent;
