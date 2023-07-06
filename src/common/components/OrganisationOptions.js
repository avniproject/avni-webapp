import { isEmpty, map, sortBy, trim } from "lodash";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Button from "@material-ui/core/Button";
import React from "react";
import { makeStyles } from "@material-ui/core";
import CurrentUserService from "../service/CurrentUserService";

const useStyles = makeStyles(theme => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 200,
    color: "white"
  },
  whiteColor: {
    color: "white"
  }
}));

export const OrganisationOptions = ({ getUserInfo, history, organisations, userInfo }) => {
  const classes = useStyles();

  const options = [
    { name: "", value: "" },
    ...map(
      sortBy(organisations, organisation => trim(organisation.name).toLowerCase()),
      ({ name, uuid }) => ({
        name: name,
        value: uuid
      })
    )
  ];

  const handleChange = event => {
    if (event.target.value !== "") {
      localStorage.setItem("ORGANISATION_UUID", event.target.value);
      history.push("/home");
      getUserInfo();
    } else {
      localStorage.setItem("ORGANISATION_UUID", "");
    }
  };

  const exitToAdmin = function() {
    CurrentUserService.exitOrganisation();
    getUserInfo();
    history.push("/#/admin");
    window.location.reload(true);
  };

  return (
    !isEmpty(organisations) &&
    CurrentUserService.isAdminUsingAnOrg(userInfo) && (
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
        <FormControl className={classes.formControl}>
          <InputLabel id="organisation-select-label" style={{ color: "white" }}>
            Select Organisation
          </InputLabel>
          <Select
            labelid="organisation-select"
            id="organisation-select"
            value={localStorage.getItem("ORGANISATION_UUID") || ""}
            onChange={handleChange}
            classes={{
              root: classes.whiteColor,
              icon: classes.whiteColor
            }}
          >
            {options.map((option, index) => (
              <MenuItem key={index} value={option.value}>
                {option.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button onClick={() => exitToAdmin()} style={{ color: "white" }}>
          Exit To Admin
        </Button>
      </div>
    )
  );
};
