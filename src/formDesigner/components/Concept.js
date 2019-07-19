import React from "react";

import Breadcrumb from "./Breadcrumb";

class Concept extends React.Component {
  render() {
    const concept = this.props.history.location.state.concept;
    // const answers = concept.conceptAnswers.map(cA => cA.answerConcept.name);
    return (
      <div className="container">
        <Breadcrumb location={this.props.location} />
        <div>
          <pre>{JSON.stringify(concept, null, 2)}</pre>
        </div>
      </div>
    );
  }
}

export default Concept;
