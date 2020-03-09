import React from "react";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import { makeStyles } from "@material-ui/core/styles";
import { bold } from "ansi-colors";
import { Link, withRouter } from "react-router-dom";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles(theme => ({
  card: {
    boxShadow: "0px 0px 0px 0px",
    borderRadius: "0"
  },
  rightBorder: {
    borderRight: "1px solid rgba(0,0,0,0.12)",
    "&:nth-child(4n),&:last-child": {
      borderRight: "0px solid rgba(0,0,0,0.12)"
    },
    marginTop: "15px"
  },
  title: {
    fontSize: 14
  },
  headingBold: {
    fontWeight: bold
  },
  gridBottomBorder: {
    borderBottom: "1px solid rgba(0,0,0,0.12)",
    paddingBottom: "10px"
  }
}));

const GridCommonList = ({ gridListDetails }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <Grid item xs={12} container className={classes.gridBottomBorder}>
      {gridListDetails
        ? gridListDetails.map((relative, index) => {
            if (relative !== undefined) {
              return (
                <Grid key={index} item xs={3} className={classes.rightBorder}>
                  <Card className={classes.card}>
                    <CardContent>
                      <Typography component={"div"} color="primary">
                        <Link to={`?uuid=${relative.individualB.uuid}`} replace>
                          {" "}
                          {relative.individualB.firstName +
                            " " +
                            relative.individualB.lastName}{" "}
                        </Link>
                      </Typography>
                      <Typography
                        component={"div"}
                        className={classes.title}
                        color="textSecondary"
                        gutterBottom
                      >
                        {t(relative.relationship.individualBIsToARelation.name)}
                      </Typography>
                      <Typography
                        component={"div"}
                        className={classes.title}
                        color="textSecondary"
                        gutterBottom
                      >
                        {new Date().getFullYear() -
                          new Date(relative.individualB.dateOfBirth).getFullYear() +
                          `${t("year")}`}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button color="primary">{t("remove")}</Button>
                      <Button color="primary">{t("edit")}</Button>
                    </CardActions>
                  </Card>
                </Grid>
              );
            } else {
              return "";
            }
          })
        : ""}
    </Grid>
  );
};

export default withRouter(GridCommonList);
