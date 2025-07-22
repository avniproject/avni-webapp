import { useState } from "react";
import PropTypes from "prop-types";
import { useDataProvider, useNotify, useRefresh, Confirm } from "react-admin";
import { Button } from "@mui/material";
import Colors from "../../dataEntryApp/Colors";

const EnableDisableButton = ({ record, resource, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const refresh = useRefresh();

  const handleClick = () => {
    setIsOpen(true);
  };

  const handleDialogClose = () => {
    setIsOpen(false);
  };

  const handleConfirm = async () => {
    try {
      await dataProvider.update(resource, {
        id: `${record.id}/disable?disable=${!disabled}`,
        previousData: record,
        data: record
      });
      notify(`${disabled ? "Enabled" : "Disabled"} successfully`, { type: "info" });
      refresh();
    } catch (error) {
      notify(`Error: ${error.message}`, { type: "warning" });
    } finally {
      setIsOpen(false);
    }
  };

  const buttonLabel = disabled ? "Enable user" : "Disable user";

  return (
    <>
      <Button onClick={handleClick} style={{ color: Colors.ValidationError }}>
        {buttonLabel}
      </Button>
      <Confirm
        isOpen={isOpen}
        title={`${buttonLabel} ${record.username}`}
        content={`Are you sure you want to ${buttonLabel}?`}
        onConfirm={handleConfirm}
        onClose={handleDialogClose}
      />
    </>
  );
};

EnableDisableButton.propTypes = {
  record: PropTypes.object.isRequired,
  resource: PropTypes.string.isRequired,
  disabled: PropTypes.bool.isRequired
};

export default EnableDisableButton;
