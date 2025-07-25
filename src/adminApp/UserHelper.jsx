import { isEmpty, isEqual } from "lodash";
import {
  email,
  minLength,
  regex,
  required,
  SaveButton,
  TextInput,
  Toolbar
} from "react-admin";
import { isValidPhoneNumber } from "libphonenumber-js";

export const UserTitle = ({ record, titlePrefix }) => {
  return (
    record && (
      <span>
        {titlePrefix} User <b>{record.username}</b>
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

export const UserFilter = [
  <TextInput label="Login ID" source="username" alwaysOn resettable />,
  <TextInput
    label="Name"
    source="name"
    alwaysOn
    autoComplete="off"
    resettable
  />,
  <TextInput label="Email Address" source="email" alwaysOn resettable />,
  <TextInput label="Phone Number" source="phoneNumber" alwaysOn resettable />
];

export const CustomToolbar = props => (
  <Toolbar {...props}>
    <SaveButton />
  </Toolbar>
);

export const PasswordTextField = () => (
  <sub>
    <br />
    Default temporary password is "password". User will
    <br />
    be prompted to set their own password on first login
  </sub>
);

export const isRequired = required("This field is required");
export const doesNotHaveWhitespaces = regex(
  /^\S+$/,
  "This field should not contain whitespaces"
);
export const doesNotStartOrEndWithWhitespaces = regex(
  /^\S$|^\S[\s\S]*\S$/,
  "This field should not start or end with whitespaces"
);

export const validateUserName = [
  isRequired,
  doesNotHaveWhitespaces,
  minLength(4, "Username too small, enter at least 4 characters.")
];

export const validateEmail = [
  isRequired,
  email("Please enter a valid email address")
];

export const validateDisplayName = [
  isRequired,
  doesNotStartOrEndWithWhitespaces
];

const getValidatePhoneValidator = function(region) {
  return value => {
    const isValid = isValidPhoneNumber(value, region);
    return isValid ? undefined : "Invalid phone number";
  };
};

export const getPhoneValidator = function(region) {
  return [
    isRequired,
    doesNotStartOrEndWithWhitespaces,
    getValidatePhoneValidator(region)
  ];
};

export const validatePassword = [
  isRequired,
  doesNotStartOrEndWithWhitespaces,
  minLength(8, "Password too small, enter at least 8 characters.")
];

export const validatePasswords = ({ password, confirmPassword }) => {
  const errors = {};
  if (!isEqual(password, confirmPassword)) {
    errors.confirmPassword = "Password does not match";
  }
  return errors;
};
