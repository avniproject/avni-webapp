import { MenuItem } from "@mui/material";
import { Logout, Person, Lock } from "@mui/icons-material";
import { useDispatch } from "react-redux";
import _ from "lodash";
import { format, isValid } from "date-fns";
import ApplicationContext from "../../ApplicationContext";
import { httpClient } from "../../common/utils/httpClient";
import { logout } from "../../rootApp/ducks";

const styles = {
  userIcon: {
    display: "flex",
    alignItems: "center",
    marginLeft: 13,
    marginRight: 8
  },
  lastLoginDate: {
    display: "flex",
    alignItems: "center",
    marginLeft: 13,
    marginRight: 8
  }
};

const LogoutButton = ({
  username,
  onChangePassword = _.noop,
  lastSessionTimeMillis
}) => {
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <>
      <MenuItem>
        <Person color="primary" style={styles.userIcon} />
        {username}
      </MenuItem>
      <MenuItem onClick={onChangePassword}>
        <Lock style={styles.userIcon} />
        Change Password
      </MenuItem>
      <MenuItem onClick={handleLogout}>
        <Logout style={styles.userIcon} />
        Logout
      </MenuItem>
      {lastSessionTimeMillis > 0 && (
        <MenuItem disabled>
          <span style={styles.lastLoginDate}>
            Last login:{" "}
            {isValid(new Date(lastSessionTimeMillis))
              ? format(new Date(lastSessionTimeMillis), "MMM d yyyy h:mm:ss a")
              : "-"}
          </span>
        </MenuItem>
      )}
      {ApplicationContext.isDevEnv() && (
        <MenuItem
          onClick={() => navigator.clipboard.writeText(httpClient.getIdToken())}
        >
          <Lock style={styles.userIcon} />
          Copy Token
        </MenuItem>
      )}
    </>
  );
};

export default LogoutButton;
