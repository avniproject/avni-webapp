import React from "react";
import { TextField } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import { isEmpty } from "lodash";
import SubjectValidation from "../views/registration/SubjectValidation";
import { makeStyles } from "@material-ui/core/styles";
import { useTranslation } from "react-i18next";
const useStyles = makeStyles(theme => ({
  errmsg: {
    color: "red"
  }
}));

export default ({ formElement: fe, value, update }) => {
  const { t } = useTranslation();
  return (
    <div>
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
    </div>
  );
};
