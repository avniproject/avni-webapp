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
    static childContextTypes = {
        store: PropTypes.object
    };

    getChildContext() {
        return { store }
    }

    render() {
        const _UserList = props => <UserList {...props} organisation={this.props.organisation} />;
        const _CatchmentList = props => <CatchmentList {...props} organisation={this.props.organisation}/>;
       
        return (
            <Admin title="Manage Organisation"
                   authProvider={authProvider}
                   history={adminHistory}
                   logoutButton={LogoutButton}>
                <Resource name="user" list={_UserList} show={UserDetail} create={UserCreate} edit={UserEdit} />
                <Resource name="catchment" list={_CatchmentList} show={CatchmentDetail} create={CatchmentCreate} edit={CatchmentEdit}  />
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
