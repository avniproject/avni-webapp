import React from "react";
import { Link } from "react-router-dom";
import FindConcept from "./FindConcept";

import Breadcrumb from "./Breadcrumb";

const Concepts = ({ location }) => (
  <div className="container">
    <Breadcrumb location={location} />
    <div className="row">
      <div className="col">
        <nav className="navbar float-left">
          <Link to="/concepts/addConcept">Add Concept</Link>
        </nav>
      </div>
    </div>
    <div className="row">
      <div className="col">
        <FindConcept />
      </div>
    </div>
  </div>
);
export default Concepts;
