import { io } from "socket.io-client";

// const URL = undefined;
const URL = "http://localhost:3000";

export const socket = io(URL);
