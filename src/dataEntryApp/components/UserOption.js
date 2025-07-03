import React from "react";
import { styled } from '@mui/material/styles';
import { List, ListItemIcon, ListItemText, Collapse, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel } from "@mui/material";
import { Settings, Logout, ArrowUpward, ExpandLess, ExpandMore } from "@mui/icons-material";
import { LOCALES } from "../../common/constants";
import { useTranslation } from "react-i18next";
import { logout, saveUserInfo } from "rootApp/ducks";
import { connect } from "react-redux";
import { get } from "lodash";
import UserInfo from "../../common/model/UserInfo";
import { Privilege } from "openchs-models";
import ListItemButton from "@mui/material/ListItemButton";

const StyledContainer = styled('div')({
  float: "right",
  boxShadow: "3px 3px 5px #aaaaaa",
  marginRight: "300px"
});

const StyledList = styled(List)(({ theme }) => ({
  width: "22%",
  color: "blue",
  maxWidth: 360,
  position: "absolute",
  zIndex: "100",
  backgroundColor: theme.palette.background.paper,
  boxShadow: "3px 3px 5px #aaaaaa",
  padding: "1%"
}));

const StyledListItemButton = styled(ListItemButton)({
  paddingTop: "5px",
  paddingBottom: "5px"
});

const StyledSettingsIcon = styled(Settings)({
  color: "blue"
});

const StyledListItemText = styled(ListItemText)({
  color: "blue",
  '& .MuiListItemText-primary': {
    color: "blue"
  }
});

const StyledHr = styled('hr')({
  padding: "0px",
  marginTop: "0px",
  marginBottom: "0px",
  width: "90%"
});

const StyledFormControl = styled(FormControl)({
  fontSize: "12px",
  marginTop: "20px",
  marginLeft: "85px"
});

const UserOption = ({ orgConfig, userInfo, defaultLanguage, saveUserInfo, logout, history }) => {
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef(null);
  const toggleSettingsMenu = () => {
    setOpen(!open);
  };

  const getKeyByValue = (object, value) => {
    return Object.keys(object).find(key => object[key] === value);
  };

  React.useEffect(() => {
    if (anchorRef.current && prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }
    prevOpen.current = open;
  }, [open]);

  const { t, i18n } = useTranslation();

  const handleChange = event => {
    if (event.target.value) {
      userInfo.settings = { ...userInfo.settings, locale: event.target.value };
      saveUserInfo(userInfo);
      i18n.changeLanguage(userInfo.settings.locale);
    }
  };

  const hasUploadPrivilege = UserInfo.hasPrivilege(userInfo, Privilege.PrivilegeType.UploadMetadataAndData);

  return (
    <StyledContainer>
      <StyledList component="nav" aria-labelledby="nested-list-subheader">
        <StyledListItemButton onClick={toggleSettingsMenu}>
          <ListItemIcon>
            <StyledSettingsIcon />
          </ListItemIcon>
          <StyledListItemText primary={t("settings")} />
          {open ? <ExpandLess /> : <ExpandMore />}
        </StyledListItemButton>
        <Collapse in={open} timeout="auto" unmountOnExit>
          <StyledFormControl component="fieldset">
            <FormLabel component="legend">{t("language")}</FormLabel>
            <RadioGroup aria-label="language" name="language" value={get(userInfo, "settings.locale", "en")} onChange={handleChange}>
              {orgConfig
                ? orgConfig.map((element, index) => (
                  <FormControlLabel
                    value={element}
                    key={index}
                    control={<Radio />}
                    label={t(
                      getKeyByValue(LOCALES, element).charAt(0) +
                      getKeyByValue(LOCALES, element)
                        .slice(1)
                        .toLowerCase()
                    )}
                  />
                ))
                : ""}
            </RadioGroup>
          </StyledFormControl>
        </Collapse>
        <StyledHr />
        {hasUploadPrivilege && (
          <StyledListItemButton onClick={() => history.push(`/admin/upload`)}>
            <ListItemIcon>
              <ArrowUpward />
            </ListItemIcon>
            <ListItemText primary={t("bulk upload")} />
          </StyledListItemButton>
        )}
        <StyledHr />
        <StyledListItemButton onClick={logout}>
          <ListItemIcon>
            <Logout />
          </ListItemIcon>
          <ListItemText primary={t("logout")} />
        </StyledListItemButton>
      </StyledList>
    </StyledContainer>
  );
};

const mapStateToProps = state => ({
  orgConfig: state.translationsReducer.orgConfig
    ? state.translationsReducer.orgConfig._embedded.organisationConfig[0].settings.languages
    : "",
  userInfo: state.app.userInfo,
  defaultLanguage: state.app.userInfo.settings && state.app.userInfo.settings.locale ? state.app.userInfo.settings.locale : "en"
});

const mapDispatchToProps = dispatch => ({
  saveUserInfo: saveUserInfo,
  logout: () => dispatch(logout())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UserOption);