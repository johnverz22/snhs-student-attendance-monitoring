#!/bin/bash

# Fix macOS Firewall for Node.js LAN Access
# This script adds Node.js to the firewall allowlist

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         macOS Firewall Configuration for Node.js              ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Find Node.js path
NODE_PATH=$(which node)
echo "📍 Node.js location: $NODE_PATH"
echo ""

# Check if firewall is enabled
FIREWALL_STATE=$(/usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate)
echo "🔥 Firewall status: $FIREWALL_STATE"
echo ""

if [[ $FIREWALL_STATE == *"enabled"* ]]; then
    echo "⚠️  Firewall is enabled. Adding Node.js to allowlist..."
    echo ""
    echo "This requires administrator privileges."
    echo ""
    
    # Add Node.js to firewall
    sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add "$NODE_PATH"
    sudo /usr/libexec/ApplicationFirewall/socketfilterfw --unblockapp "$NODE_PATH"
    
    echo ""
    echo "✅ Node.js has been added to the firewall allowlist!"
    echo ""
    echo "📱 You should now be able to access the server from other devices"
    echo "   on your network using: http://192.168.100.83:3000"
    echo ""
else
    echo "✅ Firewall is disabled. No action needed."
    echo ""
fi

echo "════════════════════════════════════════════════════════════════"
echo ""
echo "💡 To test LAN access, try:"
echo "   curl http://192.168.100.83:3000/health"
echo ""
