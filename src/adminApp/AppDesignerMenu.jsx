import { Menu, useResourceDefinitions } from "react-admin";
import Submenu from "./AppDesignerSubmenu";

export const AppDesignerMenu = () => {
  const resources = useResourceDefinitions();

  const appDesignerResources = Object.keys(resources).filter(
    (name) => name !== "templates",
  );

  return (
    <Menu
      sx={{
        width: "100%",
        minWidth: 0,
        maxWidth: "100vw",
        overflowX: "auto",
        overflowY: "auto",
        wordBreak: "break-word",
        whiteSpace: "normal",
        backgroundColor: "background.paper",
        borderRight: "1px solid #E5E5E5",
        boxSizing: "border-box",
        hyphens: "auto",
      }}
    >
      {resources.templates && (
        <Menu.ResourceItem
          name="templates"
          leftIcon={null}
          sx={{
            color: "#4A4459",
            backgroundColor: "background.paper",
            wordBreak: "break-word",
            whiteSpace: "normal",
            overflowWrap: "anywhere",
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
          <Menu.ResourceItem
            key={name}
            name={name}
            leftIcon={null}
            sx={{
              wordBreak: "break-word",
              whiteSpace: "normal",
              overflowWrap: "anywhere",
              maxWidth: 220,
              minWidth: 120,
            }}
          />
        ))}
      </Submenu>
    </Menu>
  );
};
