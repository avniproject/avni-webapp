import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Divider from "@material-ui/core/Divider";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import PersonAddIcon from "@material-ui/icons/PersonAdd";
import { InternalLink } from "../../../common/components/utils";
import { useTranslation } from "react-i18next";

const useStyle = makeStyles(theme => ({
  container: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    padding: "20px",
    // backgroundColor: "#36349e",
    color: "blue",
    borderRadius: "3px"
  },
  nested: {
    paddingLeft: theme.spacing(4)
  },
  dividerColor: {
    backgroundColor: "grey"
  },
  FormControlRadio: {
    marginTop: "20px"
  },
  FormLabel: {
    color: "grey",
    marginLeft: "15px"
  }
}));

function NewMenu({ operationalModules }) {
  const classes = useStyle();
  const { t } = useTranslation();

  const [value, setValue] = React.useState("female");

  const [anchorEl, setAnchorEl] = React.useState(null);
  const handleClose = () => setAnchorEl(null);

  const handleChange = event => {
    setValue(event.target.value);
    handleClose();
  };

  // const setAnchorEl = React.useState(null);

  const handleClickRoute = () => event => {
    setAnchorEl(event.currentTarget);
  };

  // const handleCloseRoute = () => setAnchorEl(null);

  return (
    <div className={classes.container}>
      <List component="nav" aria-labelledby="nested-list-subheader" className={classes.root}>
        <label className={classes.FormLabel}>{t("register")}</label>
        {operationalModules.subjectTypes.map((element, index) => {
          return (
            <React.Fragment>
              <InternalLink
                key={index}
                to={`/app/register?type=${element.name}`}
                onClick={handleClickRoute(element)}
                style={{ color: "blue" }}
              >
                <ListItem button>
                  <ListItemIcon>
                    <PersonAddIcon style={{ color: "blue" }} />
                  </ListItemIcon>
                  <ListItemText primary={t(element.name)} />
                  <ChevronRightIcon />
                </ListItem>
              </InternalLink>
              <Divider className={classes.dividerColor} />
            </React.Fragment>
          );
        })}
      </List>
      <FormControl className={classes.FormControlRadio} component="fieldset">
        {/* <label className={classes.FormLabel}>Register and Enrollment For</label> */}
        {operationalModules.programs.map((element, index) => {
          return (
            <React.Fragment>
              <RadioGroup
                key={index}
                aria-label="position"
                name="position"
                value={value}
                onChange={handleChange}
                row
              >
                <FormControlLabel
                  value="end"
                  control={<Radio color="primary" />}
                  label={t(element.operationalProgramName)}
                  labelPlacement="end"
                />
              </RadioGroup>
              <Divider className={classes.dividerColor} />
            </React.Fragment>
          );
        })}
      </FormControl>
    </div>
  );
}

const mapStateToProps = state => {
  return {
    operationalModules: state.dataEntry.metadata.operationalModules
  };
};

export default withRouter(connect(mapStateToProps)(NewMenu));
