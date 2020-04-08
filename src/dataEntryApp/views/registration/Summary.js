import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Table, TableBody, TableCell, TableRow, Typography, List, Grid } from "@material-ui/core";
import Observations from "../../../common/components/Observations";
import { LineBreak } from "../../../common/components/utils";
import { useTranslation } from "react-i18next";

const useStyle = makeStyles(theme => ({
  form: {
    padding: theme.spacing(4, 3)
  },
  table: {
    width: "67%",
    border: "1px solid lightgray"
  }
}));

const Summary = ({ observations }) => {
  const classes = useStyle();
  const { t } = useTranslation();

  return (
    <div className={classes.form}>
      <Typography variant="button" display="block" gutterBottom>
        {t("SYSTEM RECOMMENDATIONS")}
      </Typography>
      <Table className={classes.table} aria-label="simple table">
        <TableBody>
          <TableRow>
            <TableCell align="justify">
              {t("Refer to the hospital immeditely for Baby has got diarrohea")}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <LineBreak num={2} />
      <Typography variant="button" display="block" gutterBottom>
        {t("OBSERVATIONS")}
      </Typography>
      <Grid item xs={8}>
        <List>
          <Observations observations={observations ? observations : ""} />
        </List>
        {/* <Button color="primary">{t("void")}</Button>
        <Button color="primary">{t("edit")}</Button> */}
      </Grid>

      {/* <Table className={classes.table} aria-label="simple table">        
        <TableBody>       
          {subject.observations.map(observation => (
            <TableRow key={observation.concept.name}>
              <TableCell component="th" scope="row">
              {observation.concept.name}
              </TableCell>
              <TableCell align="right"> {observation.valueJSON.answer}</TableCell>              
            </TableRow>
          ))}
        </TableBody>
      </Table> */}
    </div>
  );
};
export default Summary;
