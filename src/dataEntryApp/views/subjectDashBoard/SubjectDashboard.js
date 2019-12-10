import React, { Fragment, useEffect } from 'react';
import Typography from '@material-ui/core/Typography';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import ProfileDetails from './components/ProfileDetails';
import TabsPanel from './components/TabsPanel';
import { getSubjectProfile } from "../../reducers/subjectDashboardReducer";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { withParams } from 'common/components/utils';

const useStyles = makeStyles(theme => ({
    root: {
        padding: theme.spacing(3, 2),
        margin: theme.spacing(4),
        flexGrow: 1
    },
    Breadcrumbs: {
        margin: theme.spacing(4)
    }
}));

function breadcrumbHandler(event) {
    event.preventDefault();
    console.info('You clicked a breadcrumb.');
}

const SubjectDashboard = ({  match, getSubjectProfile,subjectProfile }) => {
   
    const classes = useStyles();

    useEffect(()=> {
        getSubjectProfile(match.queryParams.uuid);
    }, []);

    return (
        <Fragment>
            <Breadcrumbs className={classes.Breadcrumbs} aria-label="breadcrumb">
                <Link color="inherit" href="/" onClick={breadcrumbHandler}>
                    Home
      </Link>
                <Typography color="textPrimary">Shilpa Ingle's Profile</Typography>
            </Breadcrumbs>
            <Paper className={classes.root}>
                <ProfileDetails />
                <TabsPanel />
            </Paper>
        </Fragment>
    );
}


const mapStateToProps = (state) => ({
    subjectProfile: state.dataEntry.subjectProfile.subjectProfile
});

const mapDispatchToProps = {
    getSubjectProfile
};


export default withRouter(withParams(
    connect(
        mapStateToProps,
        mapDispatchToProps
    )(SubjectDashboard)
));