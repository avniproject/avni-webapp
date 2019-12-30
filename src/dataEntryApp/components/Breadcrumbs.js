import React from "react";
import Typography from "@material-ui/core/Typography";
import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import Link from "@material-ui/core/Link";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3, 2),
    margin: theme.spacing(4),
    flexGrow: 1
  },
  Breadcrumbs: {
    margin: theme.spacing(4)
  }
}));

export default ({ path }) => {
  const classes = useStyles();
  const parts = path.split(/\/+/g).filter(Boolean);
  const clickableParts = parts.slice(0, parts.length - 1);
  const currentpage = parts[parts.length - 1];

  return (
    <Breadcrumbs className={classes.Breadcrumbs} aria-label="breadcrumb">
      {clickableParts.map(part => (
        <Link color="inherit" href="/">
          {part}
        </Link>
      ))}
      <Typography color="textPrimary">{currentpage}</Typography>
    </Breadcrumbs>
  );
};
