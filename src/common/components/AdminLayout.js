import React from "react";
import { Layout } from "react-admin";
import AdminAppBar from "./AdminAppBar";

const AdminLayout = props => <Layout {...props} appBar={AdminAppBar} />;

export default AdminLayout;
