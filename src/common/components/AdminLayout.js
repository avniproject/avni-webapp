import { Layout, Notification } from "react-admin";
import AdminAppBar from "./AdminAppBar";

const AdminNotification = props => <Notification {...props} autoHideDuration={5000} style={{ marginBottom: "40px" }} />;
const AdminLayout = props => <Layout {...props} appBar={AdminAppBar} notification={AdminNotification} />;

export default AdminLayout;
