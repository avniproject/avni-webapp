import TemplatesIcon from "../icons/templates.svg?react";
import StartFreshIcon from "../icons/start-fresh.svg?react";

const iconMap = {
  templates: TemplatesIcon,
  startFresh: StartFreshIcon,
};

const Icon = ({
  name,
  width = 24,
  height = 24,
  className = "",
  color = "currentColor",
  ...props
}) => {
  const IconComponent = iconMap[name];

  if (!IconComponent) {
    console.warn(
      `Icon "${name}" not found. Available icons: ${Object.keys(iconMap).join(", ")}`,
    );
    return null;
  }

  return (
    <IconComponent
      width={width}
      height={height}
      className={className}
      style={{ color }}
      {...props}
    />
  );
};

export default Icon;
