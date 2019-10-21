import React, { useState } from "react";
import Select from "react-select";
import "bootstrap/dist/css/bootstrap.min.css";
import { localeChoices } from "../../common/constants";
import Button from "@material-ui/core/Button";

import axios from "axios";
import _ from "lodash";
import CustomizedSnackbar from "../../formDesigner/components/CustomizedSnackbar";
import { Title } from "react-admin";
// import { styled } from '@material-ui/core/styles';
// import { compose, spacing, palette } from '@material-ui/system';
// const Box = styled('div')(
//     compose(
//       spacing,
//       palette,
//     ),
// );
const options = localeChoices.map(l => ({ label: l.name, value: l.id }));

export const CreateEditLanguages = props => {
  if (_.isNil(props.location.state)) {
    return <div />;
  }

  const setting = props.location.state.settings;
  const [lang, setLang] = useState(
    options.filter(l => setting.settings.languages.includes(l.value))
  );
  const [messageStatus, setMessageStatus] = useState({ message: "", display: false });
  const [snackBarStatus, setSnackBarStatus] = useState(true);

  const saveLanguage = () => {
    axios
      .post("/organisationConfig", {
        uuid: setting.uuid,
        settings: {
          languages: _.isNil(lang) ? [] : lang.map(l => l.value),
          myDashboardFilters: setting.settings.myDashboardFilters,
          searchFilters: setting.settings.searchFilters
        }
      })
      .then(response => {
        if (response.status === 201) {
          setMessageStatus({ message: "Language updated", display: true });
          setSnackBarStatus(true);
        }
      })
      .catch(error => {
        setMessageStatus({ message: "Something went wrong please try later", display: true });
        setSnackBarStatus(true);
      });
  };

  return (
    <div>
      <Title title="Language Config" />
      <div boxShadow={2} p={3} bgcolor="background.paper">
        <div m={2}>
          <Select isMulti value={lang} options={options} onChange={name => setLang(name)} />
        </div>
        <div m={2} display="flex" justifyContent="left">
          <Button variant="contained" onClick={saveLanguage} color="primary" aria-haspopup="false">
            Save
          </Button>
        </div>
        {messageStatus.display && (
          <CustomizedSnackbar
            message={messageStatus.message}
            getDefaultSnackbarStatus={status => setSnackBarStatus(status)}
            defaultSnackbarStatus={snackBarStatus}
          />
        )}
      </div>
    </div>
  );
};
