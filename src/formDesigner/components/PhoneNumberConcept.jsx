import { AvniSwitch } from "../../common/components/AvniSwitch";

export const PhoneNumberConcept = ({ onKeyValueChange, checked }) => {
  const onChange = event =>
    onKeyValueChange(
      { key: "verifyPhoneNumber", value: event.target.checked },
      0
    );
  return (
    <div style={{ marginTop: 10, marginBottom: 10 }}>
      <AvniSwitch
        checked={checked}
        onChange={onChange}
        name="Switch on Verification"
        toolTipKey={"APP_DESIGNER_PHONE_NUMBER_VERIFICATION"}
      />
    </div>
  );
};
