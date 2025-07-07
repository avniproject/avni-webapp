import { connect } from "react-redux";
import { MenuItem } from "@mui/material";
import { Logout, Person, Lock } from "@mui/icons-material";
import { logout } from "../../rootApp/ducks";
import _ from "lodash";
import moment from "moment";
import ApplicationContext from "../../ApplicationContext";
import { httpClient } from "../../common/utils/httpClient";

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

const LogoutButton = ({ doLogout, username, onChangePassword = _.noop, lastSessionTimeMillis }) => {
  return (
    <div>
      <span style={styles.userIcon}>
        <Person color={"primary"} /> {username}
      </span>
      <MenuItem onClick={onChangePassword}>Change Password</MenuItem>
      <MenuItem onClick={doLogout}>
        <Logout /> Logout
      </MenuItem>
      {lastSessionTimeMillis > 0 && (
        <span style={styles.lastLoginDate}>Last login: {moment(lastSessionTimeMillis).format("MMM Do YYYY h:mm:ss a")}</span>
      )}
      {ApplicationContext.isDevEnv() && (
        <MenuItem
          onClick={() => {
            navigator.clipboard.writeText(httpClient.getIdToken());
          }}
        >
          <Lock /> Copy Token
        </MenuItem>
      )}
    </div>
  );
};

const mapStateToProps = state => ({
  username: state.app.authSession.username
});
const mapDispatchToProps = dispatch => ({
  doLogout: () => dispatch(logout())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LogoutButton);
