
import { useTickets } from "../context/TicketContext";

import {
  Box,
  Paper,
  Typography,
  Divider,
} from "@mui/material";

// Reusable Statistic Card Component
function StatisticsCard({ stat }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: "1px solid #e5e7eb",
        backgroundColor: "#ffffff",
        transition: "0.2s",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: "0px 5px 18px rgba(0,0,0,0.06)",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mb: 2,
        }}
      >
        <Box
          sx={{
            width: 44,
            height: 44,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 2,
            backgroundColor: stat.background,
          }}
        >
          <Typography
            fontWeight={700}
            fontSize={13}
            sx={{ color: stat.color }}
          >
            {stat.shortLabel}
          </Typography>
        </Box>

        <Typography
          fontSize={14}
          color="text.secondary"
          fontWeight={500}
        >
          {stat.label}
        </Typography>
      </Box>

      <Typography
        variant="h4"
        fontWeight={700}
        sx={{ mb: 0.5 }}
      >
        {stat.value}
      </Typography>

      <Typography
        variant="caption"
        color="text.secondary"
      >
        {stat.description}
      </Typography>
    </Paper>
  );
}

// Main Dashboard Component
function DashboardPage() {
  const { tickets } = useTickets();

  // Calculate dashboard statistics
  const totalTickets = tickets.length;

  const openTickets = tickets.filter(
    (ticket) => ticket.status === "Open"
  ).length;

  const inProgressTickets = tickets.filter(
    (ticket) => ticket.status === "In Progress"
  ).length;

  const resolvedTickets = tickets.filter(
    (ticket) => ticket.status === "Resolved"
  ).length;

  const closedTickets = tickets.filter(
    (ticket) => ticket.status === "Closed"
  ).length;

  const highPriorityTickets = tickets.filter(
    (ticket) => ticket.priority === "High"
  ).length;

  // Statistics card data
  const statistics = [
    {
      label: "Total Tickets",
      value: totalTickets,
      description: "Across all categories",
      shortLabel: "ALL",
      color: "#2563eb",
      background: "#eff6ff",
    },
    {
      label: "Open Tickets",
      value: openTickets,
      description: "Awaiting support",
      shortLabel: "OP",
      color: "#d97706",
      background: "#fffbeb",
    },
    {
      label: "In Progress",
      value: inProgressTickets,
      description: "Currently being worked on",
      shortLabel: "IP",
      color: "#7c3aed",
      background: "#f5f3ff",
    },
    {
      label: "Resolved Tickets",
      value: resolvedTickets,
      description: "Awaiting closure",
      shortLabel: "RS",
      color: "#059669",
      background: "#ecfdf5",
    },
    {
      label: "Closed Tickets",
      value: closedTickets,
      description: "Completed tickets",
      shortLabel: "CL",
      color: "#64748b",
      background: "#f1f5f9",
    },
    {
      label: "High Priority",
      value: highPriorityTickets,
      description: "Requires faster attention",
      shortLabel: "HP",
      color: "#dc2626",
      background: "#fef2f2",
    },
  ];

  // Ticket status chart data
  const ticketStatusData = [
    {
      label: "Open",
      count: openTickets,
      percentage:
        totalTickets > 0
          ? Math.round((openTickets / totalTickets) * 100)
          : 0,
      color: "#2563eb",
    },
    {
      label: "In Progress",
      count: inProgressTickets,
      percentage:
        totalTickets > 0
          ? Math.round((inProgressTickets / totalTickets) * 100)
          : 0,
      color: "#7c3aed",
    },
    {
      label: "Resolved",
      count: resolvedTickets,
      percentage:
        totalTickets > 0
          ? Math.round((resolvedTickets / totalTickets) * 100)
          : 0,
      color: "#059669",
    },
    {
      label: "Closed",
      count: closedTickets,
      percentage:
        totalTickets > 0
          ? Math.round((closedTickets / totalTickets) * 100)
          : 0,
      color: "#64748b",
    },
  ];

  return (
    <Box sx={{ width: "100%" }}>

      {/* Page Heading */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          fontWeight={700}
          sx={{ mb: 1 }}
        >
          Dashboard
        </Typography>

        <Typography color="text.secondary">
          Overview of your IT support tickets and activities.
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            xl: "repeat(3, minmax(0, 1fr))",
          },
          gap: 2.5,
          mb: 4,
        }}
      >
        {statistics.map((stat) => (
          <StatisticsCard
            key={stat.label}
            stat={stat}
          />
        ))}
      </Box>

      {/* Ticket Status Chart */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3.5 },
          borderRadius: 3,
          border: "1px solid #e5e7eb",
          backgroundColor: "#ffffff",
        }}
      >
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{ mb: 0.5 }}
          >
            Ticket Status Overview
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Distribution of tickets according to their current status.
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Status Bars */}
        {ticketStatusData.map((status) => (
          <Box key={status.label} sx={{ mb: 3 }}>

            {/* Status Name and Count */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 1,
              }}
            >
              <Typography
                fontSize={14}
                fontWeight={600}
              >
                {status.label}
              </Typography>

              <Typography
                fontSize={14}
                color="text.secondary"
              >
                {status.count} Tickets ({status.percentage}%)
              </Typography>
            </Box>

            {/* Progress Bar */}
            <Box
              sx={{
                width: "100%",
                height: 11,
                borderRadius: 5,
                backgroundColor: "#f1f5f9",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  width: `${status.percentage}%`,
                  height: "100%",
                  backgroundColor: status.color,
                  borderRadius: 5,
                }}
              />
            </Box>
          </Box>
        ))}
      </Paper>
    </Box>
  );
}

export default DashboardPage;
