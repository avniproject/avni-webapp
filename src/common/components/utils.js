import React from "react";
import _, { get, merge } from "lodash";
import { Link as RouterLink, withRouter } from "react-router-dom";
import Link from "@material-ui/core/Link";
import SvgIcon from "@material-ui/core/SvgIcon";
import qs from "query-string";
import { join } from "path";

import { makeStyles } from "@material-ui/core/styles";

const createStyles = makeStyles(theme => ({
  noUnderline: {
    "&:hover, &:focus": {
      textDecoration: "none"
    }
  }
}));

export const AddIcon = props => (
  <SvgIcon {...props}>
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
  </SvgIcon>
);

export const DownloadIcon = props => (
  <svg width="24" height="24" viewBox="0 0 24 24" {...props}>
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM17 13l-5 5-5-5h3V9h4v4h3z" />
  </svg>
);

export const InternalLink = ({ children, noUnderline, ...props }) => {
  const classes = createStyles();
  return (
    <Link
      component={React.forwardRef((props, ref) => (
        <RouterLink innerRef={ref} {...props} className={noUnderline ? classes.noUnderline : ""} />
      ))}
      {...props}
    >
      {children}
    </Link>
  );
};

export const RelativeLink = withRouter(
  ({ location, children, to = "./", params, noParams, ...props }) => {
    const updatedParams = noParams ? "" : qs.stringify(merge(qs.parse(location.search), params));
    return (
      <InternalLink to={`${join(location.pathname, to)}?${updatedParams}`} {...props}>
        {children}
      </InternalLink>
    );
  }
);

export const Home = () => (
  <div>
    <ul>
      <li>
        <Link to="/org/">Manage Users</Link>
      </li>
    </ul>
  </div>
);

export const AccessDenied = () => (
  <div className="centerContainer">
    <h2>Access denied</h2>
  </div>
);

export const LineBreak = ({ num = 1 }) => _(num).times(idx => <br key={idx} />);

export const None = ({ displayText = "None" }) => (
  <div>
    <span>{displayText}</span>
  </div>
);

export const NoneWithLabel = ({ noneText = "None", labelText }) => (
  <div>
    <label style={{ fontSize: "0.7em", color: "#666" }}>{labelText}</label>
    <br />
    <None displayText={noneText} />
  </div>
);

export const withParams = Comp => ({ match, ...props }) => {
  const queryParams = qs.parse(get(props, "location.search"));
  return <Comp match={merge({}, match, { queryParams })} {...props} />;
};

export const WithProps = (extras, Compnent) => props => <Compnent {...extras} {...props} />;
