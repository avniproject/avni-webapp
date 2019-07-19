import React from "react";
import _ from "lodash";

const NumericConcept = ({ concept, readOnly }) => (
  <div className="form-row">
    <div className="form-group col-md-2">
      <label htmlFor="lowAbsolute">Low Absolute</label>
      <input
        disabled={readOnly}
        type="text"
        className="form-control"
        id="lowAbsolute"
        value={_.get(concept, "lowAbsolute", "")}
      />
    </div>
    <div className="form-group col-md-2">
      <label htmlFor="highAbsolute">High Absolute</label>
      <input
        disabled={readOnly}
        type="text"
        className="form-control"
        id="highAbsolute"
        value={_.get(concept, "highAbsolute", "")}
      />
    </div>
    <div className="form-group col-md-2">
      <label htmlFor="lowNormal">Low Normal</label>
      <input
        disabled={readOnly}
        type="text"
        className="form-control"
        id="lowNormal"
        value={_.get(concept, "lowNormal", "")}
      />
    </div>
    <div className="form-group col-md-2">
      <label htmlFor="highNormal">High Normal</label>
      <input
        disabled={readOnly}
        type="text"
        className="form-control"
        id="highNormal"
        value={_.get(concept, "highNormal", "")}
      />
    </div>
    <div className="form-group col-md-4">
      <label htmlFor="unit">Unit</label>
      <select
        disabled={readOnly}
        id="unit"
        className="form-control"
        value={_.get(concept, "unit", "")}
      >
        <option defaultValue="" />
        <option>cm</option>
        <option>kg</option>
        <option>mm Hg</option>
        <option>g/dL</option>
        <option>beats/minute</option>
        <option>breaths/minute</option>
        <option>&#8451;</option>
        <option>&#8457;</option>
      </select>
    </div>
  </div>
);

export default NumericConcept;
