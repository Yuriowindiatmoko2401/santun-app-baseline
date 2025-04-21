// Only import server-side modules in server contexts
import type { NextApiRequest, NextApiResponse } from 'next';
import type { NextRequest } from 'next/server';

// Type definitions for better TypeScript support
type ServerType = any; // Will be properly typed in the server-only file

// This is a drop-in replacement for Pusher in local development

// This is a placeholder - actual server implementation will be in a server-only file
let io: ServerType | null = null;

// Store events in localStorage for local development messaging
const LOCAL_STORAGE_EVENT_KEY = 'local_pusher_events';

// Simplified Pusher Server replacement that works in all contexts
class LocalPusherServer {
  trigger(channel: string, event: string, data: any) {
    // In browser environments, this is just a stub
    // The actual implementation is on the server-side
    if (typeof window === 'undefined' && typeof process !== 'undefined') {
      // Only try to use io in server environments
      console.log(`[Server] Trigger event ${event} to channel ${channel}`);
      
      // Store the event in a global cache that we'll poll for in the client
      try {
        // We're using a timestamp to ensure each message has a unique key
        const eventData = {
          channel,
          event,
          data,
          timestamp: Date.now()
        };
        
        // In local dev, we'll use a custom storage mechanism
        // This simulates the Pusher service for local development
        global.localStorage = global.localStorage || {};
        global.localStorage[`${LOCAL_STORAGE_EVENT_KEY}_${channel}_${Date.now()}`] = JSON.stringify(eventData);
      } catch (error) {
        console.error('[Server] Error storing event data:', error);
      }
    }
    return Promise.resolve({ success: true });
  }
}

// Simplified mock Pusher Client that doesn't try to use socket.io
// This is a client-safe implementation
class LocalPusherClient {
  private channels: Map<string, { 
    callbacks: Record<string, Function>;
    bind: (event: string, callback: Function) => void;
  }> = new Map();
  private pollingInterval: any = null;
  private lastEventTimestamp = Date.now();
  
  constructor() {
    console.log('[Client] LocalPusher initialized (enhanced mode)');
    
    // Initialize polling to simulate real-time updates
    if (typeof window !== 'undefined') {
      this.startPolling();
    }
  }
  
  subscribe(channelName: string) {
    console.log(`[Client] Subscribing to channel: ${channelName}`);
    
    // Create a channel that will actually handle events
    const channel = {
      callbacks: {} as Record<string, Function>,
      bind: function(event: string, callback: Function) {
        console.log(`[Client] Binding to event: ${event} on channel: ${channelName}`);
        this.callbacks[event] = callback;
      }
    };
    
    this.channels.set(channelName, channel);
    
    // Start polling if not already started
    if (!this.pollingInterval && typeof window !== 'undefined') {
      this.startPolling();
    }
    return channel;
  }
  
  // Add any other methods you might need for your app
  unsubscribe(channelName: string) {
    console.log(`[Client] Unsubscribing from channel: ${channelName}`);
    this.channels.delete(channelName);
  }
  
  // Simulate real-time updates with polling
  private startPolling() {
    // Clear any existing intervals
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
    
    // Poll for new events every 1 second
    this.pollingInterval = setInterval(() => {
      this.checkForNewEvents();
    }, 1000);
    
    console.log('[Client] Started polling for messages');
  }
  
  private checkForNewEvents() {
    if (typeof window === 'undefined') return;
    
    try {
      // Check localStorage for any messages that match our subscribed channels
      const keys = Object.keys(localStorage);
      const eventKeys = keys.filter(k => k.startsWith(LOCAL_STORAGE_EVENT_KEY));
      
      if (eventKeys.length === 0) return;
      
      // Process all events
      for (const key of eventKeys) {
        try {
          const eventJson = localStorage.getItem(key);
          if (!eventJson) continue;
          
          const eventData = JSON.parse(eventJson);
          
          // Check if this is a new event (after our last check)
          if (eventData.timestamp <= this.lastEventTimestamp) continue;
          
          // Check if we have a subscription for this channel
          const channel = this.channels.get(eventData.channel);
          if (channel && channel.callbacks) {
            const callback = channel.callbacks[eventData.event];
            if (callback) {
              // Call the callback with the event data
              console.log(`[Client] Received event ${eventData.event} on channel ${eventData.channel}`);
              callback(eventData.data);
            }
          }
          
          // Update our timestamp
          this.lastEventTimestamp = Math.max(this.lastEventTimestamp, eventData.timestamp);
          
          // Remove the processed event
          localStorage.removeItem(key);
        } catch (err) {
          console.error('[Client] Error processing event:', err);
        }
      }
    } catch (error) {
      console.error('[Client] Error checking for events:', error);
    }
  }
}

// Simple stub for API handler
export function createSocketIOHandler() {
  return (req: NextApiRequest | NextRequest, res: NextApiResponse) => {
    res.status(200).json({ status: 'mock socket.io initialized' });
  };
}

// Conditionally export local or actual Pusher instances
export const localPusherServer = new LocalPusherServer();
export const localPusherClient = new LocalPusherClient();
