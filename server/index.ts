import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { Server } from "socket.io";
import { createServer } from "http";
import projectRoutes from "./routers/project.js";
import fileRoutes from "./routers/file.js";
import globalErrorHandlerMiddleware from "./middlewares/errorHandler.js";

const app = express();
const server = createServer(app);
const userSocketMap: Record<string, string> = {};

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.set("socketio", io);
app.set("userSocketMap", userSocketMap);

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

app.use(`/api/project`, projectRoutes);
app.use(`/api/file`, fileRoutes);

app.use("/", express.static("codeFiles"));

app.use(globalErrorHandlerMiddleware);

io.on("connection", (socket) => {
  console.log("client is connected");

  socket.on("register", (user: string) => {
    userSocketMap[user] = socket.id;
    console.log(userSocketMap);
  });
});
// app.listen(3000, () => {
//   console.log("Server is listening on port 3000");
// });

server.listen(3000, () => {
  console.log("Express app is running on port 3000");
});
