import React from "react";
import {
  ArrayInput,
  CardActions,
  Create,
  CreateButton,
  Datagrid,
  Edit,
  ExportButton,
  FunctionField,
  List,
  Show,
  SimpleForm,
  SimpleShowLayout
} from "react-admin";
import { LocaleSelectInput } from "./components/LocaleSelectInput";
import { localeChoices } from "./user";
import { isNil } from "lodash";

const formatLocale = languages => {
  return localeChoices
    .filter(locale => languages.includes(locale.id))
    .map(locale => `${locale.name}(${locale.id})`)
    .join(", ");
};

const ExportButtonComponent = ({ total, resource, currentSort, filterValues, exporter }) => (
  <ExportButton
    disabled={total === 0}
    resource={resource}
    sort={currentSort}
    filter={filterValues}
    exporter={exporter}
  />
);

const CustomCreateActions = props => {
  const { total, basePath } = props;
  return total === 0 ? (
    <CardActions style={{ zIndex: 2, display: "inline-block", float: "right" }}>
      <CreateButton basePath={basePath} />
      <ExportButtonComponent {...props} />
    </CardActions>
  ) : (
    <CardActions style={{ zIndex: 2, display: "inline-block", float: "right" }}>
      <ExportButtonComponent {...props} />
    </CardActions>
  );
};

export const organisationConfigList = props => (
  <List
    title={"Organisation config"}
    {...props}
    bulkActions={false}
    actions={<CustomCreateActions {...props} />}
  >
    <Datagrid rowClick="show">
      <FunctionField
        label="Languages"
        render={conf => (!isNil(conf.settings) ? formatLocale(conf.settings.languages) : "")}
      />
    </Datagrid>
  </List>
);

export const organisationConfigDetail = props => {
  return (
    <Show title={"Organisation config"} {...props}>
      <SimpleShowLayout>
        <FunctionField
          label="Languages"
          render={conf => (!isNil(conf.settings) ? formatLocale(conf.settings.languages) : "")}
        />
      </SimpleShowLayout>
    </Show>
  );
};

export const organisationConfigCreate = props => (
  <Create title="Add organisation config" {...props}>
    <SimpleForm>
      <ArrayInput source="settings.languages" label="">
        <LocaleSelectInput />
      </ArrayInput>
    </SimpleForm>
  </Create>
);

export const organisationConfigEdit = props => (
  <Edit title="Edit config" {...props} undoable={false}>
    <SimpleForm>
      <ArrayInput source="settings.languages" label="">
        <LocaleSelectInput />
      </ArrayInput>
    </SimpleForm>
  </Edit>
);
