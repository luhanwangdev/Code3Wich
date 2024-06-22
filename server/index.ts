import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { Server } from "socket.io";
import { createServer } from "http";
import { createProxyMiddleware } from "http-proxy-middleware";
import { fileURLToPath } from "url";
import { dirname } from "path";
import projectRoutes from "./routers/project.js";
import fileRoutes from "./routers/file.js";
import userRoutes from "./routers/user.js";
import globalErrorHandlerMiddleware from "./middlewares/errorHandler.js";

const app = express();
const server = createServer(app);
const userSocketMap: Record<string, string> = {};
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.set("socketio", io);
app.set("userSocketMap", userSocketMap);

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use("/container/:port", (req, res, next) => {
  const { port } = req.params;
  createProxyMiddleware({
    target: `http://localhost:${port}`,
    changeOrigin: true,
    pathRewrite: {
      "^/container/\\d+": "",
    },
  })(req, res, next);
});

app.use("/api/project", projectRoutes);
app.use("/api/file", fileRoutes);
app.use("/api/user", userRoutes);

app.use("/", express.static("codeFiles"));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.use(globalErrorHandlerMiddleware);

io.on("connection", (socket) => {
  console.log("client is connected");

  socket.on("register", (user: string) => {
    userSocketMap[user] = socket.id;
    console.log(userSocketMap);

    socket.emit("registered", "success");
  });
});
// app.listen(3000, () => {
//   console.log("Server is listening on port 3000");
// });

server.listen(3000, () => {
  console.log("Express app is running on port 3000");
});
