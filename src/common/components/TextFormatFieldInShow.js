import { TextFieldInShow } from "./TextFieldInShow";

export const TextFormatFieldInShow = ({ format, label }) => {
  return (
    <>
      <TextFieldInShow text={format.regex} label={`${label} Format`} />
      <TextFieldInShow text={format.descriptionKey} label={`${label} Description Key`} />
    </>
  );
};
