import React from "react";
import { Card, CardContent, Grid, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { InternalLink } from "../../common/components/utils";
import { useTranslation } from "react-i18next";
import SubjectTypeIcon from "./SubjectTypeIcon";

const useStyles = () =>
  makeStyles(() => ({
    card: {
      boxShadow: "0px 0px 0px 0px",
      borderRadius: "0",
      width: 100,
      whiteSpace: "pre-wrap",
      overflowWrap: "break-word",
      height: 150,
      justify: "center",
      margin: 20,
      textDecoration: "none",
      alignItems: "center"
    }
  }));

const SubjectCardView = ({ uuid, name, gender, age, location, subjectTypeName, ...props }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <Card className={classes.card} key={uuid}>
      <CardContent className={classes.cardContent}>
        <Grid container justify="center" direction="row" spacing={1} alignItems="center">
          <Grid item>
            <SubjectTypeIcon subjectTypeName={subjectTypeName} size={25} />
          </Grid>
          <Grid item>
            <InternalLink to={`/app/subject?uuid=${uuid}`}>{name}</InternalLink>
          </Grid>
        </Grid>
        {[gender, age, location].map((element, index) => {
          return (
            element && (
              <Typography
                component={"div"}
                className={classes[element]}
                gutterBottom
                align={"center"}
                key={index}
              >
                {t(element)}
              </Typography>
            )
          );
        })}
      </CardContent>
      {props.children && <CardContent>{props.children}</CardContent>}
    </Card>
  );
};

export default SubjectCardView;
