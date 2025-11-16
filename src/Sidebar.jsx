import { Box, Typography, Button } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ListIcon from "@mui/icons-material/List";
import UploadIcon from "@mui/icons-material/Upload";
import FavoriteIcon from "@mui/icons-material/Favorite";

export default function Sidebar() {
  return (
    <Box
      sx={{
        width: 240,
        height: "100vh",
        background: "rgba(255, 255, 255, 0.25)",
        backdropFilter: "blur(25px)",
        borderRight: "1px solid rgba(255, 255, 255, 0.4)",
        p: 3,
        boxShadow: "4px 0 20px rgba(255, 105, 180, 0.15)",
      }}
    >
      <Typography
        variant="h6"
        fontWeight={700}
        sx={{
          background: "linear-gradient(90deg, #ff6fb5, #ff9fda)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          mb: 4,
        }}
      >
        🎀 Glass Pink
      </Typography>

      <MenuItem icon={<DashboardIcon />} text="Dashboard" />
      <MenuItem icon={<ListIcon />} text="FIFO Queue" />
      <MenuItem icon={<UploadIcon />} text="Upload CSV" />
      <MenuItem icon={<FavoriteIcon />} text="Cute Mode" />
    </Box>
  );
}

function MenuItem({ icon, text }) {
  return (
    <Button
      fullWidth
      startIcon={icon}
      sx={{
        justifyContent: "flex-start",
        color: "#d64c94",
        mb: 1,
        borderRadius: "15px",
        padding: "10px 15px",
        "&:hover": {
          background: "rgba(255, 255, 255, 0.5)",
          backdropFilter: "blur(30px)",
        },
      }}
    >
      {text}
    </Button>
  );
}