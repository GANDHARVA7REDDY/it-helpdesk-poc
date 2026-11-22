import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

import { useTickets } from "../context/TicketContext";
import { useUser } from "../context/UserContext";

const categories = [
  "Hardware",
  "Software",
  "Network",
  "Email",
  "Access Request",
  "Other",
];

const priorities = ["Low", "Medium", "High", "Critical"];

function getPersonName(person, fallback = "Unassigned") {
  if (!person) return fallback;
  if (typeof person === "string") return person;
  return person.name || person.fullName || person.username || fallback;
}

export default function EditTicketPage() {
  const { ticketId } = useParams();
  const navigate = useNavigate();

  const { tickets, updateTicket } = useTickets();
  const { selectedUser, userRole, supportStaff } = useUser();

  const ticket = tickets.find(
    (item) => String(item.id ?? item.ticketId) === String(ticketId)
  );

  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [assignedTo, setAssignedTo] = useState("Unassigned");

  // Keep every hook above the conditional returns. Sync fields when the route's
  // ticket is loaded or changes.
  useEffect(() => {
    if (!ticket) return;

    setTitle(ticket.title || "");
    setDescription(ticket.description || "");
    setCategory(ticket.category || "");
    setPriority(ticket.priority || "Medium");
    setAssignedTo(getPersonName(ticket.assignedTo));
    setError("");
  }, [ticket]);

  const isEmployee = userRole === "Employee";

  const allowed = ticket
    ? isEmployee
      ? ticket.raisedBy === selectedUser?.name && ticket.status === "Open"
      : ["Open", "In Progress"].includes(ticket.status)
    : false;

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (title.trim().length < 5 || title.trim().length > 100) {
      setError("Title must be between 5 and 100 characters.");
      return;
    }

    if (description.trim().length < 20) {
      setError("Description must contain at least 20 characters.");
      return;
    }

    const now = new Date().toISOString();

    const updatedTicket = {
      ...ticket,
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      updatedAt: now,
      history: [
        ...(Array.isArray(ticket.history) ? ticket.history : []),
        {
          id: `HISTORY-${Date.now()}`,
          activity: "Ticket Details Updated",
          performedBy: selectedUser?.name || "Unknown User",
          createdAt: now,
        },
      ],
    };

    // Only support staff can change ticket assignment.
    if (!isEmployee) {
      updatedTicket.assignedTo = assignedTo;
    }

    updateTicket(ticket.id ?? ticket.ticketId, updatedTicket);
    navigate(`/tickets/${ticketId}`);
  }

  if (!ticket) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Ticket not found.
        </Alert>
        <Button onClick={() => navigate("/tickets")}>
          Back to Tickets
        </Button>
      </Box>
    );
  }

  if (!allowed) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          You are not permitted to edit this ticket.
        </Alert>
        <Button onClick={() => navigate(`/tickets/${ticketId}`)}>
          Return to Ticket
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h4" fontWeight={700} mb={3}>
        Edit Ticket
      </Typography>

      <Paper sx={{ p: { xs: 2, md: 3 }, maxWidth: 900 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} display="grid" gap={2}>
          <TextField
            label="Ticket ID"
            value={ticket.id ?? ticket.ticketId}
            disabled
          />

          <TextField
            label="Title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            inputProps={{ maxLength: 100 }}
            required
          />

          <TextField
            label="Description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            multiline
            rows={4}
            required
          />

          <TextField
            select
            label="Category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            required
          >
            {categories.map((item) => (
              <MenuItem key={item} value={item}>
                {item}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Priority"
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
            required
          >
            {priorities.map((item) => (
              <MenuItem key={item} value={item}>
                {item}
              </MenuItem>
            ))}
          </TextField>

          <TextField label="Raised By" value={getPersonName(ticket.raisedBy, "-")} disabled />

          <TextField
            label="Created At"
            value={
              ticket.createdAt
                ? new Date(ticket.createdAt).toLocaleString("en-IN")
                : "-"
            }
            disabled
          />

          {!isEmployee && (
            <TextField
              select
              label="Assigned To"
              value={assignedTo}
              disabled={ticket.status !== "Open"}
              onChange={(event) => setAssignedTo(event.target.value)}
            >
              <MenuItem value="Unassigned">Unassigned</MenuItem>
              {supportStaff.map((staff) => (
                <MenuItem key={staff.id} value={staff.name}>
                  {staff.name}
                </MenuItem>
              ))}
            </TextField>
          )}

          <Typography variant="caption" color="text.secondary">
            Only Open tickets can be assigned or reassigned. Update ticket status
            from the Ticket Details page to follow the required workflow.
          </Typography>

          <Box display="flex" gap={2} flexWrap="wrap">
            <Button type="submit" variant="contained">
              Save Changes
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate(`/tickets/${ticketId}`)}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
