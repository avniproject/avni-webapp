import React from "react";
import { makeStyles } from "@mui/styles";
import { Typography, Grid, Card, CardActions, CardContent } from "@mui/material";
import { bold } from "ansi-colors";
import { useTranslation } from "react-i18next";
import { InternalLink } from "../../../../common/components/utils";
import RemoveRelative from "../components/RemoveRelative";
import SubjectProfilePicture from "../../../components/SubjectProfilePicture";
import { Individual } from "avni-models";

const useStyles = makeStyles(theme => ({
  card: {
    boxShadow: "0px 0px 0px 0px",
    borderRadius: "0"
  },
  rightBorder: {
    borderRight: "1px solid rgba(0,0,0,0.12)",
    "&:nth-child(4n),&:last-child": {
      borderRight: "0px solid rgba(0,0,0,0.12)"
    }
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

const GridCommonList = ({ profileUUID, profileName, gridListDetails }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <Grid item xs={12} container className={classes.gridBottomBorder}>
      {gridListDetails
        ? gridListDetails.map((relative, index) => {
            if (relative !== undefined && !relative.voided) {
              return (
                <Grid key={index} item xs={3} className={classes.rightBorder}>
                  <Card className={classes.card}>
                    <CardContent>
                      <Grid container direction={"row"} spacing={1}>
                        <Grid item>
                          <SubjectProfilePicture
                            allowEnlargementOnClick={true}
                            firstName={relative.individualB.name}
                            profilePicture={relative.individualB.profilePicture}
                            subjectType={relative.individualB.subjectType}
                            subjectTypeName={relative.individualB.subjectType.name}
                            size={25}
                            style={{ margin: "0px" }}
                          />
                        </Grid>
                        <Grid item>
                          <Typography component={"div"} color="primary">
                            <InternalLink to={`/app/subject?uuid=${relative.individualB.uuid}`}>
                              {" "}
                              {Individual.getFullName(relative.individualB)}{" "}
                            </InternalLink>
                          </Typography>
                          <Typography component={"div"} className={classes.title} color="textSecondary" gutterBottom>
                            {t(relative.relationship.individualBIsToARelation.name)}
                          </Typography>
                          <Typography component={"div"} className={classes.title} color="textSecondary" gutterBottom>
                            {new Date().getFullYear() - new Date(relative.individualB.dateOfBirth).getFullYear()} {t("years")}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                    {
                      <CardActions style={{ padding: "8px 8px 8px 0px" }}>
                        {/* <Button color="primary">{t("remove")}</Button> */}
                        <RemoveRelative
                          relationAuuid={profileUUID}
                          relationAname={profileName}
                          relationBname={Individual.getFullName(relative.individualB)}
                          relationBId={relative.id}
                          relationuuid={relative.uuid}
                          relationBuuid={relative.individualB.uuid}
                          relationBTypeuuid={relative.relationship.uuid}
                        />
                        {/* <Button color="primary">{t("edit")}</Button> */}
                      </CardActions>
                    }
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

export default GridCommonList;
