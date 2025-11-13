import {
  StyledLayout,
  AdminNotification,
} from "../common/components/AdminLayout";
import AdminAppBar from "../common/components/AdminAppBar";
import { AppDesignerMenu } from "./AppDesignerMenu";

const AppDesignerLayout = ({ children, ...props }) => (
  <StyledLayout
    {...props}
    appBar={AdminAppBar}
    notification={AdminNotification}
    menu={AppDesignerMenu}
  >
    {children}
  </StyledLayout>
);

export default AppDesignerLayout;
