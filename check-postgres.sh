#!/bin/bash

# PostgreSQL Status Check Script
# Quick way to check if PostgreSQL is running and healthy

echo "🔍 Checking PostgreSQL Status..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running"
    echo "   Please start Docker Desktop"
    exit 1
fi

# Check if container exists
if ! docker ps -a | grep -q school_attendance_db; then
    echo "❌ PostgreSQL container not found"
    echo "   Run: docker-compose up -d postgres"
    exit 1
fi

# Check if container is running
if ! docker ps | grep -q school_attendance_db; then
    echo "⚠️  PostgreSQL container exists but is not running"
    echo "   Run: docker-compose start postgres"
    exit 1
fi

echo "✅ PostgreSQL container is running"

# Check if PostgreSQL is ready
if docker exec school_attendance_db pg_isready -U school_admin -d school_attendance > /dev/null 2>&1; then
    echo "✅ PostgreSQL is accepting connections"
else
    echo "⚠️  PostgreSQL is starting up, please wait..."
    exit 1
fi

# Get container stats
echo ""
echo "📊 Container Info:"
docker ps --filter name=school_attendance_db --format "   Status: {{.Status}}"
docker ps --filter name=school_attendance_db --format "   Ports: {{.Ports}}"

# Get database info
echo ""
echo "🐘 Database Info:"
docker exec school_attendance_db psql -U school_admin -d school_attendance -t -c "SELECT version();" | head -1 | xargs echo "   Version:"
docker exec school_attendance_db psql -U school_admin -d school_attendance -t -c "SELECT pg_size_pretty(pg_database_size('school_attendance'));" | xargs echo "   Size:"

# Count tables
TABLE_COUNT=$(docker exec school_attendance_db psql -U school_admin -d school_attendance -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | xargs)
echo "   Tables: $TABLE_COUNT"

# Count records
echo ""
echo "📈 Record Counts:"
docker exec school_attendance_db psql -U school_admin -d school_attendance -t -c "SELECT COUNT(*) FROM students;" | xargs echo "   Students:"
docker exec school_attendance_db psql -U school_admin -d school_attendance -t -c "SELECT COUNT(*) FROM parents;" | xargs echo "   Parents:"
docker exec school_attendance_db psql -U school_admin -d school_attendance -t -c "SELECT COUNT(*) FROM attendance_logs;" | xargs echo "   Attendance Logs:"
docker exec school_attendance_db psql -U school_admin -d school_attendance -t -c "SELECT COUNT(*) FROM qr_codes;" | xargs echo "   QR Codes:"

echo ""
echo "✅ PostgreSQL is healthy and ready!"
echo ""
echo "💡 Useful commands:"
echo "   npm start                    - Start the application"
echo "   npm run db:test              - Test database connection"
echo "   npm run db:migrate:sqlite    - Migrate from SQLite"
echo "   docker-compose logs postgres - View logs"
echo "   docker exec -it school_attendance_db psql -U school_admin school_attendance - Connect to database"
