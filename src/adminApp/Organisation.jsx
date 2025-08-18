import { useEffect, useState } from "react";
import {
  BooleanField,
  Datagrid,
  Edit,
  Filter,
  List,
  ReferenceField,
  ReferenceInput,
  required,
  SaveButton,
  ShowButton,
  SimpleForm,
  TextField,
  TextInput,
  Toolbar,
  useRecordContext,
  useNotify,
} from "react-admin";
import { Title } from "./components/Title";
import OpenOrganisation from "./components/OpenOrganisation";
import ToggleAnalyticsButton from "./ToggleAnalyticsButton";
import { Box, Grid, FormHelperText, Stack } from "@mui/material";
import { AvniTextField } from "../common/components/AvniTextField";
import { SaveComponent } from "../common/components/SaveComponent";
import { AvniSelect } from "../common/components/AvniSelect";
import useGetData from "../custom-hooks/useGetData";
import { httpClient } from "../common/utils/httpClient";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import {
  StyledBox,
  StyledTextInput,
  datagridStyles,
  StyledSelectInput,
  StyledShow,
  StyledSimpleShowLayout,
} from "./Util/Styles";
import { PrettyPagination } from "./Util/PrettyPagination.tsx";
export const OrganisationFilter = (props) => (
  <Filter {...props} style={{ marginBottom: "2em" }}>
    <StyledTextInput
      label="Organisation Name"
      source="name"
      resettable={false}
      alwaysOn
    />
  </Filter>
);

export const OrganisationList = ({ ...props }) => {
  return (
    <StyledBox>
      <List
        {...props}
        bulkActionButtons={false}
        filter={{ searchURI: "find" }}
        sort={{ field: "id", order: "DESC" }}
        filters={<OrganisationFilter />}
        pagination={<PrettyPagination />}
      >
        <Datagrid bulkActionButtons={false} sx={datagridStyles}>
          <TextField source="name" label="Name" />
          <ReferenceField
            label="Category"
            source="categoryId"
            reference="organisationCategory"
            link={false}
            sortBy={"category.name"}
          >
            <TextField source="name" />
          </ReferenceField>
          <ReferenceField
            label="Parent organisation"
            source="parentOrganisationId"
            reference="organisation"
            link="show"
          >
            <TextField source="name" />
          </ReferenceField>
          <TextField source="dbUser" label="DB User" sortBy={"dbUser"} />
          <TextField
            source="schemaName"
            label="Schema Name"
            sortBy={"schemaName"}
          />
          <TextField
            source="mediaDirectory"
            label="Media Directory"
            sortBy={"mediaDirectory"}
          />
          <TextField
            source="usernameSuffix"
            label="Username Suffix"
            sortBy={"usernameSuffix"}
          />
          <ReferenceField
            resource="organisationStatus"
            source="statusId"
            reference="organisationStatus"
            label="Status"
            link={false}
            sortBy={"status.name"}
          >
            <TextField source="name" />
          </ReferenceField>
          <BooleanField
            source="analyticsDataSyncActive"
            label="Active analytics data sync"
            sortable={false}
          />
          <ShowButton />
          <OpenOrganisation />
        </Datagrid>
      </List>
    </StyledBox>
  );
};

export const OrganisationDetails = (props) => {
  return (
    <StyledShow title={<Title title={"Organisation"} />} {...props}>
      <StyledSimpleShowLayout>
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
          link={false}
        >
          <TextField source="name" />
        </ReferenceField>
        <ReferenceField
          resource="organisationStatus"
          source="statusId"
          reference="organisationStatus"
          label="Status"
          link={false}
        >
          <TextField source="name" />
        </ReferenceField>
        <ReferenceField
          resource="account"
          source="accountId"
          reference="account"
          label="Account Name"
          link="show"
        >
          <TextField source="name" />
        </ReferenceField>
        <ReferenceField
          label="Parent organisation"
          source="parentOrganisationId"
          reference="organisation"
          link="show"
        >
          <TextField source="name" />
        </ReferenceField>
        <BooleanField
          source="analyticsDataSyncActive"
          label="Active analytics data sync"
        />
      </StyledSimpleShowLayout>
    </StyledShow>
  );
};

const isRequired = required("This field is required");

const EditForm = () => {
  const record = useRecordContext();

  return (
    <SimpleForm toolbar={<CustomToolbar />} redirect="list">
      {record && record.id === "1" ? (
        <TextInput disabled source="name" validate={isRequired} />
      ) : (
        <TextInput source="name" validate={isRequired} autoComplete="off" />
      )}
      <TextInput disabled source="dbUser" validate={isRequired} />
      <TextInput disabled source="schemaName" validate={isRequired} />
      <TextInput disabled source="mediaDirectory" />
      {/* Hidden inputs to preserve critical fields in form submission */}
      <TextInput source="dbUser" style={{ display: "none" }} />
      <TextInput source="schemaName" style={{ display: "none" }} />
      <TextInput source="mediaDirectory" style={{ display: "none" }} />
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
      >
        <StyledSelectInput
          source="name"
          validate={required("Please select an account")}
          resettable
        />
      </ReferenceInput>
    </SimpleForm>
  );
};

export const OrganisationEdit = (props) => {
  return (
    <Edit
      mutationMode="pessimistic"
      title={<Title title={"Edit Organisation"} />}
      {...props}
    >
      <EditForm />
    </Edit>
  );
};

//To remove delete button from the toolbar
const CustomToolbar = (props) => (
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
      sort={{ field: "name", order: "ASC" }}
    >
      <StyledSelectInput
        source="name"
        validate={required("Please select a category")}
      />
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
      sort={{ field: "name", order: "ASC" }}
    >
      <StyledSelectInput
        source="name"
        validate={required("Please select a status")}
      />
    </ReferenceInput>
  );
}

const textFieldSet = new Set([
  "name",
  "dbUser",
  "schemaName",
  "mediaDirectory",
  "usernameSuffix",
]);

export const OrganisationCreateComponent = () => {
  const notify = useNotify();
  const [data, setData] = useState({
    name: null,
    dbUser: null,
    schemaName: null,
    mediaDirectory: null,
    usernameSuffix: null,
    categoryId: null,
    statusId: null,
  });

  const [errors, setErrors] = useState({});
  const [redirect, setRedirect] = useState(false);

  const [category, categoryError] = useGetData("/organisationCategory");
  const [status, statusError] = useGetData("/organisationStatus");
  const categoryList = category
    ? category._embedded.organisationCategory.map((ele) => ele)
    : [];
  const statusList = status
    ? status._embedded.organisationStatus.map((ele) => ele)
    : [];
  const navigate = useNavigate();

  useEffect(() => {
    if (redirect) {
      navigate("/admin/organisation");
    }
  }, [redirect, navigate]);

  const handleChange = (property, value) => {
    setData((currentData) => ({
      ...currentData,
      [property]:
        property === "categoryId" || property === "statusId"
          ? value
          : value.trimStart().replace(/\s+/g, " "),
    }));
  };

  const handleBlur = (property, value) => {
    setData((currentData) => ({ ...currentData, [property]: value.trim() }));
  };

  const handleSubmit = (event) => {
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
      .then((response) => {
        if (
          response.status &&
          parseInt(response.status) >= 200 &&
          parseInt(response.status) < 300
        ) {
          notify(`${data.name} is created successfully`);
          setRedirect(true);
        }
      })
      .catch((responseError) => {
        const backendError = {};
        if (responseError.response && responseError.response.data) {
          const errorData = responseError.response.data;
          if (errorData.includes("organisation_name_key")) {
            backendError["name"] = `${
              data.name
            } is already exist please use other name`;
          }
          if (errorData.includes("organisation_db_user_key")) {
            backendError["dbUser"] = `${
              data.dbUser
            } is already exist please use other name`;
          }
          if (errorData.includes("organisation_media_directory_key")) {
            backendError["mediaDirectory"] = `${
              data.mediaDirectory
            } is already exist please use other name`;
          }
          if (errorData.includes("organisation_username_suffix_key")) {
            backendError["usernameSuffix"] = `${
              data.usernameSuffix
            } is already exist please use other name`;
          }
          if (errorData.includes("organisation_schema_name_key")) {
            backendError["schemaName"] = `${
              data.schemaName
            } is already exist please use other name`;
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
            bgcolor: "background.paper",
          }}
        >
          <Grid
            container
            style={{ backgroundColor: "#fff" }}
            direction="column"
          >
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
          bgcolor: "background.paper",
        }}
      >
        <Stack>
          <Grid>
            <AvniTextField
              id="name"
              label="Name*"
              value={data.name}
              onChange={(event) => handleChange("name", event.target.value)}
              onBlur={(event) => handleBlur("name", event.target.value)}
              sx={{
                width: "25rem",
                marginRight: "0.625rem",
              }}
              margin="normal"
              autoComplete="off"
            />
            {errors.name && (
              <FormHelperText error>{errors.name}</FormHelperText>
            )}
          </Grid>
          <Grid>
            <AvniTextField
              id="dbUser"
              label="DB User*"
              value={data.dbUser}
              onChange={(event) => handleChange("dbUser", event.target.value)}
              onBlur={(event) => handleBlur("dbUser", event.target.value)}
              sx={{
                width: "25rem",
                marginRight: "0.625rem",
              }}
              margin="normal"
              autoComplete="off"
            />
            {errors.dbUser && (
              <FormHelperText error>{errors.dbUser}</FormHelperText>
            )}
          </Grid>
          <Grid>
            <AvniTextField
              id="schemaName"
              label="Schema Name*"
              value={data.schemaName}
              onChange={(event) =>
                handleChange("schemaName", event.target.value)
              }
              onBlur={(event) => handleBlur("schemaName", event.target.value)}
              sx={{
                width: "25rem",
                marginRight: "0.625rem",
              }}
              margin="normal"
              autoComplete="off"
            />
            {errors.schemaName && (
              <FormHelperText error>{errors.schemaName}</FormHelperText>
            )}
          </Grid>
          <Grid>
            <AvniTextField
              id="mediaDirectory"
              label="Media Directory*"
              value={data.mediaDirectory}
              onChange={(event) =>
                handleChange("mediaDirectory", event.target.value)
              }
              onBlur={(event) =>
                handleBlur("mediaDirectory", event.target.value)
              }
              sx={{
                width: "25rem",
                marginRight: "0.625rem",
              }}
              margin="normal"
              autoComplete="off"
            />
            {errors.mediaDirectory && (
              <FormHelperText error>{errors.mediaDirectory}</FormHelperText>
            )}
          </Grid>
          <Grid>
            <AvniTextField
              id="usernameSuffix"
              label="Username Suffix*"
              value={data.usernameSuffix}
              onChange={(event) =>
                handleChange("usernameSuffix", event.target.value)
              }
              onBlur={(event) =>
                handleBlur("usernameSuffix", event.target.value)
              }
              sx={{
                width: "25rem",
                marginRight: "0.625rem",
              }}
              margin="normal"
              autoComplete="off"
            />
            {errors.usernameSuffix && (
              <FormHelperText error>{errors.usernameSuffix}</FormHelperText>
            )}
          </Grid>
          <Grid>
            <AvniSelect
              id="categoryId"
              label="Organisation Category*"
              value={data.categoryId}
              onChange={(event) =>
                handleChange("categoryId", event.target.value)
              }
              sx={{
                width: "25rem",
                height: "2.5rem",
                marginTop: "1rem",
              }}
              options={categoryList.map((ele) => ({
                value: ele.id,
                label: ele.name,
              }))}
              margin="normal"
            />
            {errors.categoryId && (
              <FormHelperText error>{errors.categoryId}</FormHelperText>
            )}
          </Grid>
          <Grid>
            <AvniSelect
              id="statusId"
              label="Organisation Status*"
              value={data.statusId}
              onChange={(event) => handleChange("statusId", event.target.value)}
              sx={{
                width: "25rem",
                height: "2.5rem",
                marginTop: "1rem",
                marginBottom: "1rem",
              }}
              options={statusList.map((ele) => ({
                value: ele.id,
                label: ele.name,
              }))}
              margin="normal"
            />
            {errors.statusId && (
              <FormHelperText error>{errors.statusId}</FormHelperText>
            )}
          </Grid>
          <Grid>
            {errors.other && (
              <FormHelperText error>{errors.other}</FormHelperText>
            )}
          </Grid>
          <Grid
            container
            size={{
              sm: 12,
            }}
          >
            <Grid
              size={{
                sm: 2,
              }}
            >
              <SaveComponent
                name="save"
                onSubmit={handleSubmit}
                styles={{ marginTop: "0.625rem" }}
              />
            </Grid>
          </Grid>
        </Stack>
      </Box>
    </>
  );
};

OrganisationCreateComponent.propTypes = {
  showNotification: PropTypes.func,
};

export const OrganisationCreate = OrganisationCreateComponent;
