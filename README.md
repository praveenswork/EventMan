EventMan
EventMan is a web-based platform for seamless management of events, enabling organizers to simplify planning, real-time coordination, and attendee engagement. Built using JavaScript, it helps streamline all event operations from conception to completion.

Features
Event Listings & Scheduling: Organize multiple events, set dates/times, and manage schedules with calendar integration for clear attendee views.

User Registration & Management: Simple attendee sign-up and sessions management for registration workflows.

Live Updates & Notifications: Real-time event changes delivered to users via alert mechanisms to ensure engagement and transparency.

Interactive Venue Details: Display venue maps, session locations, and navigation aids for improved user experience.

Social Sharing: Promote events using built-in social media sharing options.

Analytics: Track registrations, engagement, and feedback for better planning of future events.

Requirements
To run or contribute to EventMan, the following must be installed:

Node.js (v16+ recommended)

Yarn or npm (for package management)

A web browser (Chrome, Firefox, or Edge)

Firebase account and configuration (for hosting/deployment)

Getting Started
Installation
Clone the repository:

bash
git clone https://github.com/praveenswork/EventMan.git
cd EventMan
Install dependencies:

bash
npm install
Set up Firebase:

Create a Firebase project.

Configure web hosting via Firebase Console.

Replace default Firebase configuration with your app's settings in src/firebase.js (or equivalent file).

Start the development server:

bash
npm start
View the app at http://localhost:3000 (or configured port).

Deployment
To deploy the project:

bash
npm run build
firebase deploy
Ensure Firebase CLI is installed and connected to your account.

Usage
Register or log in to access event management features.

Use the dashboard to create new events, manage existing ones, and monitor user participation.

Attendees can RSVP, view session details, and interact with venue maps for navigation.

Organizers can send updates or alerts about schedule changes.

Project Structure
text
EventMan/
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   ├── utils/
└── firebase.js
components/: UI elements and reusable features.

pages/: Main application pages (event list, dashboard, etc.).

utils/: Helper functions and Firebase integration.

Troubleshooting
Common issues can be resolved by ensuring Firebase credentials match your project.

If the app fails to build, check Node and npm versions and reinstall dependencies.

For deployment errors, verify your Firebase CLI connection and hosting configuration.

Contributing
Fork the repository and create your feature branch.

Submit a pull request with a detailed description of your changes.

See CONTRIBUTING.md for contribution guidelines if available.

Adhere to coding standards and project structure.

Useful Links
Live Demo

GitHub Repository

Firebase Hosting Documentation

Node.js Installation Guide
