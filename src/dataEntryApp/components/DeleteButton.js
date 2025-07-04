import { Button } from "@mui/material";

import { useTranslation } from "react-i18next";

export const DeleteButton = ({ onDelete }) => {
  const { t } = useTranslation();
  return (
    <Button style={{ color: "red", marginLeft: "10px" }} onClick={onDelete}>
      {t("delete")}
    </Button>
  );
};
