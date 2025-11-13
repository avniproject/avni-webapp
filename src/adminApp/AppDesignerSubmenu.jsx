import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import { useState } from "react";

const Submenu = ({ text, icon, children }) => {
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <>
      <MenuItem onClick={handleClick}>
        <ListItemIcon>
          {open ? <ExpandLess /> : icon || <ExpandMore />}
        </ListItemIcon>
        <ListItemText primary={text} />
      </MenuItem>
      <Collapse
        in={open}
        timeout="auto"
        unmountOnExit
        sx={{
          "& .RaMenuItemLink-icon": {
            paddingLeft: 1,
          },
        }}
      >
        {children}
      </Collapse>
    </>
  );
};

export default Submenu;
