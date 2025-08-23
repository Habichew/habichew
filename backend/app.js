import express from "express";
import morgan from "morgan";
import cors from "cors";
// import mariadb from "mariadb";
import multer from "multer";
import dotenv from "dotenv";
import path from "path";

// ES module workaround for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, './.env') });

// Import database pool
import pool from "./config/db.js";

const app = express();

import { fileURLToPath } from "url";
import { dirname } from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);
    const filename = file.fieldname + "-" + uniqueSuffix;
    req.body.file = filename;
    cb(null, filename);
  },
});

export const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/png'
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      const err = new Error('Only .jpg .jpeg .png images are supported!');
      err.name = 'ExtensionError';
      return cb(err);
    }
  },
  limits: { fileSize: 5 * 1000 * 1000 },
});

// Configuration
const PORT = process.env.BACKEND_PORT || 3000;
const HOST = process.env.HOST || 'localhost'; // Important for Docker
// Database connection test
const testDbConnection = async () => {
  try {
    const conn = await pool.getConnection();
    console.log('MariaDB database connected successfully');
    // Release the connection to MySQL
    conn.release();
  } catch (err) {
    console.error('MariaDB connection failed:', err.message);
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

app.set('json replacer', (key, value) =>
    typeof value === 'bigint' ? Number(value) : value
);


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

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}/`);
});

export function sendNotImplementedError(response) {
  response.status("500");
  response.send({ "error": "Endpoint not implemented yet."})
}

