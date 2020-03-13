import React, { Fragment } from "react";
import { TextField } from "@material-ui/core";
import { isNaN, isEmpty } from "lodash";
import { useTranslation } from "react-i18next";

export default ({ formElement: fe, value, update }) => {
  const { t } = useTranslation();

  return (
    <Fragment>
      <TextField
        label={t(fe.display || fe.name)}
        type={"numeric"}
        autoComplete="off"
        required={fe.mandatory}
        name={fe.name}
        value={value}
        fullWidth
        onChange={e => {
          const v = e.target.value;
          isEmpty(v) || isNaN(+v) ? update() : update(+v);
        }}
      />
    </Fragment>
  );
};
