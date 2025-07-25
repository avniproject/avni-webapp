import { AvniAlertDialog } from "./AvniAlertDialog";
import { DialogActionButton } from "./DialogActionButton";
import API from "../api";

export const PublishBroadcast = ({ open, setOpen, setRedirect, news }) => {
  const publishNews = () => {
    API.editNews({ ...news, publishedDate: new Date() }).then(response => {
      if (response.status === 200) {
        setRedirect(true);
      }
    });
  };

  const actions = [];
  actions.push(
    <DialogActionButton
      key={"broadcast"}
      color={"#008b8a"}
      onClick={publishNews}
      textColor={"#ffffff"}
      text={"Publish news"}
    />
  );

  return (
    <AvniAlertDialog
      key={"publish"}
      open={open}
      setOpen={setOpen}
      title={"Publish this news"}
      message={
        "After publishing, this news will be available to the field user after the sync."
      }
      actions={actions}
    />
  );
};
