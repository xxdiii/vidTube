# VidTube API

A backend for a YouTube-style video platform, built with Node.js, Express and MongoDB. Users can upload and manage videos, comment, like, subscribe to channels, build playlists, post short "tweets", and view a channel dashboard.

## Tech stack

- **Runtime / framework:** Node.js (ES modules), Express 5
- **Database:** MongoDB with Mongoose (aggregation pipelines + `mongoose-aggregate-paginate-v2`)
- **Auth:** JWT access + refresh tokens (stored in cookies), passwords hashed with bcrypt
- **File uploads:** Multer (temporary local storage) → Cloudinary (permanent storage for videos, thumbnails, avatars and cover images)

## Project structure

```
src/
├── app.js            # Express app, middleware and route mounting
├── index.js          # Entry point: loads env, connects DB, starts server
├── db/               # MongoDB connection
├── models/           # Mongoose schemas (User, Video, Comment, Like, Playlist, Subscription, Tweet)
├── controllers/      # Request handlers / business logic
├── routes/           # Route definitions, one file per resource
├── middlewares/      # verifyJWT auth guard, Multer upload config
└── utils/            # ApiError, ApiResponse, asyncHandler, Cloudinary helper
```

The code follows a Model–Controller–Router layout: routes only map URLs to controllers, controllers hold the logic, and models define the data. Every controller is wrapped in `asyncHandler`, and responses use consistent `ApiResponse` / `ApiError` shapes.

## Getting started

**Prerequisites:** Node.js 20+, a MongoDB database (local or Atlas), a Cloudinary account.

```bash
git clone https://github.com/xxdiii/vidTube.git
cd vidTube
npm install
cp .env.sample .env      # then fill in your own values
npm run dev              # starts with nodemon
```

The server runs on `PORT` (defaults to 8001 if unset). Check it with `GET /api/v1/healthcheck`.

### Environment variables

| Variable | Purpose |
| --- | --- |
| `PORT` | Port the server listens on |
| `CORS_ORIGIN` | Frontend origin allowed to call the API |
| `MONGODB_URI` | MongoDB connection string (without database name) |
| `ACCESS_TOKEN_SECRET`, `ACCESS_TOKEN_EXPIRY` | Signing secret and lifetime for access tokens |
| `REFRESH_TOKEN_SECRET`, `REFRESH_TOKEN_EXPIRY` | Signing secret and lifetime for refresh tokens |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Cloudinary credentials for media uploads |
| `NODE_ENV` | `development` or `production` |

## API overview

All routes are prefixed with `/api/v1`. Everything except register, login, refresh-token and healthcheck requires a valid access token (cookie or `Authorization: Bearer <token>` header).

| Resource | Endpoints |
| --- | --- |
| **Users** `/users` | `POST /register` (multipart: avatar, coverImage) · `POST /login` · `POST /refresh-token` · `GET /logout` · `POST /change-password` · `GET /current-user` · `GET /c/:username` (channel profile) · `PATCH /update-account` · `PATCH /update-avatar` · `PATCH /update-coverImage` |
| **Videos** `/videos` | `GET /` (paginated, search & sort) · `POST /` (multipart: videoFile, thumbnail) · `GET /v/:videoId` · `PATCH /v/:videoId` · `DELETE /v/:videoId` · `PATCH /toggle/publish/v/:videoId` |
| **Comments** `/comments` | `GET /:videoId` · `POST /:videoId` · `PATCH /c/:commentId` · `DELETE /c/:commentId` |
| **Likes** `/likes` | `POST /toggle/v/:videoId` · `POST /toggle/c/:commentId` · `POST /toggle/t/:tweetId` · `GET /videos` (liked videos) |
| **Subscriptions** `/subscriptions` | `POST /c/:channelId` (toggle) · `GET /c/:channelId` (subscribers) · `GET /u/:subscriberId` (subscribed channels) |
| **Playlists** `/playlists` | `POST /` · `GET /user/:userId` · `GET /:playlistId` · `PATCH /:playlistId` · `DELETE /:playlistId` · `PATCH /add/:videoId/:playlistId` · `PATCH /remove/:videoId/:playlistId` |
| **Tweets** `/tweets` | `POST /` · `GET /user/:userId` · `PATCH /:tweetId` · `DELETE /:tweetId` |
| **Dashboard** `/dashboard` | `GET /stats` (views, subscribers, likes, video count) · `GET /videos` (channel's videos) |
| **Healthcheck** `/healthcheck` | `GET /` |

## Testing

The endpoints were tested with Postman, using environment variables and Bearer tokens to run through full user flows (register → login → upload → interact → logout).

## Author

Aadithya Suresh · [GitHub](https://github.com/xxdiii) · [LinkedIn](https://www.linkedin.com/in/itzaadithyasuresh/)
