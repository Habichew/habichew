import express from "express";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

// ES module workaround for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Import database pool
import pool from "./config/db.js";

const app = express();

import { fileURLToPath } from "url";
import { dirname } from "path";

// Configuration
const PORT = process.env.BACKEND_PORT || 3000;
const HOST = process.env.HOST || 'localhost'; // Important for Docker
// Database connection test
const testDbConnection = async () => {
  try {
    const conn = await pool.getConnection();
    console.log('MySQL database connected successfully');
    // Release the connection to MySQL
    conn.release();
  } catch (err) {
    console.error('MySQL connection failed:', err.message);
    // Don't exit in development, retry connection
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      console.log('Retrying database connection in 5 seconds...');
      setTimeout(testDbConnection, 5000);
    }
  }
};

// Test database connection on startup
testDbConnection();


// Use Morgan for logging HTTP requests
app.use(morgan("dev"));

// Middleware
app.use(express.json());

// Use CORS
app.use(cors());

app.set("view engine", "ejs");



app.get("/", (req, res) => {
  res.status(200).send("Backend running");
});

/*// profile image upload
app.post("/upload", upload.single("img"), (req, res) => {
  console.log("req.body", req.body);
  if (req.file && req.file.path) {
    res.status(200).send(req.file.path);
  } else {
    res
      .status(400)
      .send({ error: "no file was uploaded", "request-body": req.body });
  }
});*/

/************** ROUTES ******************/

// Users
import {userRouter} from "./routes/userRoute.js";
import {taskRouter} from "./routes/taskRoute.js";
import {habitRouter} from "./routes/habitRoute.js";
import {presetsRouter} from "./routes/presetsRoute.js";
import {moodRouter} from "./routes/moodRoute.js";


// Users
app.use("/users", userRouter);

// Tasks
app.use("/tasks", taskRouter);

// Habits
app.use("/habits", habitRouter);

// Presets
app.use("/presets", presetsRouter);

// Moods
app.use('/moods', moodRouter);

/*

// Pets
app.use("/pets", petRouter);

// Planets
app.use("/planets", planetRouter);

// User Habits
app.use("/userHabits", userHabitRouter);

// Images
app.get("/uploads/:image", function (req, res) {
  res.sendFile(path.join(__dirname, "/uploads/", req.params.image)); // find out the filePath based on given fileName
});*/

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://10.22.198.190:${PORT}/`);
});

export function sendNotImplementedError(response) {
  response.status("500");
  response.send({ "error": "Endpoint not implemented yet."})
}

