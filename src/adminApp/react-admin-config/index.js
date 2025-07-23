import { authProvider } from "./authProvider";
import dataProviderFactory from "./dataProvider";
import LogoutButton from "./LogoutButton";

// Create the actual dataProvider by calling the factory with empty string
// since the application uses relative URLs
const dataProvider = dataProviderFactory("");

export { authProvider, dataProvider, LogoutButton };
