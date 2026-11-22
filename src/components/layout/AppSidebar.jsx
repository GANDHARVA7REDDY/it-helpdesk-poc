
import {
  Box,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";

import { NavLink } from "react-router-dom";

import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";

const navigationItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: <DashboardOutlinedIcon />,
  },
  {
    label: "Ticket Management",
    path: "/tickets",
    icon: <ConfirmationNumberOutlinedIcon />,
  },
  {
    label: "Create Ticket",
    path: "/create-ticket",
    icon: <AddCircleOutlineOutlinedIcon />,
  },
];

function AppSidebar() {
  return (
    <Box
      component="aside"
      sx={{
        width: 250,
        minWidth: 250,
        minHeight: "100vh",
        backgroundColor: "#ffffff",
        borderRight: "1px solid #e5e7eb",
        display: "flex",
        flexDirection: "column",
        p: 2,
      }}
    >
      {/* Application Logo */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 1,
          py: 2,
          mb: 2,
        }}
      >
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: 2,
            backgroundColor: "#2563eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
          }}
        >
          <SupportAgentIcon fontSize="large" />
        </Box>

        <Box>
          <Typography fontWeight={700} fontSize={17}>
            IT Helpdesk
          </Typography>

          <Typography variant="caption" color="text.secondary">
            Support Portal
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 3 }} />

      <Typography
        variant="caption"
        color="text.secondary"
        fontWeight={700}
        sx={{ px: 1.5, mb: 1 }}
      >
        MAIN MENU
      </Typography>

      {/* Navigation Items */}
      <List disablePadding>
        {navigationItems.map((item) => (
          <ListItemButton
            key={item.path}
            component={NavLink}
            to={item.path}
            end={item.path === "/dashboard"}
            sx={{
              borderRadius: 2,
              mb: 0.8,
              py: 1.3,

              "&.active": {
                backgroundColor: "#eff6ff",
                color: "#2563eb",
              },

              "&.active:hover": {
                backgroundColor: "#dbeafe",
              },

              "&:hover": {
                backgroundColor: "#f3f4f6",
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 42,
                color: "inherit",
              }}
            >
              {item.icon}
            </ListItemIcon>

            <ListItemText
              primary={
                <Typography fontSize={14} fontWeight={600}>
                  {item.label}
                </Typography>
              }
            />
          </ListItemButton>
        ))}
      </List>

      {/* Sidebar Footer */}
      <Box sx={{ mt: "auto", pt: 3 }}>
        <Divider sx={{ mb: 2 }} />

        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            backgroundColor: "#f8fafc",
          }}
        >
          <Typography fontWeight={600} fontSize={13}>
            Need assistance?
          </Typography>

          <Typography
            variant="caption"
            color="text.secondary"
          >
            Contact your IT support team for help.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default AppSidebar;
