<h1 align="center">Redis Chat App ⚡</h1>

![Demo App](/public/screenshot-for-readme.png)

About This Course:

- ⚛️ Tech Stack: Next.js 14, TypeScript, Tailwind CSS, `UPSTASH` Redis
- 🔐 Authentication
- 💬 Real-Time Messaging
- 📱 Responsive UI
- 🌗 Light and Dark Mode
- 🔔 Notification Sounds
- ⌨️ Satisfying Typing Effects
- 📊 Learn About Redis Data Types
- 📷 Image Uploads
- 🛠️ Integration with Upstash Redis for Scalable Chat
- 💙 Awesome Landing Page
- 🌐 Deployment
- 🚀 And Many More Cool Features
- ✅ This is a lot of work. Support my work by subscribing to the [Channel](https://www.youtube.com/@asaprogrammer_)

## Local Development

You can run this app 100% locally without any external service accounts! See [LOCAL_DEVELOPMENT.md](LOCAL_DEVELOPMENT.md) for detailed instructions.

Quick start:
```bash
# Start local development environment
./start-local.sh

# With test data initialization
./start-local.sh --init-data

# To reset all data
./start-local.sh --reset
```

This will run Redis in Docker and create local replacements for all external services.

## Production Setup

### Setup .env file

```js
KINDE_CLIENT_ID=
KINDE_CLIENT_SECRET=
KINDE_ISSUER_URL=
KINDE_SITE_URL=
KINDE_POST_LOGOUT_REDIRECT_URL=
KINDE_POST_LOGIN_REDIRECT_URL=


UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=


PUSHER_APP_ID=
PUSHER_APP_KEY=
PUSHER_APP_SECRET=
PUSHER_APP_CLUSTER=

NEXT_PUBLIC_PUSHER_APP_KEY=
```

### Install dependencies

```shell
npm install
```

### Start the app

```shell
npm run dev
```
