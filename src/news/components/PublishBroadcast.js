import React from "react";
import { AvniAlertDialog } from "./AvniAlertDialog";
import { DialogActionButton } from "./DialogActionButton";
import API from "../api";

export const PublishBroadcast = ({ open, setOpen, setRedirect, news }) => {
  const publishNews = () => {
    API.editNews({ ...news, publishedDate: new Date() })
      .then(response => {
        if (response.status === 200) {
          setRedirect(true);
        }
      })
      .catch(error => console.error(error));
  };

  const actions = [];
  actions.push(
    <DialogActionButton
      color={"#008b8a"}
      onClick={publishNews}
      textColor={"#ffffff"}
      text={"Broadcast news"}
    />
  );

  return (
    <AvniAlertDialog
      open={open}
      setOpen={setOpen}
      title={"Broadcast this news"}
      message={"After broadcast this news will be available to the field user after the sync."}
      actions={actions}
    />
  );
};
