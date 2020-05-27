import { intersection, isEmpty, map } from "lodash";
import { ROLES } from "../constants";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Button from "@material-ui/core/Button";
import React from "react";
import http from "common/utils/httpClient";
import { makeStyles } from "@material-ui/core";

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

export const OrganisationOptions = ({
  getUserInfo,
  user,
  organisation,
  styles,
  history,
  organisations,
  ...props
}) => {
  const classes = useStyles();

  const options = [
    { name: "", value: "" },
    ...map(organisations, ({ name, uuid }) => ({
      name: name,
      value: uuid
    }))
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

  const resetOrgUUID = () => {
    localStorage.setItem("ORGANISATION_UUID", "");
    getUserInfo();
    history.push("/#/admin/account");
  };

  return (
    !isEmpty(organisations) && (
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
        {!isEmpty(intersection(user.roles, [ROLES.ADMIN])) && (
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
        )}
        {!isEmpty(intersection(user.roles, [ROLES.ADMIN])) && !isEmpty(http.getOrgUUID()) && (
          <Button onClick={() => resetOrgUUID()} style={{ color: "white" }}>
            Back To Admin
          </Button>
        )}
      </div>
    )
  );
};
