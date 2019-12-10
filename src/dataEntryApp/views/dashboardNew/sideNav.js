import React, { Fragment } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import Divider from '@material-ui/core/Divider';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import { AddIcon, InternalLink } from "../../../common/components/utils";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";

const useStyle = makeStyles(theme => ({
    container: {
        width: "100%",
        display: "flex",
        flexDirection: "column",
        padding: '20px',
        // backgroundColor: "#36349e",
        color: "blue",
        borderRadius: "3px",
    },
    nested: {
        paddingLeft: theme.spacing(4),
    },
    dividerColor: {
        backgroundColor: 'grey',
    },
    FormControlRadio: {
        marginTop: '20px'
    },
    FormLabel: {
        color: "grey",
        marginLeft: '15px'
    }
}));

function SideNav({ operationalModules }) {
    const classes = useStyle();
    const [open, setOpen] = React.useState(false);
    const [value, setValue] = React.useState('female');

    const handleChange = event => {
        setValue(event.target.value);
        console.log(operationalModules);
    };

    const [anchorEl, setAnchorEl] = React.useState(null);
    const handleClickRoute = () => event => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseRoute = () => setAnchorEl(null);


    return (
        <div className={classes.container}>
            <List
                component="nav"
                aria-labelledby="nested-list-subheader"
                className={classes.root}
            >
                <label className={classes.FormLabel} >Register</label>
                {operationalModules.subjectTypes.map((element, key) => {
                    return (
                        <React.Fragment>
                            <InternalLink
                                key={key}
                                to={`/app/register?element=${element.name}`}
                                onClick={handleClickRoute(element)}
                                style={{ color: 'blue' }} 
                            >
                                <ListItem button>
                                    <ListItemIcon>
                                        <PersonAddIcon style={{ color: 'blue' }} />
                                    </ListItemIcon>
                                    <ListItemText primary={element.name} />
                                    <ChevronRightIcon />
                                </ListItem>
                            </InternalLink>
                            <Divider className={classes.dividerColor} />
                        </React.Fragment>
                    )
                })}
            </List>
            <FormControl className={classes.FormControlRadio} component="fieldset">
                <label className={classes.FormLabel} >Register and Enrollment For</label>
                {operationalModules.programs.map((element, key) => {
                    return (
                        <React.Fragment>
                            <RadioGroup key={key} aria-label="position" name="position" value={value} onChange={handleChange} row>
                                <FormControlLabel
                                    value="end"
                                    control={<Radio color="primary" />}
                                    label={element.operationalProgramName}
                                    labelPlacement="end"
                                />
                            </RadioGroup>
                            <Divider className={classes.dividerColor} />
                        </React.Fragment>
                    )
                })}
            </FormControl>
        </div>
    );
}


const mapStateToProps = state => {
    return {
        operationalModules: state.dataEntry.metadata.operationalModules
    };
};

export default withRouter(
    connect(
        mapStateToProps
    )(SideNav)
);