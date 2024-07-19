import express from "express";
import bodyParser from "body-parser";
import projectRoutes from "./routers/project.js";
import fileRoutes from "./routers/file.js";
import userRoutes from "./routers/project.js";
import globalErrorHandlerMiddleware from "./middlewares/errorHandler.js";
import { watcher, startWatcher, stopWatcher } from "./utils/watcher.js";
import setUpLogLogic from "./utils/cloudClient.js";

const app = express();

setUpLogLogic();
startWatcher(watcher);

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/api/project", projectRoutes);
app.use("/api/file", fileRoutes);
app.use("/api/user", userRoutes);

app.use("/", express.static("codeFiles"));

app.use(globalErrorHandlerMiddleware);

app.listen(5000, () => {
  console.log("Run code service is running on port 5000");
});

process.on("SIGINT", async () => {
  await stopWatcher(watcher);
});

process.on("SIGTERM", async () => {
  await stopWatcher(watcher);
});
