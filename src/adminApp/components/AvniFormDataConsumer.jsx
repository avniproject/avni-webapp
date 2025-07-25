import { useFormContext, useWatch } from "react-hook-form";
import { ToolTipContainer } from "../../common/components/ToolTipContainer";

export const AvniFormDataConsumer = ({ toolTipKey, children, ...props }) => {
  const form = useFormContext();
  const formData = useWatch({ control: form.control });

  return (
    <ToolTipContainer toolTipKey={toolTipKey}>
      {children({ formData, ...form, ...props })}
    </ToolTipContainer>
  );
};
