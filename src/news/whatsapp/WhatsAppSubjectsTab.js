import React, {useState} from "react";
import ChooseSubject from "./ChooseSubject";
import _ from 'lodash';
import {Box} from "@material-ui/core";

export default function () {
  return <Box style={{marginLeft: 20}}>
    <ChooseSubject onCancel={_.noop} onSubjectChosen={() => {}}/>
  </Box>;
}
