import React from "react";
import ChooseSubject from "./ChooseSubject";
import {Box} from "@material-ui/core";
import {withRouter} from "react-router-dom";
import _ from 'lodash';

function WhatsAppSubjectsTab({history}) {
  return <Box style={{marginLeft: 20}}>
    <ChooseSubject onCancel={_.noop}
                   confirmActionLabel="Open"
                   onSubjectChosen={(subject) => {
                     history.push(`/app/subject?uuid=${subject.uuid}`);
                   }}
                   busy={false}/>
  </Box>;
};

export default withRouter(WhatsAppSubjectsTab);
