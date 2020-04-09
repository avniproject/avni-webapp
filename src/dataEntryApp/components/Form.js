import React, { Fragment } from "react";
import { withParams } from "../../common/components/utils";
import { FormElementGroup } from "./FormElementGroup";

import { withRouter } from "react-router-dom";

const Form = ({ current, obs, updateObs, validationResults }) => {
  return (
    <Fragment>
      <FormElementGroup
        key={current.uuid}
        obs={obs}
        updateObs={updateObs}
        validationResults={validationResults}
      >
        {current}
      </FormElementGroup>
    </Fragment>
  );
};

export default withRouter(withParams(Form));
