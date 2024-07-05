import {
  CloudWatchLogsClient,
  CreateLogGroupCommand,
  CreateLogStreamCommand,
  PutLogEventsCommand,
} from "@aws-sdk/client-cloudwatch-logs";
import dotenv from "dotenv";

dotenv.config();

interface AwsConfig {
  credentials: {
    accessKeyId: string;
    secretAccessKey: string;
  };
  region: string;
}

const awsConfig: AwsConfig = {
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
  region: process.env.AWS_REGION || "",
};

const cloudwatchlogs = new CloudWatchLogsClient(awsConfig);

const logGroupName = process.env.AWS_LOG_GROUP;
const logStreamName = process.env.AWS_LOG_STREAM;

const createLogGroup = async () => {
  try {
    const command = new CreateLogGroupCommand({ logGroupName });
    await cloudwatchlogs.send(command);
    console.log(`Log group ${logGroupName} created successfully.`);
  } catch (err: any) {
    if (err.name !== "ResourceAlreadyExistsException") {
      console.error("Error creating log group:", err);
    }
  }
};

const createLogStream = async () => {
  try {
    const command = new CreateLogStreamCommand({ logGroupName, logStreamName });
    await cloudwatchlogs.send(command);
    console.log(`Log stream ${logStreamName} created successfully.`);
  } catch (err: any) {
    if (err.name !== "ResourceAlreadyExistsException") {
      console.error("Error creating log stream:", err);
    }
  }
};

const putLogEvents = async (message: string) => {
  const params = {
    logGroupName,
    logStreamName,
    logEvents: [
      {
        message,
        timestamp: Date.now(),
      },
    ],
  };

  try {
    await cloudwatchlogs.send(new PutLogEventsCommand(params));
  } catch (err: any) {
    console.error("Error putting log events:", err);
  }
};

const setUpLogLogic = async () => {
  await createLogGroup();
  await createLogStream();

  const originalConsoleLog = console.log;
  console.log = (...args) => {
    originalConsoleLog.apply(console, args);
    const logMessage = args.join(" ");
    putLogEvents(
      `Service Instance ${process.env.SERVICE_INSTANCE_ID}: ${logMessage}`
    );
  };
};

export default setUpLogLogic;
