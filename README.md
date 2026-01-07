# Tratics

Full-stack movie tracking application with Next.js frontend and Express.js backend.

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Express.js, TypeScript, MySQL
- **Authentication**: JWT with httpOnly cookies, bcrypt password hashing
- **Database**: MySQL (Hostinger)

## Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- MySQL database

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cd server
cp .env.example .env
# Edit .env with your database credentials

cd ../client
cp .env.example .env.local
# Edit .env.local with your API URL
```

### Development

```bash
# Start both client and server
npm run dev

# Or run separately:
npm run dev:client  # Client on http://localhost:3000
npm run dev:server  # Server on http://localhost:4000
```

## Project Structure

```
tratics/
├── client/          # Next.js frontend
│   ├── app/         # Pages and routes
│   └── src/         # Utilities and types
├── server/          # Express.js backend
│   └── src/
│       ├── auth/    # Authentication system
│       ├── config/  # Configuration
│       ├── db/      # Database connection
│       └── routes/  # API routes
└── api/             # Vercel serverless function
```

## API Documentation

Visit `/docs` for complete API documentation:

- **Main Docs**: `http://localhost:4000/docs`
- **Auth API**: `http://localhost:4000/docs/auth`
- **Health Check**: `http://localhost:4000/docs/health`

## Environment Variables

### Server (`server/.env`)

```env
DB_HOST=your-db-host
DB_PORT=3306
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=your-db-name
JWT_SECRET=your-jwt-secret
CLIENT_URL=http://localhost:3000
NODE_ENV=development
PORT=4000
```

### Client (`client/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## Available Scripts

- `npm run dev` - Start both client and server
- `npm run build` - Build for production
- `npm run lint` - Lint all code
- `npm run format` - Format code with Prettier

## Database Setup

1. Create database tables by running `server/db.sql` in your MySQL database
2. Configure database credentials in `server/.env`
3. Test connection: `node server/scripts/test-db-connection.js` (if script exists)

## Deployment

The project is configured for Vercel deployment. See `vercel.json` for configuration.

## License

ISC
