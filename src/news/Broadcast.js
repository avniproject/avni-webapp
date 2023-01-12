import React from "react";
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

const BroadcastPage = function({ path }) {
  return (
    <React.Fragment>
      <AppBar title={"Broadcast"} position={"sticky"} />
      <Grid container justify="center">
        <HomePageCard
          href={getHref(BroadcastPath.News, path)}
          name={"News Broadcasts"}
          customIcon={"speaker"}
        />
        <HomePageCard
          href={getHref(BroadcastPath.WhatsApp, path)}
          name="WhatsApp"
          customIconComponent={<WhatsAppIcon color="primary" style={{ fontSize: 100 }} />}
        />
      </Grid>
    </React.Fragment>
  );
};

const Broadcast = ({ match: { path } }) => {
  return (
    <React.Fragment>
      <Route exact path={path} component={WithProps({ path: path }, BroadcastPage)} />
      <Route exact path={getRoutePath(path, BroadcastPath.News)} component={News} />
      <Route exact path={getRoutePath(path, BroadcastPath.WhatsApp)} component={WhatsAppHome} />
      <Route
        exact
        path={getRoutePath(
          path,
          `${BroadcastPath.WhatsApp}/${BroadcastPath.ContactGroup}/:contactGroupId`
        )}
        component={WhatsAppContactGroup}
      />
    </React.Fragment>
  );
};

export default withRouter(Broadcast);
