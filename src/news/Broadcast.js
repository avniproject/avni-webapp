import React, { useEffect } from "react";
import AppBar from "../common/components/AppBar";
import { HomePageCard } from "../rootApp/views/HomePageCard";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import Grid from "@material-ui/core/Grid";
import { Route, withRouter } from "react-router-dom";
import News from "./News";
import WhatsAppHome from "./whatsapp/WhatsAppHome";
import WhatsAppContactGroup from "./whatsapp/WhatsAppContactGroup";
import { WithProps } from "../common/components/utils";
import { getHref, getRoutePath } from "../common/utils/routeUtil";
import BroadcastPath from "./utils/BroadcastPath";
import { connect, useDispatch } from "react-redux";
import { getOrganisationConfig } from "./reducers/metadataReducer";
import NewsDetails from "./NewsDetails";
import { Privilege } from "openchs-models";
import UserInfo from "../common/model/UserInfo";

const BroadcastPage = function({ path, organisationConfig, userInfo }) {
  const showMessaging = UserInfo.hasPrivilege(userInfo, Privilege.PrivilegeType.Messaging);
  return (
    <React.Fragment>
      <AppBar title={"Broadcast"} position={"sticky"} />
      <Grid container justifyContent="center">
        <HomePageCard
          href={getHref(BroadcastPath.News, path)}
          name={"News Broadcasts"}
          customIcon={"speaker"}
        />
        {organisationConfig &&
          organisationConfig.organisationConfig.enableMessaging &&
          showMessaging && (
            <HomePageCard
              href={getHref(BroadcastPath.WhatsApp, path)}
              name="WhatsApp"
              customIconComponent={<WhatsAppIcon color="primary" style={{ fontSize: 100 }} />}
            />
          )}
      </Grid>
    </React.Fragment>
  );
};

const Broadcast = ({ match: { path }, organisationConfig, userInfo }) => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getOrganisationConfig());
  }, []);
  return (
    <React.Fragment>
      <Route
        exact
        path={path}
        component={WithProps({ path: path, organisationConfig, userInfo }, BroadcastPage)}
      />
      <Route exact path={getRoutePath(path, BroadcastPath.News)} component={News} />
      <Route exact path={`${path}/news/:id/details`} component={NewsDetails} />
      <Route
        exact
        path={getRoutePath(path, `${BroadcastPath.WhatsApp}/:activeTab?`)}
        component={WhatsAppHome}
      />
      <Route
        exact
        path={getRoutePath(
          path,
          `${BroadcastPath.WhatsApp}/${BroadcastPath.ContactGroup}/:contactGroupId`
        )}
        component={WhatsAppContactGroup}
      />
      <Route
        exact
        path={getRoutePath(path, `${BroadcastPath.WhatsApp}/:activeTab/:receiverId/messages`)}
        component={WhatsAppHome}
      />
    </React.Fragment>
  );
};

const mapStateToProps = state => ({
  organisationConfig: state.broadcast.organisationConfig,
  userInfo: state.app.userInfo
});

export default withRouter(connect(mapStateToProps)(Broadcast));
