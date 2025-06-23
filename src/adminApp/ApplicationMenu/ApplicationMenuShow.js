import React, { useEffect, useState } from "react";
import EditIcon from "@mui/icons-material/Edit";
import { Redirect } from "react-router-dom";
import Box from "@mui/material/Box";
import { Title } from "react-admin";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import _ from "lodash";
import { SystemInfo } from "../../formDesigner/components/SystemInfo";
import RuleDisplay from "../components/RuleDisplay";
import ApplicationMenuService from "../service/ApplicationMenuService";
import { ShowLabelValue } from "../../formDesigner/common/ShowLabelValue";
import { connect } from "react-redux";
import UserInfo from "../../common/model/UserInfo";
import { Privilege } from "openchs-models";

const ApplicationMenuShow = props => {
  const [menuItem, setApplicationMenu] = useState(null);
  const [editAlert, setEditAlert] = useState(false);

  useEffect(() => {
    ApplicationMenuService.getMenuItem(props.match.params.id).then(menuItem => setApplicationMenu(menuItem));
  }, []);

  return (
    !_.isNil(menuItem) && (
      <>
        <Box
          sx={{
            boxShadow: 2,
            p: 3,
            bgcolor: "background.paper"
          }}
        >
          <Title title={"Application menu: " + menuItem.displayKey} />
          {UserInfo.hasPrivilege(props.userInfo, Privilege.PrivilegeType.EditApplicationMenu) && (
            <Grid container item={12} style={{ justifyContent: "flex-end" }}>
              <Button color="primary" type="button" onClick={() => setEditAlert(true)}>
                <EditIcon />
                Edit
              </Button>
            </Grid>
          )}
          <div className="container" style={{ float: "left" }}>
            <ShowLabelValue value={menuItem.displayKey} label="Display Key" />
            <p />
            <ShowLabelValue value={menuItem.icon} label="Icon Name" />
            <p />
            <ShowLabelValue value={menuItem.type} label="Type" />
            <p />
            <ShowLabelValue value={menuItem.group} label="Group" />
            <p />
            {menuItem.isLinkType() && (
              <>
                <RuleDisplay fieldLabel={"Link Function"} ruleText={menuItem.linkFunction} />
                <p />
              </>
            )}
            <SystemInfo {...menuItem} />
          </div>
          {editAlert && <Redirect to={"/appDesigner/applicationMenu/" + props.match.params.id} />}
        </Box>
      </>
    )
  );
};

const mapStateToProps = state => ({
  userInfo: state.app.userInfo
});

export default connect(mapStateToProps)(ApplicationMenuShow);
