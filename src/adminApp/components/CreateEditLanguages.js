import React, { useState } from "react";
import Select from "react-select";
import "bootstrap/dist/css/bootstrap.min.css";
import { localeChoices } from "../../common/constants";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import http from "common/utils/httpClient";
import _ from "lodash";
import CustomizedSnackbar from "../../formDesigner/components/CustomizedSnackbar";
import { Title } from "react-admin";

const options = localeChoices.map(l => ({ label: l.name, value: l.id }));

export const CreateEditLanguages = props => {
  if (_.isNil(props.history.location.state)) {
    return <div />;
  }

  const setting = props.history.location.state.settings;
  const [lang, setLang] = useState(
    options.filter(l => setting.settings.languages.includes(l.value))
  );
  const [messageStatus, setMessageStatus] = useState({ message: "", display: false });
  const [snackBarStatus, setSnackBarStatus] = useState(true);

  const saveLanguage = () => {
    http
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
      <Box boxShadow={2} p={3} bgcolor="background.paper">
        <Box m={2}>
          <Select isMulti value={lang} options={options} onChange={name => setLang(name)} />
        </Box>
        <Box m={2} display="flex" justifyContent="left">
          <Button variant="contained" onClick={saveLanguage} color="primary" aria-haspopup="false">
            Save
          </Button>
        </Box>
        {messageStatus.display && (
          <CustomizedSnackbar
            message={messageStatus.message}
            getDefaultSnackbarStatus={status => setSnackBarStatus(status)}
            defaultSnackbarStatus={snackBarStatus}
          />
        )}
      </Box>
    </div>
  );
};
