import { Fragment, useEffect } from "react";
import AppBar from "../common/components/AppBar";
import { HomePageCard } from "../rootApp/views/HomePageCard";
import { WhatsApp } from "@mui/icons-material";
import { Grid } from "@mui/material";
import { Routes, Route, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import News from "./News";
import WhatsAppHome from "./whatsapp/WhatsAppHome";
import WhatsAppContactGroup from "./whatsapp/WhatsAppContactGroup";
import { getHref, getRoutePath } from "../common/utils/routeUtil";
import BroadcastPath from "./utils/BroadcastPath";
import { getOrganisationConfig } from "./reducers/metadataReducer";
import NewsDetails from "./NewsDetails";
import { Privilege } from "openchs-models";
import UserInfo from "../common/model/UserInfo";

const BroadcastPage = function({ path, organisationConfig, userInfo }) {
  const showMessaging = UserInfo.hasPrivilege(userInfo, Privilege.PrivilegeType.Messaging);
  return (
    <Fragment>
      <AppBar title={"Broadcast"} position={"sticky"} />
      <Grid
        container
        sx={{
          justifyContent: "center"
        }}
      >
        <HomePageCard href={getHref(BroadcastPath.News, path)} name={"News Broadcasts"} customIcon={"speaker"} />
        {organisationConfig && organisationConfig.organisationConfig.enableMessaging && showMessaging && (
          <HomePageCard
            href={getHref(BroadcastPath.WhatsApp, path)}
            name="WhatsApp"
            customIconComponent={<WhatsApp color="primary" style={{ fontSize: 100 }} />}
          />
        )}
      </Grid>
    </Fragment>
  );
};

const Broadcast = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const organisationConfig = useSelector(state => state.broadcast.organisationConfig);
  const userInfo = useSelector(state => state.app.userInfo);

  const path = location.pathname;

  useEffect(() => {
    dispatch(getOrganisationConfig());
  }, [dispatch]);

  return (
    <Routes>
      <Route index element={<BroadcastPage path={path} organisationConfig={organisationConfig} userInfo={userInfo} />} />
      <Route path={BroadcastPath.News} element={<News />} />
      <Route path="news/:id/details" element={<NewsDetails />} />
      <Route path={`${BroadcastPath.WhatsApp}/:activeTab?`} element={<WhatsAppHome />} />
      <Route path={`${BroadcastPath.WhatsApp}/${BroadcastPath.ContactGroup}/:contactGroupId`} element={<WhatsAppContactGroup />} />
      <Route path={`${BroadcastPath.WhatsApp}/:activeTab/:receiverId/messages`} element={<WhatsAppHome />} />
    </Routes>
  );
};

export default Broadcast;
