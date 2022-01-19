import { isDevEnv } from "../common/constants";

const isStagingEnv = window.location.origin === "https://staging.avniproject.org";

export default {
  ENABLE_DECLARATIVE_RULE: isDevEnv || isStagingEnv
};
