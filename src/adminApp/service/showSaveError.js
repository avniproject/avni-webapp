import { extractServerErrorMessage } from "../../common/utils/serverErrorMessage";
import { getDBValidationError } from "../../formDesigner/common/ErrorUtil";

export const showSaveError = (error, { setError, setMsgError }) => {
  if (!error.response) {
    setError(extractServerErrorMessage(error, ""));
  } else if (error.response.data?.message) {
    setError(error.response.data.message);
  } else {
    setMsgError(getDBValidationError(error));
  }
};
