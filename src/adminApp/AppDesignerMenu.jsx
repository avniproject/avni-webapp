import { Menu, useResourceDefinitions } from "react-admin";
import Submenu from "./AppDesignerSubmenu";

export const AppDesignerMenu = () => {
  const resources = useResourceDefinitions();

  const appDesignerResources = Object.keys(resources).filter(
    (name) => name !== "templates",
  );

  return (
    <Menu>
      {resources.templates && (
        <Menu.ResourceItem
          name="templates"
          leftIcon={null}
          sx={{
            color: "#4A4459",
            backgroundColor: "background.paper",
            "&.RaMenuItemLink-active": {
              fontWeight: "bold",
              color: "#4A4459",
            },
            "&.Mui-selected": {
              fontWeight: "bold",
              color: "#4A4459",
            },
          }}
        />
      )}

      <Submenu text="App Designer">
        {appDesignerResources.map((name) => (
          <Menu.ResourceItem key={name} name={name} leftIcon={null} />
        ))}
      </Submenu>
    </Menu>
  );
};
