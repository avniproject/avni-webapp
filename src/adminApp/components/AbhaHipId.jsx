import { TextField } from "react-admin";
import { useSelector } from "react-redux";
import { has, isNil } from "lodash";
import { AvniTextInput } from "./AvniTextInput";
import { doesNotHaveWhitespaces } from "../UserHelper";

const LABEL = "ABHA health facility ID";
const SOURCE = "settings.abhaHipId";

const useIsAbhaEnabled = () =>
  useSelector((state) => state.app.organisationConfig?.enableAbha);

export const AbhaHipIdInput = () =>
  useIsAbhaEnabled() ? (
    <AvniTextInput
      source={SOURCE}
      validate={doesNotHaveWhitespaces}
      label={LABEL}
      toolTipKey={"ADMIN_USER_SETTINGS_ABHA_HIP_ID"}
    />
  ) : null;

export const AbhaHipIdField = () =>
  useIsAbhaEnabled() ? <TextField label={LABEL} source={SOURCE} /> : null;

// react-admin hands a cleared text input over as null. The server removes the health centre only
// when it is sent "", and keeps it when the key is missing.
export const abhaHipIdForSave = (data) =>
  has(data, SOURCE) && isNil(data.settings.abhaHipId)
    ? { ...data, settings: { ...data.settings, abhaHipId: "" } }
    : data;
