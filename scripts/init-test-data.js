// Script to initialize test data in Redis for local development
// Run with: node scripts/init-test-data.js

const Redis = require('ioredis');

// Connect to the local Redis instance
const redis = new Redis('redis://localhost:6379');

// Test users
const users = [
  {
    id: 'local_user1',
    name: 'John Doe',
    email: 'john@example.com',
    image: '/avatars/user1.png',
  },
  {
    id: 'local_user2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    image: '/avatars/user2.png',
  },
  {
    id: 'local_user3',
    name: 'Robert Johnson',
    email: 'robert@example.com',
    image: '/avatars/user3.png',
  },
  {
    id: 'local_user4',
    name: 'Alice Williams',
    email: 'alice@example.com',
    image: '/avatars/user4.png',
  },
];

// Test messages between users 1 and 2
const messages = [
  {
    senderId: 'local_user1',
    content: 'Hey, how are you?',
    timestamp: Date.now() - 1000000,
    messageType: 'text',
  },
  {
    senderId: 'local_user2',
    content: 'I\'m good! How about you?',
    timestamp: Date.now() - 900000,
    messageType: 'text',
  },
  {
    senderId: 'local_user1',
    content: 'Doing well, thanks for asking!',
    timestamp: Date.now() - 800000,
    messageType: 'text',
  },
  {
    senderId: 'local_user2',
    content: 'What are you working on?',
    timestamp: Date.now() - 700000,
    messageType: 'text',
  },
  {
    senderId: 'local_user1',
    content: 'Just trying out this chat app!',
    timestamp: Date.now() - 600000,
    messageType: 'text',
  },
];

// Initialize the database with test data
async function initializeTestData() {
  try {
    console.log('🔄 Initializing Redis with test data...');
    
    // Add users to Redis
    for (const user of users) {
      const userId = `user:${user.id}`;
      await redis.hset(userId, user);
      console.log(`✅ Added user: ${user.name}`);
    }
    
    // Create a conversation between users 1 and 2
    const participant1 = users[0].id;
    const participant2 = users[1].id;
    const conversationId = `conversation:${[participant1, participant2].sort().join(':')}`;
    
    await redis.hset(conversationId, {
      participant1,
      participant2,
    });
    
    await redis.sadd(`user:${participant1}:conversations`, conversationId);
    await redis.sadd(`user:${participant2}:conversations`, conversationId);
    
    console.log(`✅ Created conversation between ${users[0].name} and ${users[1].name}`);
    
    // Add messages to the conversation
    for (const message of messages) {
      const messageId = `message:${message.timestamp}:${Math.random().toString(36).substring(2, 9)}`;
      await redis.hset(messageId, message);
      // Fix: zadd requires score and member as separate arguments
      await redis.zadd(`${conversationId}:messages`, message.timestamp, messageId);
    }
    
    console.log(`✅ Added ${messages.length} messages to the conversation`);
    
    console.log('✨ Database initialization complete!');
    console.log('👉 You can now log in as dev@example.com or use these test accounts for testing');
    
  } catch (error) {
    console.error('❌ Error initializing test data:', error);
  } finally {
    // Close the Redis connection
    redis.quit();
  }
}

// Run the initialization
initializeTestData();
