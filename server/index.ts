import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import projectRoutes from "./routers/project.js";
import fileRoutes from "./routers/file.js";
import globalErrorHandlerMiddleware from "./middlewares/errorHandler.js";

const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

app.use(`/api/project`, projectRoutes);
app.use(`/api/file`, fileRoutes);

app.use(globalErrorHandlerMiddleware);

app.listen(3000, () => {
  console.log("Server is listening on port 3000");
});
