import { forwardRef } from "react";
import { styled } from "@mui/material/styles";
import _, { get, merge } from "lodash";
import { Link as RouterLink, withRouter } from "react-router-dom";
import { Link, SvgIcon } from "@mui/material";
import qs from "query-string";
import ScreenWithAppBar from "common/components/ScreenWithAppBar";

const StyledLink = styled(Link)({
  textDecoration: "none"
});

const CenteredContainer = styled("div")({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "column",
  height: "100%"
});

export const InternalLink = ({ children, noUnderline, ...props }) => (
  <StyledLink
    component={forwardRef((props, ref) => (
      <RouterLink innerRef={ref} {...props} />
    ))}
    sx={noUnderline ? { textDecoration: "none" } : {}}
    {...props}
  >
    {children}
  </StyledLink>
);

export const AccessDenied = () => (
  <ScreenWithAppBar appbarTitle="Access Denied">
    <CenteredContainer>
      <h2>Access denied</h2>
    </CenteredContainer>
  </ScreenWithAppBar>
);

export const LineBreak = ({ num = 1 }) => _(num).times(idx => <br key={idx} />);

export const None = ({ displayText = "None" }) => (
  <div>
    <span>{displayText}</span>
  </div>
);

export const withParams = Comp => ({ match, ...props }) => {
  const queryParams = qs.parse(get(props, "location.search"));
  return <Comp match={merge({}, match, { queryParams })} {...props} />;
};

export const WithProps = (extras, Component) => props => <Component {...extras} {...props} />;

export const formatMsgTemplate = (str, params) => {
  let replacer = function(value, index) {
    str = str.replace(new RegExp("\\{\\{" + (index + 1) + "\\}\\}", "g"), value);
  };
  let paramsArray = params.replace(new RegExp("\\[|\\]", "g"), "").split(/[,]+/);
  paramsArray.forEach(replacer);
  return str;
};
