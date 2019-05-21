import React, { Component } from "react";
import PropTypes from 'prop-types';
import { Admin, Resource } from "react-admin";
import { withRouter } from 'react-router-dom';
import { connect } from "react-redux";

import { authProvider, LogoutButton } from "../admin";
import { store, adminHistory } from "../store";
import { UserList, UserDetail, UserCreate, UserEdit } from './user';
import { CatchmentDetail, CatchmentList, CatchmentCreate, CatchmentEdit } from "./catchment";

class OrgManager extends Component {
    constructor(props) {
        super(props);
        this.userList = this.userList.bind(this);
        this.catchmentList = this.catchmentList.bind(this);
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

    catchmentList(props) {
        return <CatchmentList {...props} organisation={this.props.organisation}/>;
    }

    render() {
        return (
            <Admin title="Manage Organisation"
                   authProvider={authProvider}
                   history={adminHistory}
                   logoutButton={LogoutButton}>
                <Resource name="user" list={this.userList} show={UserDetail} create={UserCreate} edit={UserEdit} />
                <Resource name="catchment" list={this.catchmentList} show={CatchmentDetail} create={CatchmentCreate} edit={CatchmentEdit}  />
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
