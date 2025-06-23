import React, { useEffect, useState } from "react";
import {
  BooleanField,
  Datagrid,
  DisabledInput,
  Edit,
  Filter,
  List,
  ReferenceField,
  ReferenceInput,
  required,
  SaveButton,
  Show,
  ShowButton,
  showNotification as showNotificationAction,
  SimpleForm,
  SimpleShowLayout,
  TextField,
  TextInput,
  Toolbar
} from "react-admin";
import { CustomSelectInput } from "./components/CustomSelectInput";
import { Title } from "./components/Title";
import OpenOrganisation from "./components/OpenOrganisation";
import ToggleAnalyticsButton from "./ToggleAnalyticsButton";
import { Box, Grid, FormHelperText, MenuItem } from "@mui/material";
import { AvniTextField } from "../common/components/AvniTextField";
import { SaveComponent } from "../common/components/SaveComponent";
import { AvniSelect } from "../common/components/AvniSelect";
import useGetData from "../custom-hooks/useGetData";
import httpClient from "../common/utils/httpClient";
import { useHistory } from "react-router-dom";
import { connect } from "react-redux";
import PropTypes from "prop-types";

export const OrganisationFilter = props => (
  <Filter {...props} style={{ marginBottom: "2em" }}>
    <TextInput label="Organisation Name" source="name" resettable alwaysOn />
  </Filter>
);

export const OrganisationList = ({ history, ...props }) => {
  return (
    <List {...props} bulkActions={false} filter={{ searchURI: "find" }} filters={<OrganisationFilter />}>
      <Datagrid>
        <TextField source="name" label="Name" />
        <ReferenceField label="Category" source="categoryId" reference="organisationCategory" linkType={false} sortBy={"category.name"}>
          <TextField source="name" />
        </ReferenceField>
        <ReferenceField label="Parent organisation" source="parentOrganisationId" reference="organisation" linkType="show" allowEmpty>
          <TextField source="name" />
        </ReferenceField>
        <TextField source="dbUser" label="DB User" sortBy={"dbUser"} />
        <TextField source="schemaName" label="Schema Name" sortBy={"schemaName"} />
        <TextField source="mediaDirectory" label="Media Directory" sortBy={"mediaDirectory"} />
        <TextField source="usernameSuffix" label="Username Suffix" sortBy={"usernameSuffix"} />
        <ReferenceField
          resource="organisationStatus"
          source="statusId"
          reference="organisationStatus"
          label="Status"
          linkType={false}
          sortBy={"status.name"}
        >
          <TextField source="name" />
        </ReferenceField>
        <BooleanField source="analyticsDataSyncActive" label="Active analytics data sync" sortable={false} />
        <ShowButton />
        <OpenOrganisation porps={props} />
      </Datagrid>
    </List>
  );
};

export const OrganisationDetails = props => {
  return (
    <Show title={<Title title={"Organisation"} />} {...props}>
      <SimpleShowLayout>
        <TextField source="name" label="Name" />
        <TextField source="dbUser" label="DB User" />
        <TextField source="schemaName" label="Schema Name" />
        <TextField source="mediaDirectory" label="Media Directory" />
        <TextField source="usernameSuffix" label="Username Suffix" />
        <ReferenceField
          resource="organisationCategory"
          source="categoryId"
          reference="organisationCategory"
          label="Category"
          linkType={false}
        >
          <TextField source="name" />
        </ReferenceField>
        <ReferenceField resource="organisationStatus" source="statusId" reference="organisationStatus" label="Status" linkType={false}>
          <TextField source="name" />
        </ReferenceField>
        <ReferenceField resource="account" source="accountId" reference="account" label="Account Name" linkType="show" allowEmpty>
          <TextField source="name" />
        </ReferenceField>
        <ReferenceField label="Parent organisation" source="parentOrganisationId" reference="organisation" linkType="show" allowEmpty>
          <TextField source="name" />
        </ReferenceField>
        <BooleanField source="analyticsDataSyncActive" label="Active analytics data sync" />
      </SimpleShowLayout>
    </Show>
  );
};

const isRequired = required("This field is required");

export const OrganisationEdit = props => {
  return (
    <Edit undoable={false} title={<Title title={"Edit Organisation"} />} {...props}>
      <SimpleForm toolbar={<CustomToolbar />} redirect="list">
        {props && props.id === "1" ? (
          <DisabledInput source="name" validate={isRequired} />
        ) : (
          <TextInput source="name" validate={isRequired} autoComplete="off" />
        )}
        <DisabledInput source="dbUser" validate={isRequired} />
        <DisabledInput source="schemaName" validate={isRequired} />
        <DisabledInput source="mediaDirectory" />
        <TextInput source="usernameSuffix" validate={isRequired} />
        <OrganisationCategoryInput />
        <OrganisationStatusInput />
        <BooleanField source="analyticsDataSyncActive" />
        <ToggleAnalyticsButton />
        <br />
        <ReferenceInput
          resource="account"
          source="accountId"
          reference="account"
          label="Account Name"
          validate={required("Please select an account")}
        >
          <CustomSelectInput source="name" resettable />
        </ReferenceInput>
      </SimpleForm>
    </Edit>
  );
};

//To remove delete button from the toolbar
const CustomToolbar = props => (
  <Toolbar {...props}>
    <SaveButton />
  </Toolbar>
);

function OrganisationCategoryInput() {
  return (
    <ReferenceInput
      resource="organisationCategory"
      source="categoryId"
      reference="organisationCategory"
      label="Organisation Category"
      validate={required("Please select a category")}
      sort={{ field: "name", order: "ASC" }}
    >
      <CustomSelectInput source="name" />
    </ReferenceInput>
  );
}

function OrganisationStatusInput() {
  return (
    <ReferenceInput
      resource="organisationStatus"
      source="statusId"
      reference="organisationStatus"
      label="Organisation Status"
      validate={required("Please select a status")}
      sort={{ field: "name", order: "ASC" }}
    >
      <CustomSelectInput source="name" />
    </ReferenceInput>
  );
}

const classes = {
  textField: {
    width: 400,
    marginRight: 10
  },
  select: {
    width: 400,
    height: 40,
    marginTop: 24
  },
  button: {
    marginTop: 40
  },
  inputLabel: {
    marginTop: 15,
    fontSize: 16
  }
};

const textFieldSet = new Set(["name", "dbUser", "schemaName", "mediaDirectory", "usernameSuffix"]);
export const OrganisationCreateComponent = ({ showNotification }) => {
  const [data, setData] = useState({
    name: null,
    dbUser: null,
    schemaName: null,
    mediaDirectory: null,
    usernameSuffix: null,
    categoryId: null,
    statusId: null
  });

  const [errors, setErrors] = useState({});
  const [redirect, setRedirect] = useState(false);

  const [category, categoryError] = useGetData("/organisationCategory");
  const [status, statusError] = useGetData("/organisationStatus");
  const categoryList = category ? category._embedded.organisationCategory.map(ele => ele) : [];
  const statusList = status ? status._embedded.organisationStatus.map(ele => ele) : [];
  const history = useHistory();

  useEffect(() => {
    if (redirect) {
      history.push("/admin/organisation");
    }
  }, [redirect]);

  const handleChange = (property, value) => {
    setData(currentData => ({
      ...currentData,
      [property]: property === "categoryId" || property === "statusId" ? value : value.trimStart().replace(/\s+/g, " ")
    }));
  };

  const handleBlur = (property, value) => {
    setData(currentData => ({ ...currentData, [property]: value.trim() }));
  };

  const handleSubmit = event => {
    event.preventDefault();
    const validationError = validate();
    if (Object.keys(validationError).length !== 0) {
      setErrors(validationError);
      return;
    }
    sendData();
  };
  const validate = () => {
    const errors = {};
    Object.entries(data).forEach(([key, value]) => {
      if (!value || (textFieldSet.has(key) && value.trim() === "")) {
        errors[key] = `This field can't be null`;
      }
    });
    return errors;
  };

  const sendData = () => {
    httpClient
      .post("/organisation", data)
      .then(response => {
        if (response.status && parseInt(response.status) >= 200 && parseInt(response.status) < 300) {
          showNotification(`${data.name} is created successfully`);
          showNotification(`${data.name} is created successfully`);
          setRedirect(true);
        }
      })
      .catch(responseError => {
        const backendError = {};
        if (responseError.response && responseError.response.data) {
          const errorData = responseError.response.data;
          if (errorData.includes("organisation_name_key")) {
            backendError["name"] = `${data.name} is already exist please use other name`;
          }
          if (errorData.includes("organisation_db_user_key")) {
            backendError["dbUser"] = `${data.dbUser} is already exist please use other name`;
          }
          if (errorData.includes("organisation_media_directory_key")) {
            backendError["mediaDirectory"] = `${data.mediaDirectory} is already exist please use other name`;
          }
          if (errorData.includes("organisation_username_suffix_key")) {
            backendError["usernameSuffix"] = `${data.usernameSuffix} is already exist please use other name`;
          }
          if (errorData.includes("organisation_schema_name_key")) {
            backendError["schemaName"] = `${data.schemaName} is already exist please use other name`;
          }
          if (Object.keys(backendError).length !== 0) {
            setErrors(backendError);
            return;
          } else {
            backendError["other"] = errorData;
            setErrors(backendError);
          }
        }
      });
  };

  if (categoryError || statusError) {
    return (
      <>
        <Box
          sx={{
            boxShadow: 2,
            p: 2,
            bgcolor: "background.paper"
          }}
        >
          <Grid container style={{ backgroundColor: "#fff" }} direction="column">
            <h1>Something Went Wrong</h1>
          </Grid>
        </Box>
      </>
    );
  }
  return (
    <>
      <Box
        sx={{
          boxShadow: 2,
          p: 2,
          bgcolor: "background.paper"
        }}
      >
        <Grid container style={{ backgroundColor: "#fff" }} direction="column">
          <Grid item xs={6}>
            <AvniTextField
              id="name"
              label="Name*"
              value={data.name}
              onChange={event => handleChange("name", event.target.value)}
              onBlur={event => handleBlur("name", event.target.value)}
              style={classes.textField}
              margin="normal"
              autoComplete="off"
            />
            {errors.name && <FormHelperText error>{errors.name}</FormHelperText>}
          </Grid>
          <Grid item xs={6}>
            <AvniTextField
              id="dbUser"
              label="DB User*"
              value={data.dbUser}
              onChange={event => handleChange("dbUser", event.target.value)}
              onBlur={event => handleBlur("dbUser", event.target.value)}
              style={classes.textField}
              margin="normal"
              autoComplete="off"
            />
            {errors.dbUser && <FormHelperText error>{errors.dbUser}</FormHelperText>}
          </Grid>
          <Grid item xs={6}>
            <AvniTextField
              id="schemaName"
              label="Schema Name*"
              value={data.schemaName}
              onChange={event => handleChange("schemaName", event.target.value)}
              onBlur={event => handleBlur("schemaName", event.target.value)}
              style={classes.textField}
              margin="normal"
              autoComplete="off"
            />
            {errors.schemaName && <FormHelperText error>{errors.schemaName}</FormHelperText>}
          </Grid>
          <Grid item xs={6}>
            <AvniTextField
              id="mediaDirectory"
              label="Media Directory*"
              value={data.mediaDirectory}
              onChange={event => handleChange("mediaDirectory", event.target.value)}
              onBlur={event => handleBlur("mediaDirectory", event.target.value)}
              style={classes.textField}
              margin="normal"
              autoComplete="off"
            />
            {errors.mediaDirectory && <FormHelperText error>{errors.mediaDirectory}</FormHelperText>}
          </Grid>
          <Grid item xs={6}>
            <AvniTextField
              id="usernameSuffix"
              label="Username Suffix*"
              value={data.usernameSuffix}
              onChange={event => handleChange("usernameSuffix", event.target.value)}
              onBlur={event => handleBlur("usernameSuffix", event.target.value)}
              style={classes.textField}
              margin="normal"
              autoComplete="off"
            />
            {errors.usernameSuffix && <FormHelperText error>{errors.usernameSuffix}</FormHelperText>}
          </Grid>
          <Grid item xs={6}>
            <AvniSelect
              id="categoryId"
              label="Organisation Category*"
              onChange={event => handleChange("categoryId", event.target.value)}
              style={classes.select}
              options={categoryList.map(ele => {
                return (
                  <MenuItem value={ele.id} key={ele.id}>
                    {ele.name}
                  </MenuItem>
                );
              })}
              margin="normal"
            />
            {errors.categoryId && <FormHelperText error>{errors.categoryId}</FormHelperText>}
          </Grid>
          <Grid item xs={6}>
            <AvniSelect
              id="statusId"
              label="Organisation Status*"
              onChange={event => handleChange("statusId", event.target.value)}
              style={classes.select}
              options={statusList.map(ele => {
                return (
                  <MenuItem value={ele.id} key={ele.id}>
                    {ele.name}
                  </MenuItem>
                );
              })}
              margin="normal"
            />
            {errors.statusId && <FormHelperText error>{errors.statusId}</FormHelperText>}
          </Grid>
          <Grid item xs={6}>
            {errors.other && <FormHelperText error>{errors.other}</FormHelperText>}
          </Grid>
          <Grid container item sm={12}>
            <Grid item sm={2}>
              <SaveComponent name="save" onSubmit={handleSubmit} styleClass={{ marginTop: "10px" }} />
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};
OrganisationCreateComponent.propTypes = {
  showNotification: PropTypes.func
};
export const OrganisationCreate = connect(
  null,
  { showNotification: showNotificationAction }
)(OrganisationCreateComponent);
