import React, { Fragment } from "react";
import { withParams } from "../../common/components/utils";
import { FormElementGroup } from "./FormElementGroup";

import { withRouter } from "react-router-dom";

const Form = ({
  current,
  obsHolder,
  updateObs,
  children,
  validationResults,
  filteredFormElements,
  entity,
  renderParent
}) => {
  return (
    <Fragment>
      <FormElementGroup
        parentChildren={children}
        key={current.uuid}
        obsHolder={obsHolder}
        updateObs={updateObs}
        validationResults={validationResults}
        filteredFormElements={filteredFormElements}
        entity={entity}
        renderParent={renderParent}
      >
        {current}
      </FormElementGroup>
    </Fragment>
  );
};

export default withRouter(withParams(Form));
