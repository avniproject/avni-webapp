import { Button } from "@mui/material";
import { useTranslation } from "react-i18next";

const FormWizardButton = ({
  text,
  className,
  to,
  params,
  onClick,
  disabled,
  id,
}) => {
  const { t } = useTranslation();
  return (
    <Button
      disabled={disabled}
      className={className}
      onClick={onClick}
      type="button"
      id={id}
    >
      {t(text)}
    </Button>
  );
};

export default FormWizardButton;
