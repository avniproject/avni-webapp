import React from "react";
import { isNaN } from "lodash";
import { withParams } from "../../common/components/utils";
import { FormElementGroup } from "./FormElementGroup";
import Paginator from "./Paginator";
import { withRouter, Redirect } from "react-router-dom";
import ScreenWithAppBar from "../../common/components/ScreenWithAppBar";

const Form = ({ form, obs, updateObs, location, title, match, saved, onSaveGoto, onSave }) => {
  const page = +match.queryParams.page;
  const from = match.queryParams.from;

  const firstPageNumber = form.firstFormElementGroup.displayOrder;
  const currentPageNumber = isNaN(page) ? firstPageNumber : page;
  const lastPageNumber = form.getLastFormElementElementGroup().displayOrder;

  const pageDetails = {
    nextPageNumber:
      currentPageNumber === lastPageNumber
        ? null
        : form.getNextFormElement(currentPageNumber).displayOrder,
    previousPageNumber:
      currentPageNumber === firstPageNumber
        ? null
        : form.getPrevFormElement(currentPageNumber).displayOrder,
    location,
    from
  };

  const current = form.formElementGroupAt(currentPageNumber);
  return (
    <ScreenWithAppBar appbarTitle={title}>
      <div>
        <FormElementGroup key={current.uuid} obs={obs} updateObs={updateObs}>
          {current}
        </FormElementGroup>
        {saved && <Redirect to={onSaveGoto} />}
        <Paginator pageDetails={pageDetails} onSave={onSave} />
        <div />
      </div>
    </ScreenWithAppBar>
  );
};

export default withRouter(withParams(Form));
