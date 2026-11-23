# IT Helpdesk Ticket Management System

A React-based IT Helpdesk application built as a **frontend proof of concept (POC)**. It demonstrates how employees can raise IT support tickets and how IT Support Staff can assign, track, update, and resolve those tickets.

The application uses simulated users and roles. Ticket records are maintained in the browser with `localStorage`; a backend server, database, and real authentication are not part of this POC.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Objectives](#objectives)
- [Features](#features)
- [User Roles and Permissions](#user-roles-and-permissions)
- [Ticket Workflow and Business Rules](#ticket-workflow-and-business-rules)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Application Routes](#application-routes)
- [State Management and Data Persistence](#state-management-and-data-persistence)
- [Sample Data](#sample-data)
- [Validation Rules](#validation-rules)
- [Testing Checklist](#testing-checklist)
- [Troubleshooting](#troubleshooting)
- [Known POC Limitations](#known-poc-limitations)
- [Future Improvements](#future-improvements)

---

## Project Overview

Employees regularly need help with issues such as laptop failures, software installation, network connectivity, and access to company systems. This application provides a central interface for recording those issues and following their progress.

The POC demonstrates the main ticket-management workflow:

1. An employee creates a ticket with an issue title, description, category, and priority.
2. IT Support Staff review the ticket and assign it to a support team member.
3. Support Staff move the ticket through the permitted status workflow.
4. Employees and Support Staff can add comments while the ticket is not closed.
5. The ticket details screen displays the current information, comments, and activity history.
6. The dashboard summarises ticket volume and status distribution.

## Objectives

- Demonstrate a complete frontend ticket-management workflow.
- Apply role-based UI behaviour for Employee and IT Support Staff users.
- Implement reusable React components and context-based state management.
- Provide search, filtering, sorting, and pagination for ticket records.
- Validate ticket input and enforce the defined workflow rules.
- Preserve ticket data across browser refreshes using `localStorage`.

## Features

### Dashboard

The dashboard displays six statistics calculated from the ticket data:

- Total Tickets
- Open Tickets
- In Progress Tickets
- Resolved Tickets
- Closed Tickets
- High Priority Tickets

It also displays a Ticket Status Overview using horizontal percentage bars. The counts and percentages are calculated from the current ticket state, so they update when tickets are created or changed.

> The High Priority card counts tickets whose priority is exactly `High`. Tickets marked `Critical` are a separate priority level in this POC.

### Ticket Management

The ticket list provides:

- Ticket ID, title, category, priority, raised-by user, assignee, created date, status, and actions.
- Search by Ticket ID or title.
- Filters for status, priority, category, and assignee.
- Sorting by newest date, oldest date, highest priority, and title (A–Z).
- Pagination with 5, 10, or 20 rows per page.
- A Clear Filters action.
- View and edit navigation for each ticket, subject to role and status restrictions.

Employees see tickets raised by the currently selected employee. IT Support Staff see all tickets.

### Create Ticket

Employees can create tickets. A new ticket receives:

- A generated Ticket ID.
- The currently selected employee as the person who raised it.
- The current date and time.
- An initial status of `Open`.
- An initial assignee of `Unassigned`.
- An initial history entry recording ticket creation.

The form validates the title, description, category, priority, and optional attachment.

### Edit Ticket

The edit screen loads the selected ticket's existing values. Employees can edit their own Open tickets. IT Support Staff can edit Open or In Progress tickets. Ticket ID, raised-by user, and creation date are treated as read-only information.

IT Support Staff can update the assignee from the edit screen while the ticket is Open. Assignment and status workflow actions are also available on the ticket details screen.

### Ticket Details, Comments, and History

The details screen displays ticket information, attachment metadata, comments, and activity history. It supports:

- Adding comments while the ticket is not Closed.
- Assigning or reassigning Open tickets as IT Support Staff.
- Updating status through the allowed status sequence.
- Recording assignment and status changes in ticket history.
- Requiring a resolution comment before a ticket can be marked Resolved.
- Asking for confirmation before a Resolved ticket is Closed.

---

## User Roles and Permissions

The application provides a user selector in the header. It simulates changing the current user; it is not a login system.

| Capability | Employee | IT Support Staff |
|---|:---:|:---:|
| View dashboard | Yes | Yes |
| View tickets | Own tickets only | All tickets |
| Create tickets | Yes | No |
| Edit own Open tickets | Yes | Not applicable |
| Edit Open or In Progress tickets | No | Yes |
| Assign/reassign Open tickets | No | Yes |
| Change ticket status | No | Yes |
| Add comments to non-Closed tickets | Yes, own tickets | Yes |
| View comments and history | Own tickets | All tickets |

Role restrictions are implemented in the frontend for demonstration. They are not secure authorization controls and must not be treated as production security.

## Ticket Workflow and Business Rules

The permitted status sequence is:

```text
Open -> In Progress -> Resolved -> Closed
```

The workflow applies the following rules:

1. Only IT Support Staff can assign tickets and change ticket status.
2. Tickets can only be assigned or reassigned while their status is Open.
3. A ticket must have an assignee before it can move from Open to In Progress.
4. A ticket can move from In Progress to Resolved only when a resolution comment is entered.
5. A confirmation prompt is displayed before closing a Resolved ticket.
6. Closed tickets cannot receive new comments and cannot be edited.
7. Employees can edit only their own tickets while those tickets are Open.
8. IT Support Staff can edit tickets while they are Open or In Progress.

## Technology Stack

| Technology | Purpose |
|---|---|
| React | Component-based user interface |
| JavaScript (ES modules) | Application logic |
| Vite | Development server and production build tool |
| Material UI (MUI) | UI components and styling |
| React Router | Client-side page routing |
| React Context and Hooks | Shared user and ticket state |
| Browser `localStorage` | Persistence of ticket records |
| Oxlint | JavaScript/React linting |

The dependency versions are maintained in `package.json` and the lockfile.

## Prerequisites

Install the following before running the project:

- Node.js version compatible with the Vite version declared in `package.json`.
- npm (included with Node.js).
- Git, if you are cloning the repository.
- A modern browser such as Chrome, Edge, Firefox, or Safari.

To check your installed versions:

```bash
node --version
npm --version
```

## Getting Started

### 1. Clone the repository

Replace the URL with the URL of your GitHub repository:

```bash
git clone https://github.com/<your-username>/it-helpdesk-ticket-management.git
```

### 2. Open the project directory

```bash
cd it-helpdesk-ticket-management
```

### 3. Install dependencies

If the repository contains `package-lock.json`, use:

```bash
npm ci
```

If there is no npm lockfile, use:

```bash
npm install
```

### 4. Start the development server

```bash
npm run dev
```

Vite prints a local URL in the terminal (usually `http://localhost:5173`). Open that URL in your browser.

### 5. Create a production build

```bash
npm run build
```

The generated production files are placed in the `dist/` directory.

### 6. Preview the production build locally

After building:

```bash
npm run preview
```

Use the local URL printed by Vite to preview the built application.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the Vite development server. |
| `npm run lint` | Runs Oxlint on the project. |
| `npm run build` | Creates the production build in `dist/`. |
| `npm run preview` | Serves the production build locally for preview. |

There is currently no dedicated `npm test` script or automated unit-test suite configured in `package.json`. Use the lint/build commands and the manual test checklist below.

## Project Structure

```text
it-helpdesk-ticket-management/
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── assets/
│   ├── components/
│   │   └── layout/
│   │       ├── AppHeader.jsx
│   │       ├── AppLayout.jsx
│   │       └── AppSidebar.jsx
│   ├── context/
│   │   ├── TicketContext.jsx
│   │   └── UserContext.jsx
│   ├── data/
│   │   └── sampleTickets.js
│   ├── pages/
│   │   ├── CreateTicketPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── EditTicketPage.jsx
│   │   ├── TicketDetailsPage.jsx
│   │   └── TicketManagementPage.jsx
│   ├── services/
│   │   └── userService.js
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
├── package-lock.json
├── pnpm-lock.yaml
└── vite.config.js
```

### Important files

- `src/main.jsx` — mounts React, React Router, `UserProvider`, and `TicketProvider`.
- `src/App.jsx` — defines the application routes.
- `src/context/UserContext.jsx` — stores the selected demo user and exposes the selected user's role.
- `src/context/TicketContext.jsx` — stores tickets and provides add, update, delete, and lookup functions.
- `src/data/sampleTickets.js` — contains the initial sample ticket data.
- `src/pages/` — contains the dashboard and ticket screens.
- `src/components/layout/` — contains the shared header, sidebar, and application layout.

## Application Routes

| Route | Page | Purpose |
|---|---|---|
| `/` | Redirect | Redirects to `/dashboard`. |
| `/dashboard` | Dashboard | Shows ticket statistics and status distribution. |
| `/tickets` | Ticket Management | Lists and filters tickets according to the selected role. |
| `/create-ticket` | Create Ticket | Displays the ticket creation form for employees. |
| `/tickets/:ticketId` | Ticket Details | Shows ticket information, assignment, status controls, comments, and history. |
| `/tickets/:ticketId/edit` | Edit Ticket | Edits a ticket when the selected role and ticket status permit it. |

## State Management and Data Persistence

### User state

`UserContext` provides:

- The available demo users.
- The selected user and selected user ID.
- The selected user's role (`Employee` or `IT Support Staff`).
- A function to switch the selected demo user.

The selected demo user is held in React state. This is a simulation, not persistent authentication.

### Ticket state

`TicketContext` provides:

- `tickets` — the current ticket array.
- `addTicket(newTicket)` — adds a ticket to the ticket list.
- `updateTicket(ticketId, updatedFields)` — updates an existing ticket.
- `deleteTicket(ticketId)` — removes a ticket from state.
- `getTicketById(ticketId)` — finds a ticket by ID.

### localStorage

Ticket data is saved using this browser storage key:

```text
it-helpdesk-tickets
```

On application startup, the context checks for saved ticket data. If a valid saved ticket array exists, it is loaded. If no saved data exists, the initial sample tickets are used. Ticket changes are written back to `localStorage`.

**Important:** `localStorage` is specific to the browser and origin on the current device. It is not shared between different users, browsers, or computers. Clearing site data can remove saved ticket changes.

To reset the POC to its original sample tickets, open the browser developer console on the application's origin and run:

```javascript
localStorage.removeItem("it-helpdesk-tickets");
window.location.reload();
```

This deletes the locally saved ticket changes for this application in that browser. Use it only when you intentionally want to reset the data.

## Sample Data

The project starts with 15 sample tickets in `src/data/sampleTickets.js` when no valid saved ticket array is present in localStorage.

The demo user selector includes employee identities used by the sample ticket records, additional demo employees, and five IT Support Staff identities. This allows the role selector to be used to test the Employee and IT Support Staff views without a real login system.

## Validation Rules

### Ticket form

- Title is required and must contain between 5 and 100 characters after trimming whitespace.
- Description is required and must contain at least 20 characters after trimming whitespace.
- Category is required.
- Priority is required.
- An optional attachment must be a PDF, JPG, JPEG, or PNG file.
- The attachment size must not exceed 2 MB.

### Ticket editing

The edit form applies the title and description length checks and updates the existing ticket rather than creating a new ticket.

### Workflow

- A ticket must be assigned before it can move to `In Progress`.
- A resolution comment is required before moving to `Resolved`.
- Closing a resolved ticket requires confirmation.
- Comments cannot be added to a Closed ticket.

## Testing Checklist

Run these checks before submitting changes:

### Automated project checks

```bash
npm run lint
npm run build
```

Both commands should complete without errors.

### Manual functional checks

- [ ] Open the application and confirm the sample tickets are available.
- [ ] Select an Employee and confirm only that employee's tickets are shown.
- [ ] Select IT Support Staff and confirm all tickets are shown.
- [ ] Create a valid ticket and confirm it appears in the ticket list.
- [ ] Submit invalid title and description values and confirm validation appears.
- [ ] Try an unsupported attachment type and a file larger than 2 MB.
- [ ] Search by ticket ID and by title.
- [ ] Apply multiple filters and then clear them.
- [ ] Test each sorting option.
- [ ] Change the page size and navigate between pages.
- [ ] Open a ticket and verify its details, comments, and history.
- [ ] Assign an Open ticket as IT Support Staff.
- [ ] Confirm an unassigned ticket cannot move to In Progress.
- [ ] Move an assigned ticket through In Progress and Resolved.
- [ ] Confirm a resolution comment is required.
- [ ] Confirm a prompt appears before closing a Resolved ticket.
- [ ] Confirm a Closed ticket cannot receive comments or be edited.
- [ ] Refresh the page and confirm ticket changes remain.
- [ ] Confirm dashboard figures update after ticket changes.
- [ ] Open a nonexistent ticket ID and confirm a friendly not-found message appears.
- [ ] Check the layout at desktop, tablet, and mobile widths.

## Troubleshooting

### `npm` or `node` command not found

Install Node.js, close and reopen the terminal, and run `node --version` and `npm --version` again.

### Dependencies fail to install

Check your internet connection and registry access. If using npm and the repository has `package-lock.json`, try:

```bash
npm ci
```

### Port 5173 is already in use

Vite may select another available port and print it in the terminal. Open the exact URL shown by Vite. Alternatively, stop the process using the existing port before restarting the development server.

### A ticket does not appear for an Employee

Check the selected employee in the header and confirm the ticket's `raisedBy` value matches that user's name. Employee mode intentionally displays only tickets raised by the selected employee.

### Old ticket data appears after changing sample data

The application loads saved ticket records from `localStorage` before falling back to the sample data. To load the updated sample data, remove the `it-helpdesk-tickets` key as described in [State Management and Data Persistence](#state-management-and-data-persistence). This also removes locally saved ticket changes.

### A page displays a blank screen or an error

Check the browser developer console and terminal for the first error. Confirm dependencies are installed and that the route and component imports are correct.

## Known POC Limitations

- There is no backend API or database for ticket records.
- Ticket data is stored only in the current browser's `localStorage`.
- The user selector simulates users; there is no real login, password handling, session management, or authentication.
- Role-based restrictions are frontend-only and can be bypassed by a user with browser developer tools.
- Attachments are selected and validated in the browser. The ticket record stores attachment metadata (name, type, and size); the application does not upload the file to a server or provide persistent file storage.
- There is no dedicated automated unit or integration test suite configured at present.

This project is intended for learning and demonstration, not deployment as a production helpdesk system.

## Future Improvements

Possible next steps beyond the current POC include:

- Build a backend API and database for shared ticket storage.
- Add real authentication and server-side role-based authorization.
- Store uploaded attachments in persistent file storage.
- Add automated unit and component tests.
- Add stronger error and success feedback for storage and update operations.
- Add audit logging and administrative user management.
- Add deployment configuration and environment-specific settings.

---

## Project Status

This repository contains a frontend Helpdesk POC demonstrating the core employee and IT Support Staff ticket workflows. Run the lint and production build commands, then complete the manual testing checklist before submission.
