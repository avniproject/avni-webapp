import React from "react";
import { TextField } from "@material-ui/core";
import { isEmpty } from "lodash";
import { useTranslation } from "react-i18next";

export default ({ formElement: fe, value, update }) => {
  const { t } = useTranslation();

  return (
    <TextField
      label={t(fe.display || fe.name)}
      type={"text"}
      autoComplete="off"
      required={fe.mandatory}
      name={fe.name}
      value={value}
      style={{ width: "30%" }}
      onChange={e => {
        const v = e.target.value;
        isEmpty(v) ? update() : update(v);
      }}
    />
  );
};
