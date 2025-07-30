import { Layout, Notification } from "react-admin";
import { Portal } from "@mui/material";
import { styled } from "@mui/material/styles";
import AdminAppBar from "./AdminAppBar";

// Simple notification component with Portal for highest z-index
const AdminNotification = props => (
  <Portal>
    <div
      style={{
        marginBottom: "60px",
        zIndex: 9999
      }}
    >
      <Notification
        {...props}
        autoHideDuration={5000}
        style={{ marginBottom: "60px" }}
      />
    </div>
  </Portal>
);

// Styled Layout component to override React Admin's default spacing
const StyledLayout = styled(Layout)(({ theme }) => ({
  "& .RaLayout-appFrame": {
    marginTop: theme.spacing(8), // Increased for better spacing with AppBar
    [theme.breakpoints.down("sm")]: {
      marginTop: theme.spacing(7) // Mobile spacing
    }
  },
  "& .RaLayout-content": {
    paddingTop: theme.spacing(2), // More padding for content area
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1)
  },
  // Ensure proper spacing for the main content area
  "& .RaLayout-contentWithSidebar": {
    minHeight: `calc(100vh - ${theme.spacing(8)})`, // Account for AppBar height
    [theme.breakpoints.down("sm")]: {
      minHeight: `calc(100vh - ${theme.spacing(7)})`
    }
  }
}));

const AdminLayout = props => (
  <StyledLayout
    {...props}
    appBar={AdminAppBar}
    notification={AdminNotification}
  />
);

export default AdminLayout;
