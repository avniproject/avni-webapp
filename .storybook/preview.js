import React from "react";
import { ThemeProvider } from "@material-ui/styles";
import { createMuiTheme } from "@material-ui/core/styles";
import * as Colors from "@material-ui/core/colors";

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" }
};

const theme = createMuiTheme({
  palette: {
    primary: Colors.blue,
    secondary: Colors.grey
  }
});

export const decorators = [
  Story => (
    <ThemeProvider theme={theme}>
      <Story />
    </ThemeProvider>
  )
];
