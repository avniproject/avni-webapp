import React from "react";
import {withRouter} from "react-router-dom";
import {connect} from "react-redux";
import AppBar from "./AppBar";
import {makeStyles} from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';
import {getRegistrationForm} from '../rootApp/ducks';
//import isNil from 'lodash/isNil';

const useStyle = makeStyles(theme => ({
    root: {
        width: '90vw',
        minHeight: '80vh',
        marginTop: theme.spacing(3, 2),
    },
}));

const SubjectRegister = (props) => {
    const classes = useStyle();

    React.useEffect(() => {
        props.getRegistrationForm();
    }, []);

    return (<div>
            <AppBar title={`${props.subjectType.name} Registration`}/>

            <Grid
                container
                spacing={0}
                direction="column"
                alignItems="center"
                justify="center">
                <Grid item>
                    <Card className={classes.root}>
                        {JSON.stringify(props.registrationForm)}
                    </Card>
                </Grid>
            </Grid>
        </div>
    );
};

const mapStateToProps = state => ({
    user: state.app.user,
    subjectType: state.app.registrationSubjectType,
    registrationForm: state.app.registrationForm,
});

const mapDispatchToProps = dispatch => ({
    getRegistrationForm: () => dispatch(getRegistrationForm())
});

export default withRouter(
    connect(mapStateToProps, mapDispatchToProps)(SubjectRegister)
);
