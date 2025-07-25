import Button from "./Button";

const FloatingButton = ({
  btnLabel,
  btnClass,
  btnClick,
  btnDisabled,
  id,
  left
}) => {
  const floatingStyle = {
    margin: 0,
    top: "auto",
    left: left,
    bottom: 20,
    position: "fixed"
  };

  return (
    <Button
      btnLabel={btnLabel}
      btnClass={btnClass}
      btnClick={btnClick}
      btnDisabled={btnDisabled}
      id={id}
      style={floatingStyle}
    />
  );
};

export default FloatingButton;
