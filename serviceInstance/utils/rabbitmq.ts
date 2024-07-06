import * as amqp from "amqplib";
import dotenv from "dotenv";

dotenv.config();

let connection: amqp.Connection | null = null;
let channel: amqp.Channel | null = null;

export async function getRabbitMQChannel(): Promise<amqp.Channel> {
  if (channel) {
    return channel;
  }

  if (!connection) {
    connection = await amqp.connect(`amqp://${process.env.RABBITMQ_SERVER}`);
  }

  channel = await connection.createChannel();
  return channel;
}

export async function closeRabbitMQConnection() {
  if (channel) {
    await channel.close();
    channel = null;
  }
  if (connection) {
    await connection.close();
    connection = null;
  }
}
