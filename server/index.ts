import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { Server } from 'socket.io';
import { createServer } from 'http';

import { createAdapter } from '@socket.io/redis-adapter';
import { createProxyMiddleware } from 'http-proxy-middleware';
import projectRoutes from './routers/project.js';
import fileRoutes from './routers/file.js';
import userRoutes from './routers/user.js';
import globalErrorHandlerMiddleware from './middlewares/errorHandler.js';
import { closeRabbitMQConnection } from './utils/rabbitmq.js';
import setUpLogLogic from './utils/cloudClient.js';
import { getServiceInstanceUrl } from './models/serviceInstance.js';
import { userSocketMap, socketIo } from './utils/socketio.js';
import connectPubAndSub from './utils/redisCleint.js';

const app = express();
const server = createServer(app);

setUpLogLogic();

const { pubClient, subClient } = await connectPubAndSub();

const io = new Server(server, {
  adapter: createAdapter(pubClient, subClient),
  cors: {
    origin: '*',
  },
});

app.set('socketio', io);
app.set('userSocketMap', userSocketMap);
socketIo(io);

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

app.use(globalErrorHandlerMiddleware);

server.listen(3000, () => {
  console.log('Express app is running on port 3000');
});

process.on('SIGINT', async () => {
  await closeRabbitMQConnection();
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGTERM', async () => {
  await closeRabbitMQConnection();
  server.close(() => {
    process.exit(0);
  });
});
