##EventMan

#About
EventMan is a web-based platform for managing events smoothly, designed to help organizers handle planning, coordination, and attendee engagement. Built using JavaScript.

#Features
Event Listings & Scheduling: Organize and schedule events with calendar views.

User Registration & Management: Attendee registration and management workflows.

Live Updates & Notifications: Real-time alerts for event changes.

Interactive Venue Details: Maps and location aids.

Social Sharing: Options for promoting events on social media.

#Analytics: Track registrations and engagement.

Requirements
Node.js (v16+ recommended)

Yarn or npm

Modern web browser (Chrome, Firefox, Edge)

Firebase account for hosting/deployment

Getting Started
Installation
bash
git clone https://github.com/praveenswork/EventMan.git
cd EventMan
npm install
Firebase Setup
Create a Firebase project.

Configure web hosting on Firebase.

Replace default Firebase config in src/firebase.js with your own details.

Development Server
bash
npm start
Visit http://localhost:3000 in your browser.

Deployment
bash
npm run build
firebase deploy
Make sure Firebase CLI is installed and configured.

Usage
Register/log in to manage events.

Use dashboard for event creation and participant monitoring.

Attendees can RSVP, check schedules, and navigate venues.

Organizers can send live updates to participants.

Project Structure
text
EventMan/
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   ├── utils/
└── firebase.js
components/: UI building blocks

pages/: Main app pages

utils/: Helper scripts and Firebase integration

Troubleshooting
Verify Firebase credentials for connection issues.

If build fails, check Node/npm versions, reinstall dependencies.

Deployment problems: confirm Firebase setup and CLI login.

Contributing
Fork the repo and create a new branch for changes.

Open pull requests with clear descriptions.

Follow coding standards and the project folder structure.

Refer to CONTRIBUTING.md for detailed guidelines if available.

Useful Links
Live Demo

GitHub Repository

Firebase Hosting guide

Node.js setup instructions
