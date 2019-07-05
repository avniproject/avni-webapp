import React, {Component} from "react";
import PropTypes from 'prop-types';
import {withRouter} from 'react-router-dom';
import {connect} from "react-redux";
import SubjectSearch from './SubjectSearch';
import {store} from "../store";

class DataEntry extends Component {

    static childContextTypes = {
        store: PropTypes.object
    };

    getChildContext() {
        return {store}
    }

    render() {
        if(this.props.match.params.page === 'search') return <SubjectSearch />;
        return  <div><p>Page Not Found</p></div>
    }
}

const mapStateToProps = state => ({
    organisation: state.app.organisation,
    user: state.app.user
});

export default withRouter(
    connect(mapStateToProps, null)(DataEntry)
);
