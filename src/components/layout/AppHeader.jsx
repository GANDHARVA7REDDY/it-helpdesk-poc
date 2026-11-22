
import {
  AppBar,
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Toolbar,
  Typography,
} from "@mui/material";

import { useUser } from "../../context/UserContext";

function AppHeader() {
  const {
    users,
    selectedUserId,
    setSelectedUserId,
    selectedUser,
  } = useUser();

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        backgroundColor: "#ffffff",
        color: "#172b4d",
        borderBottom: "1px solid #e5eaf1",
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        {/* HEADER TITLE */}

        <Box>
          <Typography
            variant="h6"
            fontWeight={700}
            color="#172b4d"
          >
            IT Helpdesk
          </Typography>

          <Typography
            variant="caption"
            color="text.secondary"
          >
            Ticket Management System
          </Typography>
        </Box>

        {/* USER SWITCHER */}

        <FormControl
          size="small"
          sx={{
            minWidth: { xs: 180, sm: 260 },
          }}
        >
          <InputLabel>Switch User</InputLabel>

          <Select
            value={selectedUserId}
            label="Switch User"
            onChange={(e) =>
              setSelectedUserId(e.target.value)
            }
          >
            {users.map((user) => (
              <MenuItem
                key={user.id}
                value={user.id}
              >
                {user.name} ({user.role})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Toolbar>
    </AppBar>
  );
}

export default AppHeader;
