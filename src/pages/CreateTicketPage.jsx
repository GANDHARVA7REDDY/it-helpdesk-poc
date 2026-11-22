
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { useTickets } from "../context/TicketContext";
import { useUser } from "../context/UserContext";

// ---------------------------------
// DROPDOWN OPTIONS
// ---------------------------------

const categories = [
  "Hardware",
  "Software",
  "Network",
  "Email",
  "Access Request",
  "Other",
];

const priorities = [
  "Low",
  "Medium",
  "High",
  "Critical",
];

// ---------------------------------
// MAIN COMPONENT
// ---------------------------------

function CreateTicketPage() {
  const navigate = useNavigate();

  const { tickets, addTicket } = useTickets();

  const { selectedUser, userRole } = useUser();

  // ---------------------------------
  // FORM STATES
  // ---------------------------------

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");

  const [selectedFile, setSelectedFile] = useState(null);
  const [attachmentError, setAttachmentError] = useState("");

  const [errors, setErrors] = useState({});

  const [successOpen, setSuccessOpen] = useState(false);
  const [createdTicketId, setCreatedTicketId] = useState("");

  // ---------------------------------
  // SELECTED USER
  // ---------------------------------

  const raisedBy = selectedUser?.name || "Unknown User";

  const isEmployee = userRole === "Employee";

  // ---------------------------------
  // CREATED DATE
  // ---------------------------------

  const createdDate = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  // ---------------------------------
  // IMAGE PREVIEW
  // ---------------------------------

  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (
      !selectedFile ||
      !selectedFile.type.startsWith("image/")
    ) {
      setPreviewUrl("");
      return;
    }

    const imageUrl = URL.createObjectURL(selectedFile);

    setPreviewUrl(imageUrl);

    return () => {
      URL.revokeObjectURL(imageUrl);
    };
  }, [selectedFile]);

  // ---------------------------------
  // GENERATE TICKET ID
  // ---------------------------------

  const generateTicketId = () => {
    const existingNumbers = tickets.map((ticket) => {
      const match = String(ticket.id).match(/(\d+)$/);

      return match ? Number(match[1]) : 0;
    });

    const highestNumber = Math.max(
      1000,
      ...existingNumbers
    );

    return `TKT-${highestNumber + 1}`;
  };

  // ---------------------------------
  // HANDLE ATTACHMENT
  // ---------------------------------

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedExtensions = [
      "pdf",
      "jpg",
      "jpeg",
      "png",
    ];

    const extension = file.name
      .split(".")
      .pop()
      .toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      setAttachmentError(
        "Only PDF, JPG and PNG files are allowed."
      );

      setSelectedFile(null);
      event.target.value = "";
      return;
    }

    const maximumSize = 2 * 1024 * 1024;

    if (file.size > maximumSize) {
      setAttachmentError(
        "File size must not exceed 2 MB."
      );

      setSelectedFile(null);
      event.target.value = "";
      return;
    }

    setAttachmentError("");
    setSelectedFile(file);
  };

  // ---------------------------------
  // VALIDATE FORM
  // ---------------------------------

  const validateForm = () => {
    const newErrors = {};

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (
      trimmedTitle.length < 5 ||
      trimmedTitle.length > 100
    ) {
      newErrors.title =
        "Title must contain between 5 and 100 characters.";
    }

    if (trimmedDescription.length < 20) {
      newErrors.description =
        "Description must contain at least 20 characters.";
    }

    if (!category) {
      newErrors.category = "Please select a category.";
    }

    if (!priority) {
      newErrors.priority = "Please select a priority.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // ---------------------------------
  // SUBMIT
  // ---------------------------------

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!isEmployee) return;

    if (!validateForm() || attachmentError) {
      return;
    }

    const now = new Date().toISOString();

    const newTicket = {
      id: generateTicketId(),
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      raisedBy,
      assignedTo: "Unassigned",
      createdAt: now,
      updatedAt: now,
      status: "Open",

      attachment: selectedFile
        ? {
            name: selectedFile.name,
            type: selectedFile.type,
            size: selectedFile.size,
          }
        : null,

      comments: [],

      history: [
        {
          id: `HISTORY-${Date.now()}`,
          activity: "Ticket Created",
          previousValue: null,
          newValue: "Open",
          performedBy: raisedBy,
          createdAt: now,
        },
      ],
    };

    addTicket(newTicket);

    setCreatedTicketId(newTicket.id);
    setSuccessOpen(true);
  };

  // ---------------------------------
  // SUCCESS NAVIGATION
  // ---------------------------------

  const handleSuccessClose = () => {
    setSuccessOpen(false);

    if (createdTicketId) {
      navigate(`/tickets/${createdTicketId}`);
    }
  };

  // ---------------------------------
  // CANCEL
  // ---------------------------------

  const handleCancel = () => {
    navigate("/tickets");
  };

  // ---------------------------------
  // ACCESS CHECK
  // ---------------------------------

  if (!isEmployee) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Only Employees can create tickets.
          Switch to an Employee account to continue.
        </Alert>

        <Button onClick={() => navigate("/tickets")}>
          Back to Tickets
        </Button>
      </Box>
    );
  }

  // ---------------------------------
  // UI
  // ---------------------------------

  return (
    <Box
      sx={{
        minHeight: "100%",
        backgroundColor: "#f7f9fc",
        p: { xs: 2, md: 3 },
      }}
    >
      <Box mb={3}>
        <Typography
          variant="h5"
          fontWeight={700}
          color="#172b4d"
        >
          Create Ticket
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          mt={0.5}
        >
          Submit a new IT support request.
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{
          maxWidth: 900,
          mx: "auto",
          p: { xs: 2, md: 3 },
          border: "1px solid #e5eaf1",
          borderRadius: 2.5,
        }}
      >
        <Box component="form" onSubmit={handleSubmit}>
          <Typography
            variant="h6"
            fontWeight={700}
            color="#253858"
            mb={2}
          >
            Ticket Information
          </Typography>

          <Stack spacing={2.5}>
            <TextField
              label="Ticket Title"
              placeholder="Enter a short title for your issue"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);

                setErrors((previous) => ({
                  ...previous,
                  title: "",
                }));
              }}
              error={Boolean(errors.title)}
              helperText={
                errors.title ||
                `${title.length}/100 characters`
              }
              fullWidth
              inputProps={{ maxLength: 100 }}
            />

            <TextField
              label="Description"
              placeholder="Explain your issue in detail..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);

                setErrors((previous) => ({
                  ...previous,
                  description: "",
                }));
              }}
              error={Boolean(errors.description)}
              helperText={
                errors.description ||
                `${description.length} characters (minimum 20)`
              }
              multiline
              minRows={4}
              fullWidth
            />

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "1fr 1fr",
                },
                gap: 2,
              }}
            >
              <FormControl
                fullWidth
                error={Boolean(errors.category)}
              >
                <InputLabel>Category</InputLabel>

                <Select
                  value={category}
                  label="Category"
                  onChange={(e) => {
                    setCategory(e.target.value);

                    setErrors((previous) => ({
                      ...previous,
                      category: "",
                    }));
                  }}
                >
                  {categories.map((item) => (
                    <MenuItem key={item} value={item}>
                      {item}
                    </MenuItem>
                  ))}
                </Select>

                {errors.category && (
                  <Typography
                    variant="caption"
                    color="error"
                    mt={0.5}
                    ml={1.5}
                  >
                    {errors.category}
                  </Typography>
                )}
              </FormControl>

              <FormControl
                fullWidth
                error={Boolean(errors.priority)}
              >
                <InputLabel>Priority</InputLabel>

                <Select
                  value={priority}
                  label="Priority"
                  onChange={(e) => {
                    setPriority(e.target.value);

                    setErrors((previous) => ({
                      ...previous,
                      priority: "",
                    }));
                  }}
                >
                  {priorities.map((item) => (
                    <MenuItem key={item} value={item}>
                      {item}
                    </MenuItem>
                  ))}
                </Select>

                {errors.priority && (
                  <Typography
                    variant="caption"
                    color="error"
                    mt={0.5}
                    ml={1.5}
                  >
                    {errors.priority}
                  </Typography>
                )}
              </FormControl>
            </Box>
          </Stack>

          <Divider sx={{ my: 3 }} />

          <Typography
            variant="h6"
            fontWeight={700}
            color="#253858"
            mb={2}
          >
            Ticket Details
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
              },
              gap: 2,
            }}
          >
            <TextField
              label="Raised By"
              value={raisedBy}
              fullWidth
              InputProps={{ readOnly: true }}
            />

            <TextField
              label="Created Date"
              value={createdDate}
              fullWidth
              InputProps={{ readOnly: true }}
            />

            <TextField
              label="Assigned To"
              value="Unassigned"
              fullWidth
              InputProps={{ readOnly: true }}
            />

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                px: 1,
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Initial Status:
              </Typography>

              <Chip
                label="Open"
                color="warning"
                size="small"
              />
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography
            variant="h6"
            fontWeight={700}
            color="#253858"
            mb={1}
          >
            Attachment
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            mb={2}
          >
            Optional. PDF, JPG or PNG. Maximum size: 2 MB.
          </Typography>

          <Button
            variant="outlined"
            component="label"
            sx={{ textTransform: "none" }}
          >
            Choose File

            <input
              type="file"
              hidden
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
            />
          </Button>

          {attachmentError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {attachmentError}
            </Alert>
          )}

          {selectedFile && (
            <Box mt={2}>
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                flexWrap="wrap"
              >
                <Typography variant="body2">
                  Selected: {selectedFile.name}
                </Typography>

                <Button
                  size="small"
                  color="error"
                  onClick={() => {
                    setSelectedFile(null);
                    setAttachmentError("");
                  }}
                >
                  Remove
                </Button>
              </Stack>

              {previewUrl && (
                <Box
                  component="img"
                  src={previewUrl}
                  alt="Attachment preview"
                  sx={{
                    display: "block",
                    mt: 2,
                    maxWidth: 220,
                    maxHeight: 160,
                    objectFit: "contain",
                    borderRadius: 2,
                    border: "1px solid #e5eaf1",
                  }}
                />
              )}
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          <Stack
            direction={{
              xs: "column-reverse",
              sm: "row",
            }}
            justifyContent="flex-end"
            spacing={2}
          >
            <Button
              variant="outlined"
              color="inherit"
              onClick={handleCancel}
              sx={{
                textTransform: "none",
                px: 3,
              }}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="contained"
              sx={{
                textTransform: "none",
                px: 3,
                backgroundColor: "#2563eb",
                boxShadow: "none",
                "&:hover": {
                  backgroundColor: "#1d4ed8",
                  boxShadow: "none",
                },
              }}
            >
              Create Ticket
            </Button>
          </Stack>
        </Box>
      </Paper>

      <Snackbar
        open={successOpen}
        autoHideDuration={2200}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        onClose={handleSuccessClose}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={handleSuccessClose}
        >
          Ticket created successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default CreateTicketPage;
