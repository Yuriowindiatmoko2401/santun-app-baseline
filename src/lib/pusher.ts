import PusherServer from "pusher";
import PusherClient from "pusher-js";
import { localPusherServer, localPusherClient } from "./socketio-local";

// Check if we're using local services
const isLocalDev = process.env.USE_LOCAL_SERVICES === 'true';

declare global {
	var pusherServer: PusherServer | any;
	var pusherClient: PusherClient | any;
}

// Use local Socket.io implementation or Pusher based on environment
if (isLocalDev) {
  // Use local implementations for development
  global.pusherServer = localPusherServer;
  global.pusherClient = localPusherClient;
} else if (!global.pusherServer || !global.pusherClient) {
  // Use actual Pusher for production
  global.pusherServer = new PusherServer({
    appId: process.env.PUSHER_APP_ID!,
    key: process.env.PUSHER_APP_KEY!,
    secret: process.env.PUSHER_APP_SECRET!,
    cluster: "eu",
    useTLS: true,
  });
  
  global.pusherClient = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, { 
    cluster: "eu" 
  });
}

export const pusherServer = global.pusherServer;
export const pusherClient = global.pusherClient;
