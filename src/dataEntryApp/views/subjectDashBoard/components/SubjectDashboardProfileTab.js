import React, { Fragment } from "react";
import { makeStyles } from "@material-ui/core/styles";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Typography from "@material-ui/core/Typography";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import { bold } from "ansi-colors";
import moment from "moment/moment";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { TableContainer } from '@material-ui/core';


const useStyles = makeStyles(theme => ({
  expansionHeading: {
    fontSize: theme.typography.pxToRem(15),
    flexBasis: "33.33%",
    flexShrink: 0,
    fontWeight: bold
  },
  expansionSecondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary
  },
  listItemView: {
    border: "1px solid lightGrey"
  },
  card: {
    boxShadow: "0px 0px 0px 0px rgba(0,0,0,0.12)",
    borderRight: "1px solid rgba(0,0,0,0.12)",
    borderRadius: "0"
  },
  bullet: {
    display: "inline-block",
    margin: "0 2px",
    transform: "scale(0.8)"
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
  },
  table: {
    border: "1px solid rgba(224, 224, 224, 1)"
  }
 
}));

const SubjectDashboardProfileTab = ({ profile }) => {
  const classes = useStyles();
  const [expanded, setExpanded] = React.useState(false);

  const handleChange = panel => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Fragment>
      <ExpansionPanel expanded={expanded === "panel1"} onChange={handleChange("panel1")}>
        <ExpansionPanelSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1bh-content"
          id="panel1bh-header"
        >
          <div >
            <h5>Registartion Details</h5>
            <p>Registartion Date: {moment(new Date(profile.registrationDate)).format("DD-MM-YYYY")}</p>
          </div>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <Grid item xs={12}>
            <List>
              {profile.observations.map(element => {
                return (
                  <Fragment>
                    <Table className={classes.table} size="small" aria-label="a dense table">
                      <TableBody>
                        <TableRow >
                          <TableCell component="th" scope="row" width="50%">
                            {element.concept["name"]}
                          </TableCell>
                          <TableCell align="left" width="50%">
                            {["Numeric", "Text"].includes(element.concept.dataType) ? (
                              <div>{element.value}</div>
                            ) : "Coded" === element.concept.dataType ? (
                              <div>{element.value.map(it => it.name).join(", ")}</div>
                            ) : (
                                  <div></div>
                                )}</TableCell>

                        </TableRow>
                      </TableBody>
                    </Table>
                  </Fragment>
                );
              })}
            </List>
            <Button color="primary">VOID</Button>
            <Button color="primary">EDIT</Button>
          </Grid>
        </ExpansionPanelDetails>
      </ExpansionPanel>
      <ExpansionPanel expanded={expanded === "panel2"} onChange={handleChange("panel2")}>
        <ExpansionPanelSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2bh-content"
          id="panel2bh-header"
        >
          <Typography className={classes.expansionHeading}>Relatives</Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>

          <Grid item xs={12} container className={classes.gridBottomBorder}>
            {profile.relationships.map(relative => {
              return (
                <Grid item xs={3}>
                  <Card className={classes.card}>
                    <CardContent>
                      <Typography color="primary">{relative.firstName + " " + relative.lastName}</Typography>
                      <Typography className={classes.title} color="textSecondary" gutterBottom>
                        {relative.individualBIsToARelation}
                      </Typography>
                      <Typography className={classes.title} color="textSecondary" gutterBottom>
                        {
                          new Date().getFullYear() - new Date(relative.dateOfBirth).getFullYear() + " Year"
                        }
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button color="primary">REMOVE</Button>
                      <Button color="primary">EDIT</Button>
                    </CardActions>
                  </Card>
                </Grid>
              )
            })}
          </Grid>

        </ExpansionPanelDetails>
        <Button color="primary">ADD RELATIVE</Button>
      </ExpansionPanel>
    </Fragment>
  );
};

export default SubjectDashboardProfileTab;
