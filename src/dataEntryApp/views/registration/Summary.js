import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
// import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';


const useStyle = makeStyles(theme => ({
  form: {
    padding: theme.spacing(4, 3)
  },
  table: {
    width: 400,
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
            <TableCell>Visit Name</TableCell>
            <TableCell align="right">Scedulling for</TableCell>
            <TableCell align="right">Overdue after</TableCell>

          </TableRow>
        </TableHead>
        <TableBody>

          <TableRow >
            <TableCell align="right">ANC ASHA</TableCell>
            <TableCell align="right">23-12-2019</TableCell>
            <TableCell align="right">24-12-2019</TableCell>

          </TableRow>
          <TableRow >
            <TableCell align="right">ANC VHND</TableCell>
            <TableCell align="right">24-12-2019</TableCell>
            <TableCell align="right">25-12-2019</TableCell>

          </TableRow>

        </TableBody>
      </Table>

      <Typography variant="button" display="block" gutterBottom>
        Observations
      </Typography>

      <Table className={classes.table} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>visit cancel reson</TableCell>
            <TableCell align="right">Away from village</TableCell>

          </TableRow>
        </TableHead>
        <TableBody>

          <TableRow>
            <TableCell align="right">Next VHND date</TableCell>
            <TableCell align="right">24-12-2019</TableCell>
          </TableRow>
          <TableRow>
            <TableCell align="right">Next ANC ASHA date</TableCell>
            <TableCell align="right">23-12-2019</TableCell>
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
