import React, { Fragment } from "react";
import { withParams } from "../../common/components/utils";
import { FormElementGroup } from "./FormElementGroup";

import { withRouter } from "react-router-dom";

const Form = ({ current, obsHolder, updateObs }) => {
  return (
    <Fragment>
      <FormElementGroup key={current.uuid} obsHolder={obsHolder} updateObs={updateObs}>
        {current}
      </FormElementGroup>
    </Fragment>
  );
};

export default withRouter(withParams(Form));
