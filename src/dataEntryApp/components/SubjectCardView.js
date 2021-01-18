import React from "react";
import { Card, CardContent, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { InternalLink } from "../../common/components/utils";

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

const SubjectCardView = ({ uuid, name, gender, age, location, ...props }) => {
  const classes = useStyles();
  return (
    <Card className={classes.card} key={uuid}>
      <CardContent className={classes.cardContent}>
        <Typography component={"div"} align={"center"} color="primary" gutterBottom>
          <InternalLink to={`/app/subject?uuid=${uuid}`}>{name}</InternalLink>
        </Typography>
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
                {element}
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
