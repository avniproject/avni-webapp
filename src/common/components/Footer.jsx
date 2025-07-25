import { Link, IconButton } from "@mui/material";

import { Feedback } from "@mui/icons-material";

const Footer = () => (
  <div
    style={{
      position: "fixed",
      borderRadius: 4,
      right: 4,
      bottom: 4,
      zIndex: 1,
      padding: 6,
      paddingHorizontal: 12,
      backgroundColor: "#2196f3",
      textAlign: "center"
    }}
  >
    <div>
      <Link
        component="button"
        variant="body2"
        onClick={() => {
          window.open("https://forms.gle/65q4DkxbS4onroys9", "_blank");
        }}
        style={{ color: "white", fontSize: 18 }}
      >
        <Feedback style={{ color: "white", marginRight: 8 }} />
        Share feedback
      </Link>
    </div>
  </div>
);

export default Footer;
