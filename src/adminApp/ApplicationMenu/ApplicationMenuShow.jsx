import { useEffect, useState } from "react";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate, useParams } from "react-router-dom";
import Box from "@mui/material/Box";
import { Title } from "react-admin";
import Button from "@mui/material/Button";
import { Grid } from "@mui/material";
import * as _ from "lodash";
import { useSelector } from "react-redux";
import { SystemInfo } from "../../formDesigner/components/SystemInfo";
import RuleDisplay from "../components/RuleDisplay";
import ApplicationMenuService from "../service/ApplicationMenuService";
import { ShowLabelValue } from "../../formDesigner/common/ShowLabelValue";
import UserInfo from "../../common/model/UserInfo";
import { Privilege } from "openchs-models";

const ApplicationMenuShow = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const userInfo = useSelector(state => state.app.userInfo);

  const [menuItem, setApplicationMenu] = useState(null);

  useEffect(() => {
    ApplicationMenuService.getMenuItem(id).then(menuItem =>
      setApplicationMenu(menuItem)
    );
  }, [id]);

  const handleEdit = () => {
    navigate(`/appDesigner/applicationMenu/${id}`);
  };

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
          {UserInfo.hasPrivilege(
            userInfo,
            Privilege.PrivilegeType.EditApplicationMenu
          ) && (
            <Grid container={12} style={{ justifyContent: "flex-end" }}>
              <Button color="primary" type="button" onClick={handleEdit}>
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
                <RuleDisplay
                  fieldLabel={"Link Function"}
                  ruleText={menuItem.linkFunction}
                />
                <p />
              </>
            )}
            <SystemInfo {...menuItem} />
          </div>
        </Box>
      </>
    )
  );
};

export default ApplicationMenuShow;
