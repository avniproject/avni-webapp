import React, { Fragment } from "react";
import { withParams } from "../../common/components/utils";
import { FormElementGroup } from "./FormElementGroup";

import { withRouter } from "react-router-dom";

const Form = ({ current, obsHolder, updateObs, children, validationResults }) => {
  return (
    <Fragment>
      <FormElementGroup
        parentChildren={children}
        key={current.uuid}
        obsHolder={obsHolder}
        updateObs={updateObs}
        validationResults={validationResults}
      >
        {current}
      </FormElementGroup>
    </Fragment>
  );
};

export default withRouter(withParams(Form));
