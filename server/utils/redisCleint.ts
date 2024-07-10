import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const pubClient = createClient({
  url: `redis://${process.env.AWS_REDIS_ENDPOINT}:6379`,
});
const subClient = pubClient.duplicate();

const connectPubAndSub = async () => {
  await Promise.all([pubClient.connect(), subClient.connect()]);
  return { pubClient, subClient };
};

export default connectPubAndSub;
