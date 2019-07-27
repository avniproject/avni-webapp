import { connect } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import { setRegistrationSubjectType } from "../../reducers/subjectReducer";
import { AddIcon, InternalLink } from "../../../common/components";
import React from "react";
import Menu from "@material-ui/core/Menu";
import { withRouter } from "react-router-dom";
import MenuItem from "@material-ui/core/MenuItem";
import Button from "@material-ui/core/Button";

const useStyle = makeStyles(theme => ({
  createButton: {
    margin: theme.spacing(1)
  }
}));

const RegistrationMenu = ({ types, setRegistrationSubjectType }) => {
  const classes = useStyle();

  const [anchorEl, setAnchorEl] = React.useState(null);
  const handleClick = type => event => {
    setAnchorEl(event.currentTarget);
    type && setRegistrationSubjectType(type);
  };

  const handleClose = () => setAnchorEl(null);

  return (
    <div>
      <Button
        size="medium"
        className={classes.createButton}
        color={"primary"}
        onClick={handleClick()}
      >
        <AddIcon /> Create
      </Button>
      <Menu
        id="create-menu"
        anchorEl={anchorEl}
        keepMounted
        open={!!anchorEl}
        onClose={handleClose}
      >
        {types.map((type, key) => (
          <InternalLink
            key={key}
            to={"/app/register"}
            onClick={handleClick(type)}
          >
            <MenuItem>
              {" "}
              <AddIcon /> {type.name}{" "}
            </MenuItem>
          </InternalLink>
        ))}
      </Menu>
    </div>
  );
};

const mapStateToProps = state => ({
  types: state.dataEntry.metadata.operationalModules.subjectTypes
});

const mapDispatchToProps = {
  setRegistrationSubjectType
};

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(RegistrationMenu)
);
