import React from "react";
import { Auth } from "aws-amplify";
import { connect } from "react-redux";
import { userLogout } from "react-admin";
import MenuItem from "@material-ui/core/MenuItem";
import ExitIcon from "@material-ui/icons/PowerSettingsNew";
import UserIcon from "@material-ui/icons/AccountCircle";

const styles = {
  userIcon: {
    display: "flex",
    alignItems: "center",
    marginLeft: 13,
    marginRight: 8
  }
};

const LogoutButton = ({ logout, username, ...rest }) => {
  return (
    <div>
      <span style={styles.userIcon}>
        <UserIcon color={"primary"} />
        {username}
      </span>
      <MenuItem onClick={logout} {...rest}>
        <ExitIcon /> Logout
      </MenuItem>
    </div>
  );
};

const mapStateToProps = state => ({
  username: state.app.user.username
});
const mapDispatchToProps = dispatch => ({
  logout: () =>
    userLogout() && Auth.signOut().then(() => (document.location.href = "/"))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LogoutButton);
