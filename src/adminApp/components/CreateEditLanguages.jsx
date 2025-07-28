import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import { Box } from "@mui/material";
import { httpClient as http } from "common/utils/httpClient";
import _ from "lodash";
import { Title } from "react-admin";
import { SaveComponent } from "../../common/components/SaveComponent";
import { DocumentationContainer } from "../../common/components/DocumentationContainer";
import CustomizedSnackbar from "../../formDesigner/components/CustomizedSnackbar";
import ErrorMessageUtil from "../../common/utils/ErrorMessageUtil";
import { localeChoices } from "../../common/constants";

const options = localeChoices.map(l => ({ label: l.name, value: l.id }));

const CreateEditLanguages = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [messageStatus, setMessageStatus] = useState({
    message: "",
    display: false
  });
  const [snackBarStatus, setSnackBarStatus] = useState(true);

  const { settings, worklistUpdationRule } = location.state || {};

  const { control, handleSubmit } = useForm({
    defaultValues: {
      languages:
        options.filter(l => settings?.settings?.languages.includes(l.value)) ||
        []
    }
  });

  if (_.isNil(settings)) {
    navigate("/");
    return null;
  }

  const onSubmit = data => {
    const payload = {
      uuid: settings.uuid,
      settings: {
        languages: _.isNil(data.languages)
          ? []
          : data.languages.map(l => l.value),
        myDashboardFilters: settings.settings.myDashboardFilters,
        searchFilters: settings.settings.searchFilters
      },
      worklistUpdationRule
    };

    return http
      .put("/organisationConfig", payload)
      .then(response => {
        if (response.status === 200 || response.status === 201) {
          setMessageStatus({ message: "Language updated", display: true });
          setSnackBarStatus(true);
        }
      })
      .catch(error => {
        setMessageStatus(ErrorMessageUtil.getMessageType1(error));
        setSnackBarStatus(true);
      });
  };

  return (
    <Box
      sx={{
        boxShadow: 2,
        p: 3,
        bgcolor: "background.paper"
      }}
    >
      <Title title="Edit Language" />
      <DocumentationContainer filename={"Language.md"}>
        <Box sx={{ m: 2 }}>
          <Controller
            name="languages"
            control={control}
            render={({ field }) => (
              <Select
                isMulti
                value={field.value}
                options={options}
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
            )}
          />
        </Box>
        <Box sx={{ m: 2, display: "flex", justifyContent: "left" }}>
          <SaveComponent name="Save" onSubmit={handleSubmit(onSubmit)} />
        </Box>
        {messageStatus.display && (
          <CustomizedSnackbar
            message={messageStatus.message}
            getDefaultSnackbarStatus={status => setSnackBarStatus(status)}
            defaultSnackbarStatus={snackBarStatus}
          />
        )}
      </DocumentationContainer>
    </Box>
  );
};

export default CreateEditLanguages;
