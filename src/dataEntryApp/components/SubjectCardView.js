import React from "react";
import { Card, CardContent, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { InternalLink } from "../../common/components/utils";

const useStyles = () =>
  makeStyles(theme => ({
    card: {
      boxShadow: "0px 0px 0px 0px",
      borderRadius: "0",
      width: 150,
      whiteSpace: "pre-wrap",
      overflowWrap: "break-word",
      height: 150,
      justify: "center",
      margin: 20,
      textDecoration: "none"
    },
    name: {},
    age: {},
    gender: {},
    location: {}
  }));

const SubjectCardView = ({ uuid, name, gender, age, location, ...props }) => {
  const classes = useStyles();

  return (
    <div>
      <Card className={classes.card}>
        <CardContent>
          <Typography component={"div"} className={classes.name} color="primary" gutterBottom>
            <InternalLink to={`/app/subject?uuid=${uuid}`}>{name}</InternalLink>
          </Typography>
          {[gender, age, location].map(element => {
            return (
              element && (
                <Typography
                  component={"div"}
                  className={classes[element]}
                  color="primary"
                  gutterBottom
                >
                  {element}
                </Typography>
              )
            );
          })}
        </CardContent>
        {props.children && <CardContent>{props.children}</CardContent>}
      </Card>
    </div>
  );
};

export default SubjectCardView;
