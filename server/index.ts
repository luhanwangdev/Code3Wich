import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path, { dirname } from 'path';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { fileURLToPath } from 'url';
import projectRoutes from './routers/project.js';
import fileRoutes from './routers/file.js';
import userRoutes from './routers/user.js';
import globalErrorHandlerMiddleware from './middlewares/errorHandler.js';
import { watcher, startWatcher, stopWatcher } from './utils/watcher.js';
import { closeRabbitMQConnection } from './utils/rabbitmq.js';
import setUpLogLogic from './utils/cloudClient.js';
import { getServiceInstanceUrl } from './models/serviceInstance.js';

const app = express();
const server = createServer(app);
const userSocketMap: Record<string, string> = {};
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

setUpLogLogic();
startWatcher(watcher);

const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

app.set('socketio', io);
app.set('userSocketMap', userSocketMap);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use('/container/:route/', async (req, res, next) => {
  const { route } = req.params as unknown as { route: number };
  const port = Math.floor(route / 100);
  const serviceInstanceId = route % 100;

  const serviceInstanceUrl = await getServiceInstanceUrl(serviceInstanceId);

  createProxyMiddleware({
    target: `http://${serviceInstanceUrl}:${port}/`,
    changeOrigin: true,
  })(req, res, next);
});

app.use('/api/project', projectRoutes);
app.use('/api/file', fileRoutes);
app.use('/api/user', userRoutes);

app.use('/', express.static('codeFiles'));

// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });

app.use(globalErrorHandlerMiddleware);

io.on('connection', (socket) => {
  // console.log('client is connected');

  socket.on('register', (user, callback) => {
    userSocketMap[user] = socket.id;
    // console.log(userSocketMap);

    callback('success');
  });

  socket.on('projectStatus', (data) => {
    socket.broadcast.emit('projectStatus', data);
  });
});
// app.listen(3000, () => {
//   console.log("Server is listening on port 3000");
// });

server.listen(3000, () => {
  console.log('Express app is running on port 3000');
});

process.on('SIGINT', async () => {
  await closeRabbitMQConnection();
  await stopWatcher(watcher);
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGTERM', async () => {
  await closeRabbitMQConnection();
  await stopWatcher(watcher);
  server.close(() => {
    process.exit(0);
  });
});
