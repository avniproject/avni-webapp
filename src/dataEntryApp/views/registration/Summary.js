import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
// import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import { LineBreak } from "../../../common/components/utils";

import Paper from '@material-ui/core/Paper';


const useStyle = makeStyles(theme => ({
  form: {
    padding: theme.spacing(4, 3)
  },
  table: {
    width: 400,
    //borderColor:"gray",
    border:"1px solid lightgray"
  }
}));

const Summary = ({ subject }) => {
  const observations = subject.observations;
  const classes = useStyle();


  return (
    <div className={classes.form} >
      <Typography variant="button" display="block" gutterBottom>
        Visits being recommendations
      </Typography>
      <Table className={classes.table} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell align="justify">Visit Name</TableCell>
            <TableCell align="justify">Scedulling for</TableCell>
            <TableCell align="justify">Overdue after</TableCell>

          </TableRow>
        </TableHead>
        <TableBody>

          <TableRow >
            <TableCell align="justify">ANC ASHA</TableCell>
            <TableCell align="justify">23-12-2019</TableCell>
            <TableCell align="justify">24-12-2019</TableCell>

          </TableRow>
          <TableRow >
            <TableCell align="justify">ANC VHND</TableCell>
            <TableCell align="justify">24-12-2019</TableCell>
            <TableCell align="justify">25-12-2019</TableCell>

          </TableRow>

        </TableBody>
      </Table>
      <LineBreak num={3} />
      <Typography variant="button" display="block" gutterBottom>
        Observations
      </Typography>

      <Table className={classes.table} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell align="justify">visit cancel reson</TableCell>
            <TableCell align="justify">Away from village</TableCell>

          </TableRow>
        </TableHead>
        <TableBody>

          <TableRow>
            <TableCell align="justify">Next VHND date</TableCell>
            <TableCell align="justify">24-12-2019</TableCell>
          </TableRow>
          <TableRow>
            <TableCell align="justify">Next ANC ASHA date</TableCell>
            <TableCell align="justify">23-12-2019</TableCell>
          </TableRow>

        </TableBody>
      </Table>



      {/* 
      <Typography variant="button" display="block" gutterBottom>
        Observations
      </Typography>

      <Table className={classes.table} aria-label="simple table">        
        <TableBody>       
          {observations.map(observation => (
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
}
export default Summary;
