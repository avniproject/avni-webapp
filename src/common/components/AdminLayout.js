import React from "react";
import { Layout } from "react-admin";
import AdminAppBar from "./AdminAppBar";
import { Notification } from "react-admin";

const AdminNotification = props => (
  <Notification {...props} autoHideDuration={5000} style={{ marginBottom: "40px" }} />
);
const AdminLayout = props => (
  <Layout {...props} appBar={AdminAppBar} notification={AdminNotification} />
);

export default AdminLayout;
