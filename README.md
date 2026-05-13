# HAR Analyzer Backend
Backend API for the HAR Analyzer platform.

This service processes HAR (HTTP Archive) files and generates structured request-level diffs including headers, cookies, payloads, responses, and timing analysis.

The backend is designed around scalable diff processing pipelines and normalized API contracts to support future AI-powered analysis capabilities.

# 🚀 Live API
Backend Deployment: https://har-analyzer-backend-hkyx.onrender.com

Backend Repo: https://github.com/adampaez88/HAR-analyzer-backend

Health Endpoint:
/health


🏗️ Backend Architecture
The backend owns:
- HAR parsing
- request normalization
- diff generation
- timing analysis
- API response contracts

Architecture ownership:
- Backend owns truth
- Adapter owns normalization
- UI owns presentation
- AI owns interpretation

⚙️ Tech Stack:
- Node.js
- Express
- TypeScript
- Multer
- Helmet
- Compression
- Express Rate Limit
- Render

✨ Features
HAR Processing:
- parses HAR files
- extracts request metadata
- compares request groups
- identifies missing requests
- identifies modified requests

Diff Engine
Supports:
- request headers
- request body
- request cookies
- response headers
- response cookies

Timing Analysis
Tracks:
- wait timing
- receive timing
- total request timing
- timing deltas between HARs

Production Features:
- file upload validation
- request size limiting
- centralized error handling
- CORS protection
- rate limiting
- compression
- security middleware

📂 Project Structure:

    src/
    ├── config/
    ├── controllers/
    ├── routes/
    ├── services/
    ├── types/
    ├── utils/


🧠 Core Backend Design
Diff Engine
Primary processing occurs in: services/harService.ts
The backend produces structured diff output consumed by the frontend adapter layer.

🔧 Environment Variables
Create:
.env

Example:
    PORT=3000
    FRONTEND_URL=http://localhost:5173
    MAX_FILE_SIZE_MB=25
    UPLOAD_DIR=uploads

Production example:
    PORT=10000
    FRONTEND_URL=https://your-vercel-app.vercel.app
    MAX_FILE_SIZE_MB=25
    UPLOAD_DIR=/tmp/uploads

🛠️ Local Development
Install dependencies
    $ npm install

Run development server
    $ npm run dev

Build production bundle
    $ npm run build

Start production server
    $ npm start

🚀 Deployment
Backend is deployed using Render

Production Considerations
The backend includes:
- proxy-aware configuration
- production CORS handling
- rate limiting
- upload protection
- centralized error handling

🔒 Security Features
Middleware:
- Helmet
- CORS
- Compression
- Express Rate Limit

Upload Protection:
- file type validation
- upload size limits
- request limiting

🧪 Health Check
Endpoint:
/health

Example response:
{
  "status": "ok",
  "uptime": 1234
}

🚀 Planned Backend Improvements
Infrastructure:
- Docker support
- CI/CD pipelines
- automated testing
- monitoring/logging

Upload Processing:
- stream-based processing
- zero-disk upload pipeline
- stronger HAR validation

Performance:
- async/background processing
- optimized diff algorithms
- memory optimization

AI Features:
- AI-generated summaries
- anomaly detection
- intelligent root-cause analysis
- API contract drift detection

API Evolution:
- API versioning
- authenticated sessions
- persistent history
- saved comparisons

🛡️ Error Handling Goals
Future improvements:
- granular upload errors
- malformed HAR validation
- timeout handling
- request retry protection
- improved validation contracts


📈 Long-Term Vision
HAR Analyzer is evolving into:
    a production-grade HAR analysis and network diagnostics platform

Long-term goals include:
- AI-powered request analysis
- advanced timing analytics
- collaboration tools
- large-scale HAR visualization
- enterprise debugging workflows

👨‍💻 Author:
Adam Chernitsky

GitHub: https://github.com/adampaez88

Portfolio: https://studio--studio-6412533934-88d88.us-central1.hosted.app/
