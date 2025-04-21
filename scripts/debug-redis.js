// Debug script to check Redis keys and their types
const Redis = require('ioredis');

async function debugRedis() {
  const redis = new Redis('redis://localhost:6379');
  
  try {
    console.log('🔍 Checking Redis database');
    
    // Get all keys
    const keys = await redis.keys('*');
    console.log(`Found ${keys.length} keys in Redis`);
    
    // Group keys by pattern
    const keyGroups = {
      users: [],
      conversations: [],
      messages: [],
      userConversations: [],
      conversationMessages: [],
      other: []
    };
    
    // Check each key's type
    for (const key of keys) {
      const type = await redis.type(key);
      
      console.log(`Key: ${key}, Type: ${type}`);
      
      if (key.startsWith('user:') && !key.includes(':conversations')) {
        keyGroups.users.push({ key, type });
      } else if (key.startsWith('conversation:') && !key.includes(':messages')) {
        keyGroups.conversations.push({ key, type });
      } else if (key.startsWith('message:')) {
        keyGroups.messages.push({ key, type });
      } else if (key.includes(':conversations')) {
        keyGroups.userConversations.push({ key, type });
      } else if (key.includes(':messages')) {
        keyGroups.conversationMessages.push({ key, type });
      } else {
        keyGroups.other.push({ key, type });
      }
    }
    
    // Print key groups
    console.log('\n📊 Key Groups Summary:');
    for (const [group, keys] of Object.entries(keyGroups)) {
      console.log(`\n🔑 ${group.toUpperCase()} (${keys.length}):`);
      if (keys.length > 0) {
        for (const { key, type } of keys) {
          console.log(`  - ${key} (${type})`);
        }
      }
    }
    
    // Test specific operations that might be failing
    console.log('\n🧪 Testing potentially problematic operations:');
    
    // Check user keys
    for (const { key } of keyGroups.users) {
      try {
        const userData = await redis.hgetall(key);
        console.log(`✅ HGETALL ${key} - Success`);
      } catch (error) {
        console.error(`❌ HGETALL ${key} - Error: ${error.message}`);
      }
    }
    
    // Check conversation keys
    for (const { key } of keyGroups.conversations) {
      try {
        const conversationData = await redis.hgetall(key);
        console.log(`✅ HGETALL ${key} - Success`);
      } catch (error) {
        console.error(`❌ HGETALL ${key} - Error: ${error.message}`);
      }
    }
    
    // Check conversation:messages keys (likely causing the problem)
    for (const { key } of keyGroups.conversationMessages) {
      try {
        const messageIds = await redis.zrange(key, 0, -1);
        console.log(`✅ ZRANGE ${key} - Success, found ${messageIds.length} messages`);
      } catch (error) {
        console.error(`❌ ZRANGE ${key} - Error: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('Error debugging Redis:', error);
  } finally {
    redis.quit();
  }
}

debugRedis();
