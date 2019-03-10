import Auth from "@aws-amplify/auth";
import { AWS_REGION } from "../common/constants";

export const configureAuth = config => {
    Auth.configure({
        mandatorySignIn: true,
        region: config.region || AWS_REGION,
        userPoolId: config.poolId,
        userPoolWebClientId: config.clientId
    });
};
