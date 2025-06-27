import React from "react";
import { Layout, Notification } from "react-admin";
import AdminAppBar from "./AdminAppBar";
import { Portal } from "@material-ui/core";

// Simple notification component with Portal for highest z-index
const AdminNotification = props => (
  <Portal>
    <div
      style={{
        marginBottom: "60px",
        zIndex: 9999
      }}
    >
      <Notification {...props} autoHideDuration={5000} style={{ marginBottom: "60px" }} />
    </div>
  </Portal>
);

const AdminLayout = props => <Layout {...props} appBar={AdminAppBar} notification={AdminNotification} />;

export default AdminLayout;
