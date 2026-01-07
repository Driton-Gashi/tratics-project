#!/bin/bash

# Script to set environment variables in Vercel
# Usage: ./scripts/set-vercel-env.sh

set -e

echo "🚀 Setting up Vercel environment variables..."
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed."
    echo "Install it with: npm i -g vercel"
    exit 1
fi

# Check if user is logged in
if ! vercel whoami &> /dev/null; then
    echo "❌ Not logged in to Vercel."
    echo "Login with: vercel login"
    exit 1
fi

echo "📝 Please provide the following information:"
echo ""

# Database configuration
read -p "DB_HOST (e.g., mysql.hostinger.com): " DB_HOST
read -p "DB_PORT [3306]: " DB_PORT
DB_PORT=${DB_PORT:-3306}
read -p "DB_USER: " DB_USER
read -sp "DB_PASSWORD: " DB_PASSWORD
echo ""
read -p "DB_NAME: " DB_NAME

# Generate JWT_SECRET if not provided
echo ""
read -p "JWT_SECRET (press Enter to generate a secure one): " JWT_SECRET
if [ -z "$JWT_SECRET" ]; then
    JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    echo "✅ Generated JWT_SECRET: $JWT_SECRET"
    echo "⚠️  IMPORTANT: Save this JWT_SECRET securely!"
fi

# Get Vercel domain
echo ""
read -p "Vercel domain (e.g., your-app.vercel.app): " VERCEL_DOMAIN
if [ -z "$VERCEL_DOMAIN" ]; then
    echo "⚠️  You can set this later. Using placeholder for now."
    VERCEL_DOMAIN="your-app.vercel.app"
fi

CLIENT_URL="https://${VERCEL_DOMAIN}"
NEXT_PUBLIC_API_URL="https://${VERCEL_DOMAIN}/api"

echo ""
echo "📋 Summary:"
echo "  DB_HOST: $DB_HOST"
echo "  DB_PORT: $DB_PORT"
echo "  DB_USER: $DB_USER"
echo "  DB_NAME: $DB_NAME"
echo "  JWT_SECRET: ${JWT_SECRET:0:20}... (hidden)"
echo "  CLIENT_URL: $CLIENT_URL"
echo "  NEXT_PUBLIC_API_URL: $NEXT_PUBLIC_API_URL"
echo ""

read -p "Continue with setting these variables? (y/n): " CONFIRM
if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    echo "❌ Cancelled."
    exit 1
fi

echo ""
echo "🔧 Setting environment variables..."

# Set production environment variables
vercel env add DB_HOST production <<< "$DB_HOST"
vercel env add DB_PORT production <<< "$DB_PORT"
vercel env add DB_USER production <<< "$DB_USER"
vercel env add DB_PASSWORD production <<< "$DB_PASSWORD"
vercel env add DB_NAME production <<< "$DB_NAME"
vercel env add JWT_SECRET production <<< "$JWT_SECRET"
vercel env add COOKIE_SECURE production <<< "true"
vercel env add CLIENT_URL production <<< "$CLIENT_URL"
vercel env add NODE_ENV production <<< "production"
vercel env add PORT production <<< "4000"

# Set client environment variable
vercel env add NEXT_PUBLIC_API_URL production <<< "$NEXT_PUBLIC_API_URL"

echo ""
echo "✅ Environment variables set for production!"
echo ""
echo "💡 Tip: You can also set these for preview and development environments:"
echo "   vercel env add <VAR_NAME> preview"
echo "   vercel env add <VAR_NAME> development"
echo ""
echo "🔐 Your JWT_SECRET (save this securely!):"
echo "$JWT_SECRET"
