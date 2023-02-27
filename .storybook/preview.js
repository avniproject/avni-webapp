import React from "react";
import { ThemeProvider } from "@material-ui/styles";
import { createTheme } from "@material-ui/core/styles";
import * as Colors from "@material-ui/core/colors";
import { addDecorator } from "@storybook/react";
import { BrowserRouter } from "react-router-dom";

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" }
};

const theme = createTheme({
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

addDecorator(story => <BrowserRouter initialEntries={["/"]}>{story()}</BrowserRouter>);
