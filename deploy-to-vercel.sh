#!/bin/bash

# Vercel Deployment Script for School Attendance System
# This script helps you deploy your app to Vercel with proper configuration

echo "================================================"
echo "  School Attendance System - Vercel Deployment"
echo "================================================"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed."
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install Vercel CLI. Please install manually:"
        echo "   npm install -g vercel"
        exit 1
    fi
fi

echo "✅ Vercel CLI is installed"
echo ""

# Check if user is logged in
echo "🔐 Checking Vercel authentication..."
vercel whoami &> /dev/null
if [ $? -ne 0 ]; then
    echo "📝 Please login to Vercel:"
    vercel login
    if [ $? -ne 0 ]; then
        echo "❌ Login failed. Please try again."
        exit 1
    fi
fi

echo "✅ Authenticated with Vercel"
echo ""

# Check if firebase-service-account.json exists
if [ ! -f "firebase-service-account.json" ]; then
    echo "⚠️  Warning: firebase-service-account.json not found"
    echo "   You'll need to set FIREBASE_SERVICE_ACCOUNT environment variable manually"
    echo ""
fi

# Ask user if they want to set environment variables
echo "📋 Environment Variables Setup"
echo "================================"
echo ""
echo "Do you want to set environment variables now? (y/n)"
read -r setup_env

if [ "$setup_env" = "y" ] || [ "$setup_env" = "Y" ]; then
    echo ""
    echo "Setting up environment variables..."
    echo ""
    
    # JWT Secret
    echo "Enter JWT_SECRET (press Enter to skip):"
    read -r jwt_secret
    if [ ! -z "$jwt_secret" ]; then
        echo "$jwt_secret" | vercel env add JWT_SECRET production
    fi
    
    # School Name
    echo "Enter SCHOOL_NAME (press Enter to skip):"
    read -r school_name
    if [ ! -z "$school_name" ]; then
        echo "$school_name" | vercel env add SCHOOL_NAME production
    fi
    
    # School Latitude
    echo "Enter SCHOOL_LATITUDE (press Enter to skip):"
    read -r school_lat
    if [ ! -z "$school_lat" ]; then
        echo "$school_lat" | vercel env add SCHOOL_LATITUDE production
    fi
    
    # School Longitude
    echo "Enter SCHOOL_LONGITUDE (press Enter to skip):"
    read -r school_lng
    if [ ! -z "$school_lng" ]; then
        echo "$school_lng" | vercel env add SCHOOL_LONGITUDE production
    fi
    
    # School Radius
    echo "Enter SCHOOL_RADIUS_METERS (press Enter to skip):"
    read -r school_radius
    if [ ! -z "$school_radius" ]; then
        echo "$school_radius" | vercel env add SCHOOL_RADIUS_METERS production
    fi
    
    # Firebase Service Account
    if [ -f "firebase-service-account.json" ]; then
        echo ""
        echo "Do you want to upload Firebase service account? (y/n)"
        read -r upload_firebase
        if [ "$upload_firebase" = "y" ] || [ "$upload_firebase" = "Y" ]; then
            cat firebase-service-account.json | vercel env add FIREBASE_SERVICE_ACCOUNT production
            echo "✅ Firebase credentials uploaded"
        fi
    fi
    
    echo ""
    echo "✅ Environment variables configured"
fi

echo ""
echo "🚀 Deploying to Vercel..."
echo ""

# Deploy to Vercel
vercel --prod

if [ $? -eq 0 ]; then
    echo ""
    echo "================================================"
    echo "  ✅ Deployment Successful!"
    echo "================================================"
    echo ""
    echo "📝 Next Steps:"
    echo "1. Copy your deployment URL from above"
    echo "2. Update parent_app/lib/config/api_config.dart with the new URL"
    echo "3. Test your API endpoints"
    echo "4. Update student_app/lib/config/api_config.dart as well"
    echo ""
    echo "📊 View logs: vercel logs --follow"
    echo "🌐 Dashboard: https://vercel.com/dashboard"
    echo ""
else
    echo ""
    echo "❌ Deployment failed. Please check the errors above."
    echo ""
    echo "Common issues:"
    echo "- Missing environment variables"
    echo "- Invalid vercel.json configuration"
    echo "- Build errors"
    echo ""
    echo "For help, check: VERCEL_DEPLOYMENT_GUIDE.md"
    exit 1
fi
