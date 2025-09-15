# EventMan

EventMan is a web-based platform for smooth event management—built with React, Firebase, and modern tooling. Organizers can create/manage events, and attendees can register, view schedules, and get updates in real time.

---

## 🚀 Features

- **Event Creation & Listings** – Admins/Organizers can add, edit, and schedule events.  
- **User Registration & Management** – Attendees can sign up; organizers can view registrations.  
- **Real-time Updates & Notifications** – Changes to events are reflected live.  
- **Venue Details & Maps** – Provide attendees with venue information.  
- **Responsive Design & Validation** – Form validation, mobile-friendly UI.  
- **Firebase-backed** – Uses Firestore (or Realtime Database), Firebase authentication, and hosting.

---

## 🛠️ Tech Stack

| Layer | Tools / Libraries |
|-------|---------------------|
| Frontend | React, CSS (or Tailwind / styled-components etc.) |
| Backend / Database | Firebase (Firestore / RTDB) |
| Authentication | Firebase Auth |
| Hosting / Deployment | Firebase Hosting |
| Build / Tooling | Node.js, npm / Yarn, Vite (if used) |

---

## 🔧 Prerequisites

- Node.js (v16 or newer recommended)  
- npm or Yarn  
- Firebase account & project set up  
- Firebase CLI (if you want to deploy)  

---

## ⚙️ Getting Started

1. Clone the repository:  
   ```bash
   git clone https://github.com/praveenswork/EventMan.git
   cd EventMan
2. Install dependencies:

npm install


3. Firebase setup:

Create a Firebase project in the Firebase Console.

Enable services you need (Firestore, Authentication, Hosting).

Copy your Firebase configuration (API key, projectId, etc.).

Replace the placeholder config in src/firebase.js (or wherever your config file is) with your own.

4. Run locally:

npm start


Then open http://localhost:3000 (or the port your dev server shows).

📦 Deployment

To build for production & deploy via Firebase:

npm run build
firebase deploy


Make sure you're logged into Firebase CLI and your project is selected.

⚠️ Troubleshooting / Common Issues
Symptom	Possible Cause	Fix
Form not submitting / data not saved	Firebase config missing / incorrect; rules blocking writes	Confirm config values in your project; check Firestore rules
Authentication failures	Auth not enabled or misconfigured	Enable Firebase Auth (email/password, or provider) and use correct initialization
UI layout broken	CSS or Tailwind setup issues	Check your styles, or rebuild styles; check for missing assets
🤝 Contributing

Feel free to fork this project, make improvements, fix bugs, or add features. If you contribute:

Create a new branch for your changes

Provide clear commit messages

Open a pull request with a description of what you changed and why
