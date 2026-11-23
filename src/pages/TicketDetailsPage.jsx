
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { useTickets } from "../context/TicketContext";
import { useUser } from "../context/UserContext";

// -------------------------------------
// HELPER FUNCTIONS
// -------------------------------------

function normalizeText(value) {
  return String(value ?? "").trim().toLowerCase();
}

function getPersonName(person, fallback = "-") {
  if (!person) return fallback;

  if (typeof person === "string") {
    return person;
  }

  return (
    person.name ||
    person.fullName ||
    person.username ||
    fallback
  );
}

function formatDate(date) {
  if (!date) return "-";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return parsedDate.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Reusable information display
function DetailItem({ label, children }) {
  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        fontWeight={600}
      >
        {label}
      </Typography>

      <Typography
        variant="body2"
        color="#253858"
        fontWeight={500}
        mt={0.5}
        sx={{ overflowWrap: "anywhere" }}
      >
        {children || "-"}
      </Typography>
    </Box>
  );
}

// -------------------------------------
// MAIN COMPONENT
// -------------------------------------

function TicketDetailsPage() {
  const { selectedUser, userRole, supportStaff } = useUser();

  const currentUser = selectedUser;
  const navigate = useNavigate();
  const { ticketId } = useParams();

  const { tickets, updateTicket } = useTickets();

  const [commentText, setCommentText] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);

  // Find the selected ticket
  const ticket = tickets.find(
    (item) => String(item.id ?? item.ticketId) === String(ticketId)
  );

  // Role information
  const isEmployee =
    normalizeText(userRole) === "employee";

  const isSupportStaff =
    normalizeText(userRole) === "it support staff";

  const currentUserName = getPersonName(
    currentUser,
    isEmployee ? "Employee" : "IT Support Staff"
  );

  // Check employee ticket ownership
  const hasAccess =
    !isEmployee ||
    (
      ticket &&
      normalizeText(getPersonName(ticket.raisedBy, "")) ===
        normalizeText(currentUserName)
    );

  // Ticket information
  const comments = Array.isArray(ticket?.comments)
    ? ticket.comments
    : [];

  const history = Array.isArray(ticket?.history)
    ? ticket.history
    : [];

  const assignedTo = getPersonName(
    ticket?.assignedTo,
    "Unassigned"
  );

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

  // Use the same support staff list as the header and edit form.
  const uniqueSupportStaff = [
    ...new Set(supportStaff.map((staff) => staff.name)),
  ];

  // -------------------------------------
  // ADD A COMMENT
  // -------------------------------------

  const handleAddComment = () => {
    const trimmedComment = commentText.trim();

    if (!trimmedComment) {
      setFeedback({
        severity: "error",
        message: "Please enter a comment.",
      });

      return;
    }

    if (ticket.status === "Closed") {
      setFeedback({
        severity: "error",
        message: "Comments cannot be added to Closed tickets.",
      });

      return;
    }

    const now = new Date().toISOString();

    const newComment = {
      id: `COMMENT-${Date.now()}`,
      text: trimmedComment,
      commentedBy: currentUserName,
      createdAt: now,
    };

    updateTicket(ticket.id ?? ticket.ticketId, {
      comments: [...comments, newComment],
      updatedAt: now,
    });

    setCommentText("");

    setFeedback({
      severity: "success",
      message: "Comment added successfully.",
    });
  };

  // -------------------------------------
  // ASSIGN TICKET
  // -------------------------------------

  const handleAssignTicket = (newAssignee) => {
    if (!isSupportStaff) return;

    if (ticket.status !== "Open") {
      setFeedback({
        severity: "error",
        message: "Only Open tickets can be assigned.",
      });

      return;
    }

    if (newAssignee === assignedTo) return;

    const now = new Date().toISOString();

    const historyEntry = {
      id: `HISTORY-${Date.now()}`,
      activity: "Ticket Assigned",
      previousValue: assignedTo,
      newValue: newAssignee,
      performedBy: currentUserName,
      createdAt: now,
    };

    updateTicket(ticket.id ?? ticket.ticketId, {
      assignedTo: newAssignee,
      updatedAt: now,
      history: [...history, historyEntry],
    });

    setFeedback({
      severity: "success",
      message: "Ticket assigned successfully.",
    });
  };

  // -------------------------------------
  // CHANGE TICKET STATUS
  // -------------------------------------

  const allowedTransitions = {
    Open: ["In Progress"],
    "In Progress": ["Resolved"],
    Resolved: ["Closed"],
    Closed: [],
  };

  const handleStatusChange = (nextStatus) => {
    if (!isSupportStaff) return;

    if (
      !allowedTransitions[ticket.status]?.includes(nextStatus)
    ) {
      setFeedback({
        severity: "error",
        message: "This status transition is not allowed.",
      });

      return;
    }

    // Assignment is required before In Progress
    if (
      nextStatus === "In Progress" &&
      assignedTo === "Unassigned"
    ) {
      setFeedback({
        severity: "error",
        message: "Assign this ticket before moving it to In Progress.",
      });

      return;
    }

    let updatedComments = [...comments];

    // Resolution requires a comment
    if (nextStatus === "Resolved") {
      const trimmedComment = commentText.trim();

      if (!trimmedComment) {
        setFeedback({
          severity: "error",
          message: "Enter a resolution comment before resolving.",
        });

        return;
      }

      const resolutionComment = {
        id: `COMMENT-${Date.now()}`,
        text: trimmedComment,
        commentedBy: currentUserName,
        createdAt: new Date().toISOString(),
      };

      updatedComments.push(resolutionComment);
    }

    // Ask for confirmation before closing a resolved ticket.
    // The ticket is only updated after the user confirms in the dialog.
    if (nextStatus === "Closed") {
      setCloseDialogOpen(true);
      return;
    }

    const now = new Date().toISOString();

    const historyEntry = {
      id: `HISTORY-${Date.now()}`,
      activity: "Status Changed",
      previousValue: ticket.status,
      newValue: nextStatus,
      performedBy: currentUserName,
      createdAt: now,
    };

    updateTicket(ticket.id ?? ticket.ticketId, {
      status: nextStatus,
      comments: updatedComments,
      history: [...history, historyEntry],
      updatedAt: now,
    });

    if (nextStatus === "Resolved") {
      setCommentText("");
    }

    setFeedback({
      severity: "success",
      message: `Ticket status changed to ${nextStatus}.`,
    });
  };

  // Confirm and complete the ticket-closing action.
  const confirmCloseTicket = () => {
    const now = new Date().toISOString();

    const historyEntry = {
      id: `HISTORY-${Date.now()}`,
      activity: "Status Changed",
      previousValue: ticket.status,
      newValue: "Closed",
      performedBy: currentUserName,
      createdAt: now,
    };

    updateTicket(ticket.id ?? ticket.ticketId, {
      status: "Closed",
      history: [...history, historyEntry],
      updatedAt: now,
    });

    setCloseDialogOpen(false);
    setFeedback({
      severity: "success",
      message: "Ticket closed successfully.",
    });
  };

  // -------------------------------------
  // TICKET NOT FOUND
  // -------------------------------------

  if (!ticket || !hasAccess) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {!ticket
            ? "Ticket not found."
            : "You are not authorized to view this ticket."}
        </Alert>

        <Button onClick={() => navigate("/tickets")}>
          Back to Tickets
        </Button>
      </Box>
    );
  }

  const attachment = ticket.attachment;

  // Sort comments chronologically
  const sortedComments = [...comments].sort(
    (a, b) =>
      new Date(a.createdAt || 0) -
      new Date(b.createdAt || 0)
  );

  // -------------------------------------
  // UI
  // -------------------------------------

  return (
    <Box
      sx={{
        p: { xs: 2, md: 3 },
        minHeight: "100%",
        backgroundColor: "#f7f9fc",
      }}
    >
      {/* HEADER */}

      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={2}
        mb={3}
      >
        <Box>
          <Button
            onClick={() => navigate("/tickets")}
            sx={{
              textTransform: "none",
              mb: 1,
              pl: 0,
            }}
          >
            ← Back to Tickets
          </Button>

          <Typography
            variant="h5"
            fontWeight={700}
            color="#172b4d"
          >
            Ticket Details
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            mt={0.5}
          >
            Viewing {ticket.id}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1}>
          <Chip
            label={ticket.status}
            color={statusColors[ticket.status] || "default"}
          />

          <Chip
            label={`${ticket.priority} Priority`}
            color={priorityColors[ticket.priority] || "default"}
          />
        </Stack>
      </Stack>

      {/* FEEDBACK */}

      {feedback && (
        <Alert
          severity={feedback.severity}
          onClose={() => setFeedback(null)}
          sx={{ mb: 2 }}
        >
          {feedback.message}
        </Alert>
      )}

      {/* TICKET INFORMATION */}

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          border: "1px solid #e5eaf1",
          borderRadius: 2.5,
          mb: 3,
        }}
      >
        <Typography
          variant="h6"
          fontWeight={700}
          color="#253858"
          mb={2}
        >
          Ticket Information
        </Typography>

        <Divider sx={{ mb: 3 }} />

        <Typography
          variant="h6"
          fontWeight={600}
          color="#172b4d"
          mb={1}
        >
          {ticket.title}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            whiteSpace: "pre-wrap",
            lineHeight: 1.8,
            mb: 3,
          }}
        >
          {ticket.description || "No description provided."}
        </Typography>

        <Divider sx={{ mb: 3 }} />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              lg: "repeat(3, minmax(0, 1fr))",
            },
            gap: 3,
          }}
        >
          <DetailItem label="Ticket ID">
            {ticket.id}
          </DetailItem>

          <DetailItem label="Category">
            {ticket.category}
          </DetailItem>

          <DetailItem label="Priority">
            {ticket.priority}
          </DetailItem>

          <DetailItem label="Raised By">
            {getPersonName(ticket.raisedBy)}
          </DetailItem>

          <DetailItem label="Assigned To">
            {assignedTo}
          </DetailItem>

          <DetailItem label="Created Date">
            {formatDate(
              ticket.createdAt || ticket.createdDate
            )}
          </DetailItem>

          <DetailItem label="Last Updated Date">
            {formatDate(
              ticket.updatedAt ||
              ticket.lastUpdatedAt ||
              ticket.updatedDate
            )}
          </DetailItem>

          <DetailItem label="Current Status">
            {ticket.status}
          </DetailItem>
        </Box>

        {/* ATTACHMENT */}

        <Divider sx={{ my: 3 }} />

        <Typography
          variant="subtitle1"
          fontWeight={700}
          mb={1}
        >
          Attachment
        </Typography>

        {attachment ? (
          <Stack
            direction="row"
            alignItems="center"
            spacing={2}
          >
            <Typography variant="body2">
              {attachment.name || attachment.fileName || "Attachment"}
            </Typography>

            <Chip
              size="small"
              label={attachment.type || "File"}
              variant="outlined"
            />
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No attachment added.
          </Typography>
        )}
      </Paper>

      {/* ASSIGNMENT AND STATUS MANAGEMENT */}

      {isSupportStaff && (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 3 },
            mb: 3,
            border: "1px solid #e5eaf1",
            borderRadius: 2.5,
          }}
        >
          <Typography
            variant="h6"
            fontWeight={700}
            mb={2}
            color="#253858"
          >
            Ticket Management Actions
          </Typography>

          <Divider sx={{ mb: 3 }} />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "1fr 1fr",
              },
              gap: 3,
            }}
          >
            {/* ASSIGNMENT */}

            <Box>
              <Typography
                variant="subtitle2"
                fontWeight={600}
                mb={1}
              >
                Assign Ticket
              </Typography>

              <FormControl
                fullWidth
                size="small"
                disabled={ticket.status !== "Open"}
              >
                <InputLabel>Assigned To</InputLabel>

                <Select
                  label="Assigned To"
                  value={assignedTo}
                  onChange={(e) =>
                    handleAssignTicket(e.target.value)
                  }
                >
                  <MenuItem value="Unassigned">
                    Unassigned
                  </MenuItem>

                  {uniqueSupportStaff.map((staff) => (
                    <MenuItem key={staff} value={staff}>
                      {staff}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {ticket.status !== "Open" && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  mt={1}
                  display="block"
                >
                  Only Open tickets can be reassigned.
                </Typography>
              )}
            </Box>

            {/* STATUS */}

            <Box>
              <Typography
                variant="subtitle2"
                fontWeight={600}
                mb={1}
              >
                Update Status
              </Typography>

              <Stack direction="row" spacing={1} flexWrap="wrap">
                {allowedTransitions[ticket.status]?.map(
                  (nextStatus) => (
                    <Button
                      key={nextStatus}
                      variant="contained"
                      size="small"
                      disabled={
                        nextStatus === "In Progress" &&
                        assignedTo === "Unassigned"
                      }
                      onClick={() =>
                        handleStatusChange(nextStatus)
                      }
                      sx={{ textTransform: "none", mb: 1 }}
                    >
                      {nextStatus}
                    </Button>
                  )
                )}

                {ticket.status === "Closed" && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    This ticket is closed and read-only.
                  </Typography>
                )}
              </Stack>

              {ticket.status === "In Progress" && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  mt={1}
                >
                  Enter a comment below before resolving this ticket.
                </Typography>
              )}
            </Box>
          </Box>
        </Paper>
      )}

      {/* COMMENTS */}

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          border: "1px solid #e5eaf1",
          borderRadius: 2.5,
          mb: 3,
        }}
      >
        <Typography
          variant="h6"
          fontWeight={700}
          color="#253858"
          mb={2}
        >
          Comments ({comments.length})
        </Typography>

        <Divider sx={{ mb: 2 }} />

        {sortedComments.length === 0 ? (
          <Typography
            variant="body2"
            color="text.secondary"
            py={2}
          >
            No comments yet.
          </Typography>
        ) : (
          <Stack spacing={2} mb={3}>
            {sortedComments.map((comment, index) => (
              <Box
                key={comment.id || index}
                sx={{
                  p: 2,
                  backgroundColor: "#f8fafc",
                  borderRadius: 2,
                }}
              >
                <Box sx={{ mb: 1.25 }}>
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    color="#253858"
                  >
                    {getPersonName(comment.commentedBy, "User")}
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    sx={{ mt: 0.5, lineHeight: 1.5 }}
                  >
                    {formatDate(comment.createdAt)}
                  </Typography>
                </Box>

                <Typography
                  variant="body2"
                  sx={{ whiteSpace: "pre-wrap", lineHeight: 1.7, overflowWrap: "anywhere" }}
                >
                  {comment.text || comment.commentText || ""}
                </Typography>
              </Box>
            ))}
          </Stack>
        )}

        {ticket.status !== "Closed" ? (
          <Stack spacing={2}>
            <TextField
              label="Add Comment"
              placeholder="Write your comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              multiline
              minRows={3}
              fullWidth
            />

            <Box>
              <Button
                variant="contained"
                onClick={handleAddComment}
                sx={{ textTransform: "none" }}
              >
                Add Comment
              </Button>
            </Box>
          </Stack>
        ) : (
          <Alert severity="info">
            Comments cannot be added to Closed tickets.
          </Alert>
        )}
      </Paper>

      {/* HISTORY */}

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          border: "1px solid #e5eaf1",
          borderRadius: 2.5,
        }}
      >
        <Typography
          variant="h6"
          fontWeight={700}
          color="#253858"
          mb={2}
        >
          Ticket History
        </Typography>

        <Divider sx={{ mb: 3 }} />

        {history.length === 0 ? (
          <Typography
            variant="body2"
            color="text.secondary"
          >
            No history recorded yet.
          </Typography>
        ) : (
          <Stack spacing={2}>
            {[...history]
              .sort(
                (a, b) =>
                  new Date(a.createdAt || 0) -
                  new Date(b.createdAt || 0)
              )
              .map((entry, index) => (
                <Box
                  key={entry.id || index}
                  sx={{
                    borderLeft: "3px solid #2563eb",
                    pl: 2,
                    py: 0.5,
                  }}
                >
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    color="#253858"
                  >
                    {entry.activity || "Ticket Updated"}
                  </Typography>

                  {entry.previousValue && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      mt={0.5}
                    >
                      Previous: {entry.previousValue}
                    </Typography>
                  )}

                  {entry.newValue && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      New: {entry.newValue}
                    </Typography>
                  )}

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    mt={0.5}
                  >
                    By {getPersonName(entry.performedBy, "User")}
                    {" · "}
                    {formatDate(entry.createdAt)}
                  </Typography>
                </Box>
              ))}
          </Stack>
        )}
      </Paper>

      {/* CONFIRM CLOSE TICKET DIALOG */}
      <Dialog
        open={closeDialogOpen}
        onClose={() => setCloseDialogOpen(false)}
        aria-labelledby="close-ticket-dialog-title"
        aria-describedby="close-ticket-dialog-description"
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle
          id="close-ticket-dialog-title"
          sx={{ fontWeight: 700 }}
        >
          Close this ticket?
        </DialogTitle>

        <DialogContent>
          <DialogContentText id="close-ticket-dialog-description">
            Are you sure you want to close ticket {ticket.id ?? ticket.ticketId}?
            Once closed, it will become read-only and no more comments can be added.
          </DialogContentText>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => setCloseDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={confirmCloseTicket}
          >
            Yes, close ticket
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default TicketDetailsPage;
