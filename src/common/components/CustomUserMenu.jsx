import { UserMenu } from "react-admin";
import LogoutButton from "../../adminApp/react-admin-config/LogoutButton";

const CustomUserMenu = ({ username, lastSessionTimeMillis }) => (
  <UserMenu>
    <LogoutButton
      username={username}
      onChangePassword={() => {}}
      lastSessionTimeMillis={lastSessionTimeMillis}
    />
  </UserMenu>
);

export default CustomUserMenu;
