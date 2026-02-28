#!/bin/sh
set -e

echo "Resolving failed migrations..."
npx prisma migrate resolve --rolled-back 20260228_init || echo "No failed migration to resolve"

echo "Running migrations..."
npx prisma migrate deploy

echo "Starting server..."
npm start
