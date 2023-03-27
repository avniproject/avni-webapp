import React from "react";
import { connect } from "react-redux";
import MenuItem from "@material-ui/core/MenuItem";
import ExitIcon from "@material-ui/icons/PowerSettingsNew";
import UserIcon from "@material-ui/icons/AccountCircle";
import { logout } from "../../rootApp/ducks";

const styles = {
  userIcon: {
    display: "flex",
    alignItems: "center",
    marginLeft: 13,
    marginRight: 8
  }
};

const LogoutButton = ({ doLogout, username }) => {
  return (
    <div>
      <span style={styles.userIcon}>
        <UserIcon color={"primary"} />
        {username}
      </span>
      <MenuItem onClick={doLogout}>
        <ExitIcon /> Logout
      </MenuItem>
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
