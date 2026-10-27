import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import { useState } from "react";
import { useLocation } from "react-router-dom";

const Submenu = ({ text, icon, children }) => {
  const location = useLocation();
  const [open, setOpen] = useState(
    () =>
      location.pathname.startsWith("/appdesigner") &&
      !location.pathname.startsWith("/appdesigner/templates"),
  );
  const handleClick = () => {
    setOpen(!open);
  };
  return (
    <>
      <MenuItem
        onClick={handleClick}
        sx={{
          "& .MuiListItemText-primary": {
            fontWeight: open ? "bold" : "normal",
            wordBreak: "break-word",
            whiteSpace: "normal",
            overflowWrap: "anywhere",
            maxWidth: 180,
          },
          border: "1px solid #E5E5E5",
          backgroundColor: "background.paper",
          wordBreak: "break-word",
          whiteSpace: "normal",
          overflowWrap: "anywhere",
          maxWidth: 220,
          minWidth: 120,
        }}
      >
        <ListItemText primary={text} />
        <ListItemIcon>
          {open ? <ExpandLess /> : icon || <ExpandMore />}
        </ListItemIcon>
      </MenuItem>
      <Collapse
        in={open}
        timeout="auto"
        unmountOnExit
        sx={{
          "& .RaMenuItemLink-icon": {
            paddingLeft: 1,
          },
          paddingLeft: "1rem",
          wordBreak: "break-word",
          whiteSpace: "normal",
          overflowWrap: "anywhere",
        }}
      >
        {children}
      </Collapse>
    </>
  );
};

export default Submenu;
