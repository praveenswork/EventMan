// server/index.js
const express = require("express");
const nodemailer = require("nodemailer");
const admin = require("firebase-admin");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin SDK
const serviceAccount = require("./serviceAccountKey.json"); // Download from Firebase Console
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "your-email@gmail.com",
    pass: "your-app-password", // Use an App Password if 2FA is enabled
  },
});

app.post("/send-invite", async (req, res) => {
  const { email, eventId, token } = req.body;
  const eventDoc = await db.collection("events").doc(eventId).get();
  const event = eventDoc.data();
  const inviteLink = `http://localhost:5173/register?token=${token}`;

  const mailOptions = {
    from: "your-email@gmail.com",
    to: email,
    subject: `Invitation to ${event.name}`,
    html: `
      <h1>You’re Invited to ${event.name}!</h1>
      <p>Date: ${event.date}</p>
      <p>Location: ${event.location}</p>
      <p>Description: ${event.description}</p>
      <p>Please register here: <a href="${inviteLink}">${inviteLink}</a></p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send("Invite sent successfully!");
  } catch (error) {
    console.error("Error sending invite:", error);
    res.status(500).send("Failed to send invite.");
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
