import React, {Component} from "react";
import PropTypes from 'prop-types';
import {Admin, Resource} from "react-admin";
import {withRouter} from 'react-router-dom';
import {connect} from "react-redux";

import {authProvider, LogoutButton} from "../admin";
import {adminHistory, store} from "../store";
import {UserCreate, UserDetail, UserEdit, UserList} from './user';
import {CatchmentCreate, CatchmentDetail, CatchmentEdit, CatchmentList} from "./catchment";
import {LocationTypeCreate, LocationTypeDetail, LocationTypeEdit, LocationTypeList} from "./addressLevelType";
import {LocationCreate, LocationDetail, LocationEdit, LocationList} from "./locations";


class OrgManager extends Component {
    constructor(props) {
        super(props);
    }

    static childContextTypes = {
        store: PropTypes.object
    };

    getChildContext() {
        return { store }
    }

    render() {
        const { organisation, user } = this.props;
        return (
            <Admin title="Manage Organisation"
                   authProvider={authProvider}
                   history={adminHistory}
                   logoutButton={LogoutButton}>
                <Resource name="user"
                          list={With({organisation}, UserList)}
                          create={With({organisation}, UserCreate)}
                          show={With({user}, UserDetail)}
                          edit={With({user}, UserEdit)}/>
                <Resource name="catchment" list={CatchmentList} show={CatchmentDetail} create={CatchmentCreate} edit={CatchmentEdit}  />
                <Resource name="addressLevelType" options={{ label: "Location Types" }}
                          list={LocationTypeList}
                          show={LocationTypeDetail}
                          create={LocationTypeCreate}
                          edit={LocationTypeEdit} />
                <Resource name="locations" options={{ label: "Locations" }}
                          list={LocationList}
                          show={LocationDetail}
                          create={LocationCreate} edit={LocationEdit} />
           </Admin>
        );
    }
}

const With = (extras, Compnent) => props => <Compnent {...extras} {...props}/>;

const mapStateToProps = state => ({
    organisation: state.app.organisation,
    user: state.app.user
});

export default withRouter(
    connect(mapStateToProps, null)(OrgManager)
);
