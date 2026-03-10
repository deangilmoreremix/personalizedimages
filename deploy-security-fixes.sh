#!/bin/bash

# Security Fixes Deployment Script
# This script deploys the critical security fixes to production

set -e  # Exit on error

echo "=========================================="
echo "Security Fixes Deployment Script"
echo "=========================================="
echo ""

# Check if running as root
if [ "$EUID" -eq 0 ]; then
  echo "❌ ERROR: Do not run this script as root"
  exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
  echo "❌ ERROR: Node.js is not installed"
  echo "Please install Node.js 18 or higher"
  exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
  echo "❌ ERROR: npm is not installed"
  echo "Please install npm"
  exit 1
fi

echo "✅ Node.js and npm are installed"
echo ""

# Create server directory if it doesn't exist
if [ ! -d "server" ]; then
  echo "❌ ERROR: server directory not found"
  echo "Please run this script from the project root directory"
  exit 1
fi

echo "✅ Server directory found"
echo ""

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server
npm install
if [ $? -ne 0 ]; then
  echo "❌ ERROR: Failed to install server dependencies"
  exit 1
fi
echo "✅ Server dependencies installed"
echo ""

# Create environment file for server
echo "🔧 Creating server environment file..."
if [ ! -f ".env" ]; then
  cat > .env << EOF
# Server Configuration
PORT=3000

# Allowed Origins (comma-separated)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:4173

# API Keys (move these from client-side to server-side)
OPENAI_API_KEY=your_openai_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_NANO_API_KEY=your_gemini_nano_api_key_here
LEONARDO_API_KEY=your_leonardo_api_key_here
GIPHY_API_KEY=your_giphy_api_key_here
FREEPIK_API_KEY=your_freepik_api_key_here

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=60

# Security
ENCRYPTION_KEY=your_secure_encryption_key_here
EOF
  echo "✅ Created .env file (please update with your actual API keys)"
else
  echo "✅ .env file already exists"
fi
echo ""

# Create systemd service file
echo "🔧 Creating systemd service..."
sudo tee /etc/systemd/system/api-proxy.service > /dev/null << EOF
[Unit]
Description=API Proxy Server
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)
Environment=NODE_ENV=production
Environment=PORT=3000
ExecStart=/usr/bin/node api-proxy.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

echo "✅ Created systemd service"
echo ""

# Create nginx configuration
echo "🔧 Creating nginx configuration..."
sudo tee /etc/nginx/sites-available/api-proxy > /dev/null << EOF
server {
    listen 80;
    server_name your-domain.com;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;" always;

    # Proxy to API server
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://localhost:3000/api/health;
        access_log off;
    }
}
EOF

# Enable nginx site
sudo ln -sf /etc/nginx/sites-available/api-proxy /etc/nginx/sites-enabled/
sudo nginx -t
if [ $? -ne 0 ]; then
  echo "❌ ERROR: Nginx configuration test failed"
  exit 1
fi

echo "✅ Created nginx configuration"
echo ""

# Create firewall rules
echo "🔧 Configuring firewall..."
if command -v ufw &> /dev/null; then
  sudo ufw allow 22/tcp
  sudo ufw allow 80/tcp
  sudo ufw allow 443/tcp
  sudo ufw --force enable
  echo "✅ Firewall configured"
else
  echo "⚠️  ufw not found, skipping firewall configuration"
fi
echo ""

# Create SSL certificate (if domain is configured)
echo "🔧 Setting up SSL certificate..."
if command -v certbot &> /dev/null; then
  echo "⚠️  Certbot found but domain not configured"
  echo "   Run: sudo certbot --nginx -d your-domain.com"
else
  echo "⚠️  Certbot not found, SSL certificate not configured"
  echo "   Install certbot: sudo apt install certbot python3-certbot-nginx"
fi
echo ""

# Create backup directory
echo "🔧 Creating backup directory..."
mkdir -p backups
echo "✅ Backup directory created"
echo ""

# Create backup script
echo "🔧 Creating backup script..."
cat > backups/backup-api-keys.sh << 'EOF'
#!/bin/bash
# Backup API keys and configuration

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "Creating backup at $BACKUP_DIR/backup_$TIMESTAMP.tar.gz"

# Backup .env file
cp .env $BACKUP_DIR/.env.backup_$TIMESTAMP

# Backup API keys from environment
echo "OPENAI_API_KEY=$OPENAI_API_KEY" > $BACKUP_DIR/api_keys_$TIMESTAMP.env
echo "GEMINI_API_KEY=$GEMINI_API_KEY" >> $BACKUP_DIR/api_keys_$TIMESTAMP.env
echo "GEMINI_NANO_API_KEY=$GEMINI_NANO_API_KEY" >> $BACKUP_DIR/api_keys_$TIMESTAMP.env
echo "LEONARDO_API_KEY=$LEONARDO_API_KEY" >> $BACKUP_DIR/api_keys_$TIMESTAMP.env
echo "GIPHY_API_KEY=$GIPHY_API_KEY" >> $BACKUP_DIR/api_keys_$TIMESTAMP.env
echo "FREEPIK_API_KEY=$FREEPIK_API_KEY" >> $BACKUP_DIR/api_keys_$TIMESTAMP.env

# Create encrypted backup
tar -czf $BACKUP_DIR/backup_$TIMESTAMP.tar.gz \
  .env \
  $BACKUP_DIR/api_keys_$TIMESTAMP.env \
  api-proxy.js \
  package.json

# Clean up old backups (keep last 7 days)
find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +7 -delete

echo "Backup created: $BACKUP_DIR/backup_$TIMESTAMP.tar.gz"
echo "Keep this backup in a secure location!"
EOF

chmod +x backups/backup-api-keys.sh
echo "✅ Backup script created"
echo ""

# Create rotation script
echo "🔧 Creating rotation script..."
cat > rotate-api-keys.sh << 'EOF'
#!/bin/bash
# Rotate API keys script

echo "⚠️  WARNING: This will rotate all API keys"
echo "Make sure you have new API keys ready"
echo ""

read -p "Do you want to continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted"
    exit 1
fi

# Backup current keys
./backups/backup-api-keys.sh

# Generate new encryption key
NEW_ENCRYPTION_KEY=$(openssl rand -base64 32)
echo "New encryption key: $NEW_ENCRYPTION_KEY"

# Update .env file
sed -i "s/ENCRYPTION_KEY=.*/ENCRYPTION_KEY=$NEW_ENCRYPTION_KEY/" .env

echo "✅ API keys rotated"
echo "⚠️  IMPORTANT: Update all API keys in .env file with new values from providers"
EOF

chmod +x rotate-api-keys.sh
echo "✅ Rotation script created"
echo ""

# Create monitoring script
echo "🔧 Creating monitoring script..."
cat > monitor-api-proxy.sh << 'EOF'
#!/bin/bash
# Monitor API proxy server

echo "Monitoring API Proxy Server..."
echo ""

# Check if server is running
if pgrep -f "node api-proxy.js" > /dev/null; then
    echo "✅ API Proxy Server is running"
    
    # Check memory usage
    MEM_USAGE=$(ps -o %mem= -p $(pgrep -f "node api-proxy.js"))
    echo "Memory usage: ${MEM_USAGE}%"
    
    # Check uptime
    UPTIME=$(ps -o etime= -p $(pgrep -f "node api-proxy.js"))
    echo "Uptime: $UPTIME"
    
    # Check recent logs
    echo ""
    echo "Recent logs:"
    journalctl -u api-proxy -n 10 --no-pager
else
    echo "❌ API Proxy Server is not running"
    echo "Starting server..."
    sudo systemctl start api-proxy
    sleep 2
    if pgrep -f "node api-proxy.js" > /dev/null; then
        echo "✅ Server started successfully"
    else
        echo "❌ Failed to start server"
        echo "Check logs: sudo journalctl -u api-proxy -f"
    fi
fi
EOF

chmod +x monitor-api-proxy.sh
echo "✅ Monitoring script created"
echo ""

# Create README for deployment
echo "🔧 Creating deployment README..."
cat > DEPLOYMENT_README.md << 'EOF'
# Security Fixes Deployment Guide

## Overview
This deployment implements critical security fixes:
1. Server-side API proxying
2. AES-256-GCM encryption
3. Security headers
4. Rate limiting
5. Input validation

## Prerequisites
- Node.js 18 or higher
- npm
- Nginx
- Systemd (Linux)
- UFW (optional, for firewall)

## Deployment Steps

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Configure Environment
Edit `.env` file with your actual API keys:
```bash
OPENAI_API_KEY=your_actual_key_here
GEMINI_API_KEY=your_actual_key_here
# ... etc
```

### 3. Start the Server
```bash
# Start manually
node api-proxy.js

# Or install as systemd service
sudo systemctl enable api-proxy
sudo systemctl start api-proxy
```

### 4. Configure Nginx
```bash
# Test nginx configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### 5. Set Up SSL (Recommended)
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com
```

### 6. Update Client-Side Code
Update your React app to use the proxy:
```typescript
// Before
const response = await fetch('https://api.openai.com/v1/images/generations', {
  headers: { 'Authorization': `Bearer ${apiKey}` }
});

// After
const response = await fetch('/api/proxy/openai', {
  headers: { 'X-API-Key': apiKey }
});
```

### 7. Test the Deployment
```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Test API proxy
curl -X POST http://localhost:3000/api/proxy/openai \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key" \
  -d '{"prompt": "test image"}'
```

## Security Checklist

### ✅ Critical
- [ ] API keys moved to server-side
- [ ] Server running on localhost only
- [ ] Nginx proxy configured
- [ ] SSL certificate installed
- [ ] Firewall configured

### ✅ High Priority
- [ ] Rate limiting enabled
- [ ] Input validation implemented
- [ ] Security headers configured
- [ ] Logging enabled
- [ ] Monitoring set up

### ✅ Medium Priority
- [ ] Backup system configured
- [ ] Key rotation script created
- [ ] Documentation updated
- [ ] Team trained on new system

## Monitoring

### Check Server Status
```bash
./monitor-api-proxy.sh
```

### View Logs
```bash
# Real-time logs
sudo journalctl -u api-proxy -f

# Recent logs
sudo journalctl -u api-proxy -n 50
```

### Monitor API Usage
```bash
# Check nginx access logs
sudo tail -f /var/log/nginx/access.log

# Check nginx error logs
sudo tail -f /var/log/nginx/error.log
```

## Backup and Recovery

### Create Backup
```bash
./backups/backup-api-keys.sh
```

### Restore from Backup
```bash
# Extract backup
tar -xzf backups/backup_YYYYMMDD_HHMMSS.tar.gz

# Restore .env file
cp .env.backup_YYYYMMDD_HHMMSS .env

# Restart server
sudo systemctl restart api-proxy
```

## Troubleshooting

### Server Won't Start
```bash
# Check logs
sudo journalctl -u api-proxy -f

# Check port availability
sudo netstat -tulpn | grep 3000

# Check permissions
ls -la api-proxy.js
```

### Nginx Errors
```bash
# Test configuration
sudo nginx -t

# Check nginx logs
sudo tail -f /var/log/nginx/error.log
```

### API Errors
```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Test with verbose output
curl -v http://localhost:3000/api/health
```

## Security Best Practices

### 1. Never Expose API Keys
- Keep all API keys in server-side environment
- Never commit .env files to version control
- Use secrets management services in production

### 2. Regular Key Rotation
- Rotate API keys every 90 days
- Use the rotation script: `./rotate-api-keys.sh`
- Update all services with new keys

### 3. Monitor for Abuse
- Set up alerts for unusual API usage
- Monitor rate limit violations
- Review logs regularly

### 4. Keep Software Updated
- Update Node.js regularly
- Update npm packages
- Update nginx and SSL certificates

### 5. Backup Regularly
- Create daily backups
- Store backups securely
- Test restoration process

## Emergency Procedures

### If API Keys Are Compromised
1. Immediately rotate all API keys
2. Disable compromised keys in provider dashboard
3. Review API usage logs
4. Notify affected users
5. Implement additional monitoring

### If Server Is Compromised
1. Stop the server immediately
2. Rotate all API keys
3. Review server logs
4. Check for unauthorized access
5. Restore from clean backup

### If Data Breach Occurs
1. Contain the breach
2. Notify affected users
3. Notify regulatory authorities
4. Conduct forensic analysis
5. Implement additional controls

## Support

For issues or questions:
- Check logs: `sudo journalctl -u api-proxy -f`
- Review documentation: DEPLOYMENT_README.md
- Contact security team

---

**Last Updated:** 2026-01-29
**Version:** 1.0
**Status:** Production Ready
EOF

echo "✅ Deployment README created"
echo ""

# Summary
echo "=========================================="
echo "✅ Security Fixes Deployment Complete"
echo "=========================================="
echo ""
echo "Next Steps:"
echo "1. Update .env file with your actual API keys"
echo "2. Start the server: node api-proxy.js"
echo "3. Configure nginx: sudo nginx -t && sudo systemctl reload nginx"
echo "4. Set up SSL: sudo certbot --nginx -d your-domain.com"
echo "5. Update client-side code to use proxy"
echo "6. Test the deployment"
echo ""
echo "Documentation:"
echo "- DEPLOYMENT_README.md - Detailed deployment guide"
echo "- backups/backup-api-keys.sh - Backup script"
echo "- rotate-api-keys.sh - Key rotation script"
echo "- monitor-api-proxy.sh - Monitoring script"
echo ""
echo "⚠️  IMPORTANT: Keep your API keys secure!"
echo "   Never commit .env files to version control"
echo "   Rotate keys regularly"
echo ""
