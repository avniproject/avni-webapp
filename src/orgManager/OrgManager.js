import React, { Component } from "react";
import PropTypes from 'prop-types';
import { Admin, Resource } from "react-admin";
import { withRouter } from 'react-router-dom';

import { authProvider } from "../admin";
import { store, adminHistory } from "../store";
import { UserList } from './user';
import { connect } from "react-redux";

class OrgManager extends Component {
    static childContextTypes = {
        store: PropTypes.object
    };

    getChildContext() {
        return { store }
    }

    render() {
        const _UserList = props => <UserList {...props} organisation={this.props.organisation} />;
        return (
            <Admin authProvider={authProvider} history={adminHistory} title="Manage Organisation">
                <Resource name="user" list={_UserList} />
                <Resource name="catchment" />
            </Admin>
        );
    }
}

const mapStateToProps = state => ({
    organisation: state.app.organisation
});

export default withRouter(
    connect(mapStateToProps, null)(OrgManager)
);
