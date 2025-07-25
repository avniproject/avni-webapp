import { AvniSwitch } from "../../common/components/AvniSwitch";

export const ImageV2Concept = ({ onKeyValueChange, checked }) => {
  const onChange = event =>
    onKeyValueChange(
      { key: "captureLocationInformation", value: event.target.checked },
      0
    );
  return (
    <div style={{ marginTop: 10, marginBottom: 10 }}>
      <AvniSwitch
        checked={checked}
        onChange={onChange}
        name="Capture Location Information"
        toolTipKey={"APP_DESIGNER_CAPTURE_LOCATION_INFORMATION"}
      />
    </div>
  );
};
