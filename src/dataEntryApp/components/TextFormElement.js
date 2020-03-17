import React from "react";
import { TextField } from "@material-ui/core";
import Typography from '@material-ui/core/Typography';
import { isEmpty } from "lodash";
import SubjectValidation from '../views/registration/SubjectValidation';
import { makeStyles } from "@material-ui/core/styles";
import { useTranslation } from "react-i18next";
const useStyles = makeStyles(theme => ({
  errmsg: {
    color: "red"
  }
}));


export default ({ formElement: fe, value, update }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  console.log("------------fe.name", fe.concept.datatype);
  console.log("------------fe.name", fe.mandatory);
  console.log("------------fe.name", fe);
  const [texterrormsg, setTextErrorMsg] = React.useState("");
  const [numaricerrormsg, setNumaricErrorMsg] = React.useState("");
  const [contacterrormsg, setContactErrorMsg] = React.useState("");
  if (fe.name === "Husband/Father name" || fe.name === "Mother's name") {
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
            // props.updateSubject("firstName", e.target.value);
            const validationMsg = SubjectValidation.dynamicformstring("Text", e.target.value);
            // console.log("messageKey---->", validationMsg.messageKey);
            let texterrormsg = validationMsg.messageKey
            console.log("messageKey---->", texterrormsg);
            setTextErrorMsg(texterrormsg);
          }}
        />
        {texterrormsg && <Typography className={classes.errmsg} variant="caption" display="block" gutterBottom> {texterrormsg} </Typography>}
      </div>
    );
  } else if (fe.concept.datatype === "Text" && (fe.name === "Sangam number")) {
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
            // props.updateSubject("firstName", e.target.value);
            const validationMsg = SubjectValidation.numaricvalidation("Numaric", e.target.value);
            // console.log("messageKey---->", validationMsg.messageKey);
            let numaricerrormsg = validationMsg.messageKey
            console.log("messageKey---->", numaricerrormsg);
            setNumaricErrorMsg(numaricerrormsg);
          }}
        />
        {numaricerrormsg && <Typography className={classes.errmsg} variant="caption" display="block" gutterBottom> {numaricerrormsg} </Typography>}
      </div>
    );
  } else if (fe.concept.datatype === "Text" && fe.name === "Contact number") {
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
            // props.updateSubject("firstName", e.target.value);
            const validationMsg = SubjectValidation.contactvalidation("Numaric", e.target.value);
            // console.log("messageKey---->", validationMsg.messageKey);
            let contacterrormsg = validationMsg.messageKey
            console.log("messageKey---->", contacterrormsg);
            setContactErrorMsg(contacterrormsg);
          }}
        />
        {contacterrormsg && <Typography className={classes.errmsg} variant="caption" display="block" gutterBottom> {contacterrormsg} </Typography>}
      </div>
    );
  } else {
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
  }
}
