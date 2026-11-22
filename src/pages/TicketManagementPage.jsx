
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

import { useTickets } from "../context/TicketContext";
import { useUser } from "../context/UserContext";

function normalize(value) {
  return String(value ?? "").trim().toLowerCase();
}

function getPersonName(person, fallback = "Unassigned") {
  if (!person) return fallback;

  if (typeof person === "string") return person;

  return person.name || person.fullName || person.username || fallback;
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "-"
    : date.toLocaleDateString("en-IN");
}

const statusColors = {
  Open: "warning",
  "In Progress": "info",
  Resolved: "success",
  Closed: "default",
};

const priorityColors = {
  Low: "success",
  Medium: "info",
  High: "warning",
  Critical: "error",
};

const priorityRank = {
  Low: 1,
  Medium: 2,
  High: 3,
  Critical: 4,
};

export default function TicketManagementPage() {
  const navigate = useNavigate();

  const { tickets } = useTickets();
  const { selectedUser, userRole } = useUser();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const allTickets = Array.isArray(tickets) ? tickets : [];

  const isEmployee = userRole === "Employee";

  const currentUserName = normalize(selectedUser?.name);

  // Employees see their own tickets.
  // IT Support Staff see all tickets.
  const roleTickets = isEmployee
    ? allTickets.filter(
        (ticket) =>
          normalize(getPersonName(ticket.raisedBy, "")) ===
          currentUserName
      )
    : allTickets;

  const categories = [
    ...new Set(
      roleTickets.map((ticket) => ticket.category).filter(Boolean)
    ),
  ].sort();

  const assignees = [
    ...new Set(
      roleTickets.map((ticket) => getPersonName(ticket.assignedTo))
    ),
  ].sort();

  let filteredTickets = roleTickets.filter((ticket) => {
    const ticketId = ticket.id || ticket.ticketId || "";
    const searchText = normalize(search);

    const matchesSearch =
      normalize(ticketId).includes(searchText) ||
      normalize(ticket.title).includes(searchText);

    const matchesStatus =
      !statusFilter || ticket.status === statusFilter;

    const matchesPriority =
      !priorityFilter || ticket.priority === priorityFilter;

    const matchesCategory =
      !categoryFilter || ticket.category === categoryFilter;

    const matchesAssignee =
      !assigneeFilter ||
      normalize(getPersonName(ticket.assignedTo)) ===
        normalize(assigneeFilter);

    return (
      matchesSearch &&
      matchesStatus &&
      matchesPriority &&
      matchesCategory &&
      matchesAssignee
    );
  });

  // Sorting
  filteredTickets = [...filteredTickets].sort((first, second) => {
    if (sortBy === "oldest") {
      return (
        new Date(first.createdAt || 0) -
        new Date(second.createdAt || 0)
      );
    }

    if (sortBy === "priority") {
      return (
        (priorityRank[second.priority] || 0) -
        (priorityRank[first.priority] || 0)
      );
    }

    if (sortBy === "title") {
      return String(first.title || "").localeCompare(
        String(second.title || "")
      );
    }

    return (
      new Date(second.createdAt || 0) -
      new Date(first.createdAt || 0)
    );
  });

  // Pagination
  const visibleTickets = filteredTickets.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("");
    setPriorityFilter("");
    setCategoryFilter("");
    setAssigneeFilter("");
    setSortBy("newest");
    setPage(0);
  };

  const canEdit = (ticket) =>
    isEmployee
      ? ticket.status === "Open"
      : ["Open", "In Progress"].includes(ticket.status);

  return (
    <Box sx={{ width: "100%" }}>
      {/* Page heading and Create Ticket button */}
     
        <Box sx={{ mb: 3 }}>
  <Box>
    <Typography variant="h4" fontWeight={700} color="#172b4d">
      Ticket Management
    </Typography>

    <Typography color="text.secondary" mt={0.5}>
      {isEmployee
        ? `Tickets raised by ${selectedUser?.name || "you"}`
        : "View and manage all employee support tickets"}
    </Typography>
  </Box>

  {isEmployee && (
    <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
      <Button
        size="small"
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => navigate("/create-ticket")}
        sx={{ textTransform: "none" }}
      >
        Create Ticket
      </Button>
    </Box>
  )}
</Box>

      {/* Search and filters */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 2,
          border: "1px solid #e5eaf1",
          borderRadius: 2.5,
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              lg: "repeat(3, minmax(0, 1fr))",
            },
            gap: 2,
          }}
        >
          <TextField
            label="Search by Ticket ID or Title"
            size="small"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(0);
            }}
          />

          <TextField
            select
            label="Status"
            size="small"
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(0);
            }}
          >
            <MenuItem value="">All statuses</MenuItem>

            {Object.keys(statusColors).map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Priority"
            size="small"
            value={priorityFilter}
            onChange={(event) => {
              setPriorityFilter(event.target.value);
              setPage(0);
            }}
          >
            <MenuItem value="">All priorities</MenuItem>

            {Object.keys(priorityRank).map((priority) => (
              <MenuItem key={priority} value={priority}>
                {priority}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Category"
            size="small"
            value={categoryFilter}
            onChange={(event) => {
              setCategoryFilter(event.target.value);
              setPage(0);
            }}
          >
            <MenuItem value="">All categories</MenuItem>

            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Assigned To"
            size="small"
            value={assigneeFilter}
            onChange={(event) => {
              setAssigneeFilter(event.target.value);
              setPage(0);
            }}
          >
            <MenuItem value="">All assignees</MenuItem>

            {assignees.map((assignee) => (
              <MenuItem key={assignee} value={assignee}>
                {assignee}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Sort By"
            size="small"
            value={sortBy}
            onChange={(event) => {
              setSortBy(event.target.value);
              setPage(0);
            }}
          >
            <MenuItem value="newest">
              Created Date (Newest)
            </MenuItem>

            <MenuItem value="oldest">
              Created Date (Oldest)
            </MenuItem>

            <MenuItem value="priority">
              Priority (Highest)
            </MenuItem>

            <MenuItem value="title">
              Title (A–Z)
            </MenuItem>
          </TextField>
        </Box>

        <Box display="flex" justifyContent="flex-end" mt={2}>
          <Button
            size="small"
            startIcon={<RestartAltIcon />}
            onClick={clearFilters}
          >
            Clear Filters
          </Button>
        </Box>
      </Paper>

      {/* Ticket list */}
      {filteredTickets.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          {roleTickets.length === 0
            ? isEmployee
              ? "You have not raised any tickets yet."
              : "No tickets are available."
            : "No tickets match the selected search and filters."}
        </Alert>
      ) : (
        <Paper
          elevation={0}
          sx={{
            border: "1px solid #e5eaf1",
            borderRadius: 2.5,
          }}
        >
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                  <TableCell><strong>Ticket ID</strong></TableCell>
                  <TableCell><strong>Title</strong></TableCell>
                  <TableCell><strong>Category</strong></TableCell>
                  <TableCell><strong>Priority</strong></TableCell>
                  <TableCell><strong>Raised By</strong></TableCell>
                  <TableCell><strong>Assigned To</strong></TableCell>
                  <TableCell><strong>Created Date</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell align="center">
                    <strong>Actions</strong>
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {visibleTickets.map((ticket) => {
                  const ticketId = ticket.id || ticket.ticketId;

                  return (
                    <TableRow key={ticketId} hover>
                      <TableCell
                        sx={{
                          whiteSpace: "nowrap",
                          fontWeight: 600,
                        }}
                      >
                        {ticketId}
                      </TableCell>

                      <TableCell sx={{ minWidth: 180, maxWidth: 260 }}>
                        {ticket.title || "-"}
                      </TableCell>

                      <TableCell>
                        {ticket.category || "-"}
                      </TableCell>

                      <TableCell>
                        <Chip
                          size="small"
                          label={ticket.priority || "-"}
                          color={
                            priorityColors[ticket.priority] || "default"
                          }
                        />
                      </TableCell>

                      <TableCell>
                        {getPersonName(ticket.raisedBy, "-")}
                      </TableCell>

                      <TableCell>
                        {getPersonName(ticket.assignedTo)}
                      </TableCell>

                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {formatDate(ticket.createdAt)}
                      </TableCell>

                      <TableCell>
                        <Chip
                          size="small"
                          label={ticket.status || "-"}
                          color={
                            statusColors[ticket.status] || "default"
                          }
                        />
                      </TableCell>

                      <TableCell
                        align="center"
                        sx={{ whiteSpace: "nowrap" }}
                      >
                        <Tooltip title="View ticket">
                          <IconButton
                            size="small"
                            aria-label={`View ${ticketId}`}
                            onClick={() =>
                              navigate(`/tickets/${ticketId}`)
                            }
                          >
                            <VisibilityOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        {canEdit(ticket) && (
                          <Tooltip title="Edit ticket">
                            <IconButton
                              size="small"
                              aria-label={`Edit ${ticketId}`}
                              onClick={() =>
                                navigate(`/tickets/${ticketId}/edit`)
                              }
                            >
                              <EditOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <TablePagination
            component="div"
            count={filteredTickets.length}
            page={page}
            onPageChange={(_, nextPage) => setPage(nextPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(Number(event.target.value));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 20]}
          />
        </Paper>
      )}
    </Box>
  );
}
