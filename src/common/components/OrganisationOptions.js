import { intersection, isEmpty, map } from "lodash";
import { ROLES } from "../constants";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Button from "@material-ui/core/Button";
import React from "react";
import http from "common/utils/httpClient";

export const OrganisationOptions = ({
  getUserInfo,
  user,
  organisation,
  styles,
  history,
  organisations,
  ...props
}) => {
  const options = [
    { name: "", value: "" },
    ...map(organisations, ({ name, uuid }) => ({
      name: name,
      value: uuid
    }))
  ];

  const handleChange = event => {
    if (event.target.value !== "") {
      http.setOrganisationUUID(event.target.value);
      history.push("/home");
      getUserInfo();
    } else {
      http.setOrganisationUUID("");
    }
  };

  const resetOrgUUID = () => {
    http.setOrganisationUUID("");
    getUserInfo();
    history.push("/#/admin/account");
  };

  return (
    !isEmpty(organisations) && (
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
        {!isEmpty(intersection(user.roles, [ROLES.ADMIN])) && (
          <FormControl className={styles.formControl}>
            <InputLabel id="organisation-select-label" className={styles.whiteColor}>
              Select Organisation
            </InputLabel>
            <Select
              labelid="organisation-select"
              id="organisation-select"
              value={organisation}
              onChange={handleChange}
              classes={{
                root: styles.whiteColor,
                icon: styles.whiteColor
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
        {!isEmpty(intersection(user.roles, [ROLES.ADMIN])) && !isEmpty(http.getOrgId()) && (
          <Button onClick={() => resetOrgUUID()}>Back To Admin</Button>
        )}
      </div>
    )
  );
};
