import { Menu, useResourceDefinitions } from "react-admin";
import Submenu from "./AppDesignerSubmenu";

export const AppDesignerMenu = () => {
  const resources = useResourceDefinitions();

  const appDesignerResources = Object.keys(resources).filter(
    (name) => name !== "templates",
  );

  return (
    <Menu>
      {resources.templates && <Menu.ResourceItem name="templates" />}

      <Submenu text="App Designer">
        {appDesignerResources.map((name) => (
          <Menu.ResourceItem key={name} name={name} />
        ))}
      </Submenu>
    </Menu>
  );
};
