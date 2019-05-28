import React, { Component } from "react";
import PropTypes from 'prop-types';
import { Admin, Resource, ListGuesser } from "react-admin";
import { withRouter } from 'react-router-dom';
import { connect } from "react-redux";

import { authProvider, LogoutButton } from "../admin";
import { store, adminHistory } from "../store";
import { UserList, UserDetail, UserCreate, UserEdit } from './user';
import { CatchmentDetail, CatchmentList, CatchmentCreate, CatchmentEdit } from "./catchment";
import { LocationTypeList, LocationTypeDetail, LocationTypeCreate, LocationTypeEdit } from "./addressLevelType";
import { LocationDetail, LocationList } from "./locations";


class OrgManager extends Component {
    constructor(props) {
        super(props);
        this.userList = this.userList.bind(this);
    }

    static childContextTypes = {
        store: PropTypes.object
    };

    getChildContext() {
        return { store }
    }

    userList(props) {
        return <UserList {...props} organisation={this.props.organisation}/>;
    }

    render() {
        return (
            <Admin title="Manage Organisation"
                   authProvider={authProvider}
                   history={adminHistory}
                   logoutButton={LogoutButton}>
                <Resource name="user" list={this.userList} show={UserDetail} create={UserCreate} edit={UserEdit} />
                <Resource name="catchment" list={CatchmentList} show={CatchmentDetail} create={CatchmentCreate} edit={CatchmentEdit}  />
                <Resource name="addressLevelType" options={{ label: "Location Types" }}
                          list={LocationTypeList}
                          show={LocationTypeDetail}
                          create={LocationTypeCreate}
                          edit={LocationTypeEdit} />
                <Resource name="locations" options={{ label: "Locations" }}
                          list={LocationList}
                          show={LocationDetail}  />
           </Admin>
        );
    }
}

const mapStateToProps = state => ({
    organisation: state.app.organisation,
});

export default withRouter(
    connect(mapStateToProps, null)(OrgManager)
);
