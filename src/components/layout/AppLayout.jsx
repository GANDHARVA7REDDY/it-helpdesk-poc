
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";

import AppSidebar from "./AppSidebar";
import AppHeader from "./AppHeader";

function AppLayout() {
  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#f5f7fb",
      }}
    >
      <AppSidebar />

      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <AppHeader />

        <Box
          component="main"
          sx={{
            flex: 1,
            p: { xs: 2, md: 4 },
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

export default AppLayout;
