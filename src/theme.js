import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: { main: "#ff4f9a" },
    secondary: { main: "#ff7cab" },
    background: {
      default: "#ffe6f2",
      paper: "#ffffff",
    },
  },
  shape: { borderRadius: 20 },
  typography: {
    fontFamily: "Poppins, sans-serif",
    h4: { fontWeight: 700 },
    h6: { fontWeight: 600 },
  },
});

export default theme;