import React from "react";
import { isEmpty, isNil } from "lodash";
import { phoneCountryPrefix } from "../common/constants";
import { email, Filter, regex, required, SaveButton, TextInput, Toolbar } from "react-admin";

export const UserTitle = ({ record, titlePrefix }) => {
  return (
    record && (
      <span>
        {titlePrefix} user <b>{record.username}</b>
      </span>
    )
  );
};

export const formatRoles = roles =>
  !isEmpty(roles) && // check required thanks to optimistic rendering shenanigans
  roles
    .map(role =>
      role
        .split("_")
        .map(word => word.replace(word[0], word[0].toUpperCase()))
        .join(" ")
    )
    .join(", ");

export const UserFilter = props => (
  <Filter {...props} style={{ marginBottom: "2em" }}>
    <TextInput label="Login ID" source="username" resettable alwaysOn />
    <TextInput label="Name" source="name" resettable alwaysOn />
    <TextInput label="Email Address" source="email" resettable alwaysOn />
    <TextInput label="Phone Number" source="phoneNumber" resettable alwaysOn />
  </Filter>
);

export const CustomToolbar = props => (
  <Toolbar {...props}>
    <SaveButton />
  </Toolbar>
);

export const PasswordTextField = props => (
  <sub>
    <br />
    Default temporary password is "password". User will
    <br />
    be prompted to set their own password on first login
  </sub>
);

export const mobileNumberFormatter = (v = "") =>
  isNil(v) ? v : v.substring(phoneCountryPrefix.length);
export const mobileNumberParser = v =>
  v.startsWith(phoneCountryPrefix) ? v : phoneCountryPrefix.concat(v);

export const isRequired = required("This field is required");
export const validateEmail = [isRequired, email("Please enter a valid email address")];
export const validatePhone = [
  isRequired,
  regex(/[0-9]{12}/, "Enter a 10 digit number (eg. 9820324567)")
];
