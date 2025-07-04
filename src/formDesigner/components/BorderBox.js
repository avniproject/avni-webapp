import { Box } from "@mui/material";

export default ({ children }) => {
  return (
    <Box
      sx={{
        border: 1,
        my: 2,
        borderColor: "#ddd",
        p: 2
      }}
    >
      {children}
    </Box>
  );
};
