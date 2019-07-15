import React from "react";
import {withRouter} from 'react-router-dom';
import {connect} from "react-redux";

const SubjectRegister = (props) => {
    return <div>
        {props.user.username}
        {props.registrationSubjectType}
    </div>
};

const mapStateToProps = state => ({
    user: state.app.user,
    registrationSubjectType: state.app.registrationSubjectType,
});

const mapDispatchToProps = dispatch => ({});

export default withRouter(
    connect(mapStateToProps, mapDispatchToProps)(SubjectRegister)
);