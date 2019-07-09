import React, {useEffect} from 'react';
import Table from '@material-ui/core/Table';
import Grid from '@material-ui/core/Grid';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import {withRouter} from 'react-router-dom';
import {connect} from "react-redux";
import AppBar from './AppBar';
import {makeStyles} from '@material-ui/core/styles';
import {searchSubjects, setSubjectSearchParams} from '../app/ducks';

const useStyle = makeStyles(theme => ({
    root: {
        width: '100%',
        marginTop: theme.spacing(3),
        overflowX: 'auto',
    },
    table: {
        minWidth: 1000,
    },
    searchForm: {
        marginLeft: theme.spacing(3),
        marginBottom: theme.spacing(8),
        display: 'flex',
        alignItems: 'flex-end',
    },
    searchFormItem: {
        margin: theme.spacing(1),
    }
}));

const SubjectsTable = ({subjects}) => {
    const classes = useStyle();

    return (
        <Table className={classes.table}>
            <TableHead>
                <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell align="right">Gender</TableCell>
                    <TableCell align="right">Date of birth(Age)</TableCell>
                    <TableCell align="right">Location</TableCell>
                    <TableCell align="right">Active programs</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {subjects.map((row, id) => (
                    <TableRow key={id}>
                        <TableCell component="th" scope="row">
                            {row.firstName + ' ' + row.lastName}
                        </TableCell>
                        <TableCell align="right">{row.gender.name}</TableCell>
                        <TableCell align="right">{row.dateOfBirth}</TableCell>
                        <TableCell align="right">{row.addressLevel.title}</TableCell>
                        <TableCell align="right">
                            {row.activePrograms.map((p, key) => (
                                <Button key={key} size="small"
                                        style={{height: 20, padding: 0, backgroundColor: p.colour, color: 'white'}}
                                        disabled>
                                    {p.operationalProgramName}
                                </Button>
                            ))}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

const SubjectSearch = (props) => {
    const classes = useStyle();

    const handleSubmit = (event) => {
        event.preventDefault();
        props.search();
    };

    useEffect(() => {
        props.search();
    }, []);

    return <div>
        <AppBar title='Search'/>
        <Grid
            container
            spacing={0}
            direction="column"
            alignItems="center"
            justify="center">

            <Grid item>
                <Paper className={classes.root}>
                    <form onSubmit={handleSubmit} className={classes.searchForm}>
                        <FormControl className={classes.searchFormItem}>
                            <InputLabel htmlFor="name-field">Name</InputLabel>
                            <Input id="name-field"
                                   type="text"
                                   value={props.searchParams.name}
                                   onChange={e => props.setSearchParams({name: e.target.value})}
                            />
                        </FormControl>
                        <FormControl className={classes.searchFormItem}>
                            <Button variant="contained" size="small" color="primary" onClick={handleSubmit}>
                                Search
                            </Button>
                        </FormControl>
                    </form>
                    <SubjectsTable subjects={props.subjects}/>
                </Paper>
            </Grid>
        </Grid>
    </div>
};

const mapStateToProps = state => ({
    user: state.app.user,
    subjects: state.app.subjects,
    searchParams: state.app.subjectSearchParams,
});

const mapDispatchToProps = dispatch => ({
    search: () => dispatch(searchSubjects()),
    setSearchParams: (params) => dispatch(setSubjectSearchParams(params)),
});

export default withRouter(
    connect(mapStateToProps, mapDispatchToProps)(SubjectSearch)
);