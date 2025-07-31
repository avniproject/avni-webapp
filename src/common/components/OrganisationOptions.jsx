import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { isEmpty, map, sortBy, trim } from "lodash";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button
} from "@mui/material";
import CurrentUserService from "../service/CurrentUserService.ts";

const OrganisationOptions = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userInfo = useSelector(state => state.app.userInfo);
  const organisations = useSelector(state => state.app.organisations || []);

  const options = [
    { name: "", value: "" },
    ...map(
      sortBy(organisations, organisation =>
        trim(organisation.name).toLowerCase()
      ),
      ({ name, uuid }) => ({ name, value: uuid })
    )
  ];

  const handleChange = event => {
    if (event.target.value !== "") {
      localStorage.setItem("ORGANISATION_UUID", event.target.value);
      navigate("/home");
      dispatch({ type: "GET_USER_INFO" });
    } else {
      localStorage.setItem("ORGANISATION_UUID", "");
    }
  };

  const exitToAdmin = () => {
    CurrentUserService.exitOrganisation();
    dispatch({ type: "GET_USER_INFO" });
    navigate("/admin");
    window.location.reload();
  };

  return !isEmpty(organisations) &&
    CurrentUserService.isAdminUsingAnOrg(userInfo) ? (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      <FormControl size="small" sx={{ minWidth: 200 }}>
        <InputLabel id="organisation-select-label" sx={{ color: "white" }}>
          Select Organisation
        </InputLabel>
        <Select
          labelId="organisation-select"
          id="organisation-select"
          value={localStorage.getItem("ORGANISATION_UUID") || ""}
          onChange={handleChange}
          size="small"
          sx={{
            color: "white",
            "& .MuiSelect-icon": { color: "white" },
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "rgba(255, 255, 255, 0.5)"
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "white"
            }
          }}
        >
          {options.map((option, index) => (
            <MenuItem key={index} value={option.value}>
              {option.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Button
        variant="text"
        sx={{
          color: "white",
          fontSize: "0.875rem",
          textTransform: "none",
          padding: "4px 8px",
          minWidth: "auto",
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.08)"
          }
        }}
        onClick={exitToAdmin}
      >
        EXIT ORGANISATION
      </Button>
    </Box>
  ) : null;
};

export default OrganisationOptions;
