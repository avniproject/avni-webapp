import { isEmpty, map, sortBy, trim } from "lodash";
import { styled } from "@mui/material/styles";
import { FormControl, InputLabel, Select, MenuItem, Button } from "@mui/material";

import CurrentUserService from "../service/CurrentUserService";

const StyledContainer = styled("div")({
  display: "flex",
  flexDirection: "row",
  alignItems: "center"
});

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  margin: theme.spacing(1),
  minWidth: 200,
  color: "white"
}));

const StyledInputLabel = styled(InputLabel)({
  color: "white"
});

const StyledSelect = styled(Select)({
  color: "white",
  "& .MuiSelect-icon": {
    color: "white"
  }
});

const StyledButton = styled(Button)({
  color: "white"
});

export const OrganisationOptions = ({ getUserInfo, history, organisations, userInfo }) => {
  const options = [
    { name: "", value: "" },
    ...map(sortBy(organisations, organisation => trim(organisation.name).toLowerCase()), ({ name, uuid }) => ({
      name,
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

  const exitToAdmin = () => {
    CurrentUserService.exitOrganisation();
    getUserInfo();
    history.push("/#/admin");
    window.location.reload(true);
  };

  return !isEmpty(organisations) && CurrentUserService.isAdminUsingAnOrg(userInfo) ? (
    <StyledContainer>
      <StyledFormControl>
        <StyledInputLabel id="organisation-select-label">Select Organisation</StyledInputLabel>
        <StyledSelect
          labelId="organisation-select"
          id="organisation-select"
          value={localStorage.getItem("ORGANISATION_UUID") || ""}
          onChange={handleChange}
        >
          {options.map((option, index) => (
            <MenuItem key={index} value={option.value}>
              {option.name}
            </MenuItem>
          ))}
        </StyledSelect>
      </StyledFormControl>
      <StyledButton onClick={exitToAdmin}>Exit Organisation</StyledButton>
    </StyledContainer>
  ) : null;
};
