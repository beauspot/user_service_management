// external dependencies
import "express-async-errors";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import "reflect-metadata";
import dotenv from "dotenv";
import session from "express-session";
import rateLimit from "express-rate-limit";
import swaggerUI from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";
import MongoStore from "connect-mongo";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Get the current module's URL
const currentModuleUrl = import.meta.url;

// Convert the URL to a file path
const currentModulePath = fileURLToPath(currentModuleUrl);

// Calculate the directory path
const directoryPath = dirname(currentModulePath);
const swaggerDoc = YAML.load(path.join(directoryPath, "../swagger.yaml"));

import errorHandlerMiddleware from "./middlewares/errHandler.js";
import __404_err_page from "./middlewares/notfound.js";
import connectDB from "./config/dbConfig.js";

import userRoute from "./routes/userRoute.js";
import dashboardRoute from "./routes/dashboard.js";

dotenv.config();

const app = express();
app.set("trust proxy", true);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true,
  legacyHeaders: false,
  cookie: { secure: true },
});

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(morgan("dev"));
app.use(limiter);
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: true,
     store: MongoStore.create({
      mongoUrl: process.env.SESSION_STORAGE,
      ttl: 14 * 24 * 60 * 60,
    }),
  })
);

app.get("/", (req, res) => {
  res
    .status(200)
    .send(
      '<h1>User Management Service API</h1><a href="/api-docs">Documentation</a>'
    );
});
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDoc));
app.use("/api/auth/", userRoute);
app.use("/api/", dashboardRoute);

app.use(errorHandlerMiddleware);
app.use("*", __404_err_page);

const Port = process.env.PORT || 4000;

const startServer = async () => {
  try {
    await connectDB(process.env.MONGO_URL);
    app.listen(Port, () =>
      console.info(`Server listening on http:\//localhost:${Port}`)
    );
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

startServer();
