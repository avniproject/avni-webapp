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

const useStyles = makeStyles({
  table: {
    minWidth: 400,
  },
});

// function createData(name, calories, fat, carbs, protein) {
//   return { name, calories, fat, carbs, protein };
// }

// const rows = [
//   createData('Frozen yoghurt', 159, 6.0, 24, 4.0),
//   createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
//   createData('Eclair', 262, 16.0, 24, 6.0),
//   createData('Cupcake', 305, 3.7, 67, 4.3),
//   createData('Gingerbread', 356, 16.0, 49, 3.9),
// ];

const Summary=({subject})=> {

    const observations = subject.observations;
  const classes = useStyles();
 

  return (
      <div>
          {/* <Typography variant="button" display="block" gutterBottom>
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
          {rows.map(row => (
            <TableRow key={row.name}>             
              <TableCell align="right">{row.calories}</TableCell>
              <TableCell align="right">{row.fat}</TableCell>
              <TableCell align="right">{row.carbs}</TableCell>
             
            </TableRow>
          ))}
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
          {rows.map(row => (
            <TableRow key={row.name}>             
              <TableCell align="right">{row.calories}</TableCell>
              <TableCell align="right">{row.fat}</TableCell>            
            </TableRow>
          ))}
        </TableBody>
      </Table> */}




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
      </Table>

     
      </div>
    
      
    
  );
}
export default Summary;
