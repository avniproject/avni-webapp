import React from "react";
import { AvniTextField } from "../../common/components/AvniTextField";
import PropTypes from "prop-types";

const ApplicationMenuEditFields = props => {
  const { menuItem, dispatch } = props;
  console.log("ApplicationMenuEditFields", JSON.stringify(props));
  return (
    <>
      <AvniTextField
        id="displayKey"
        label="Display Key"
        autoComplete="off"
        value={menuItem.displayKey}
        onChange={event => dispatch({ type: "name", payload: event.target.value })}
        toolTipKey={"APP_DESIGNER_MENU_ITEM_DISPLAY_KEY"}
      />
    </>
  );
};

ApplicationMenuEditFields.propTypes = {
  menuItem: PropTypes.object.isRequired
};

export default ApplicationMenuEditFields;
