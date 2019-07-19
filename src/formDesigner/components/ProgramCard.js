import React from "react";
import _ from "lodash";
import ProgramForms from "./ProgramForms";

export default function ProgramCard(props) {
  const programCards = [];
  _.forEach(props.data, (programData, programDataIndex) => {
    const style = {
      backgroundColor: programData.program.colour
    };
    const collapseId = "collapse" + programDataIndex;
    const headingId = "heading" + programDataIndex;
    programCards.push(
      <div className="card" key={programData.program.uuid}>
        <div className="card-header" role="tab" id={headingId}>
          <h2 className="card-title text-center" style={style}>
            <a
              data-toggle="collapse"
              href={"#" + collapseId}
              aria-expanded="true"
              aria-controls={collapseId}
              style={{ color: "white" }}
            >
              {programData.program.name}
            </a>
          </h2>
        </div>
        <div className="card-body">
          <div
            id={collapseId}
            className="collapse show"
            role="tabpanel"
            aria-labelledby={headingId}
            data-parent="#accordion"
          >
            <ProgramForms forms={programData.forms} history={props.history} />
          </div>
        </div>
      </div>
    );
  });
  return (
    <div className="container">
      <div id="accordion" role="tablist">
        {programCards}
      </div>
    </div>
  );
}
