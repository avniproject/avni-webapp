import React from "react";
import { AvniTextField } from "../../common/components/AvniTextField";
import PropTypes from "prop-types";
import _ from "lodash";
import { AvniSelect } from "../../common/components/AvniSelect";
import { MenuItem } from "openchs-models";
import { AvniFormLabel } from "../../common/components/AvniFormLabel";
import { sampleLinkFunction } from "../../formDesigner/common/SampleRule";
import ApplicationMenuReducer from "../Reducers/ApplicationMenuReducer";
import { MenuItem as MaterialMenuItem } from "@mui/material";
import { JSEditor } from "../../common/components/JSEditor";

const ApplicationMenuEditFields = props => {
  const { menuItem, dispatch } = props;
  const allGroups = MenuItem.getAllGroups();
  return (
    <>
      <AvniTextField
        id="displayKey"
        label="Display Key *"
        autoComplete="off"
        value={menuItem.displayKey}
        onChange={event =>
          dispatch({
            type: ApplicationMenuReducer.MENU_ITEM,
            payload: { displayKey: event.target.value }
          })
        }
        toolTipKey={"APP_DESIGNER_MENU_ITEM_DISPLAY_KEY"}
      />
      <br />
      <AvniTextField
        id="icon"
        label="Icon name"
        autoComplete="off"
        value={menuItem.icon}
        onChange={event =>
          dispatch({
            type: ApplicationMenuReducer.MENU_ITEM,
            payload: { icon: event.target.value }
          })
        }
        toolTipKey={"APP_DESIGNER_MENU_ITEM_ICON"}
      />
      <br />
      <AvniSelect
        label="Select Type *"
        value={_.isEmpty(menuItem.type) ? "" : menuItem.type}
        onChange={event =>
          dispatch({
            type: ApplicationMenuReducer.MENU_ITEM,
            payload: { type: event.target.value }
          })
        }
        style={{ width: "200px" }}
        required
        options={MenuItem.getAllTypes().map((type, index) => (
          <MaterialMenuItem value={type} key={index}>
            {type}
          </MaterialMenuItem>
        ))}
        toolTipKey={"APP_DESIGNER_MENU_ITEM_TYPE"}
      />
      <br />
      <AvniSelect
        label="Select Group *"
        value={_.isEmpty(menuItem.group) ? "" : menuItem.group}
        onChange={event =>
          dispatch({
            type: ApplicationMenuReducer.MENU_ITEM,
            payload: { group: event.target.value }
          })
        }
        style={{ width: "200px" }}
        required
        options={allGroups.map((group, index) => (
          <MaterialMenuItem value={group} key={index}>
            {group}
          </MaterialMenuItem>
        ))}
        toolTipKey={"APP_DESIGNER_MENU_ITEM_GROUP"}
      />
      <br />
      <AvniFormLabel label={"Link Function"} toolTipKey={"APP_DESIGNER_MENU_ITEM_LINK_FUNCTION"} />
      <JSEditor
        value={menuItem.linkFunction || sampleLinkFunction()}
        onValueChange={event =>
          dispatch({
            type: ApplicationMenuReducer.MENU_ITEM,
            payload: { linkFunction: event }
          })
        }
      />
    </>
  );
};

ApplicationMenuEditFields.propTypes = {
  menuItem: PropTypes.object.isRequired
};

export default ApplicationMenuEditFields;
