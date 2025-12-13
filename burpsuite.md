# Burp Suite - Intercepting SPA Requests

## Overview

Burp Suite is a web application security testing tool. In this lab, we use it to intercept and analyze requests from our React SPA to understand how security mechanisms work.

## Setup

### 1. Install Burp Suite Community Edition

- Download from: https://portswigger.net/burp/communitydownload
- Install and launch Burp Suite

### 2. Configure Browser Proxy

1. Open Burp Suite
2. Go to **Proxy** → **Options**
3. Note the proxy listener (default: `127.0.0.1:8080`)
4. Configure your browser to use this proxy:
   - **Chrome/Edge**: Settings → System → Open proxy settings → Manual proxy → HTTP Proxy: `127.0.0.1:8080`
   - **Firefox**: Settings → Network Settings → Manual proxy → HTTP Proxy: `127.0.0.1:8080`

### 3. Install Burp Certificate (for HTTPS)

1. In Burp Suite: **Proxy** → **Options** → **Import / export CA certificate**
2. Export certificate in DER format
3. Install in your browser's certificate store:
   - **Chrome/Edge**: Settings → Privacy and security → Security → Manage certificates → Import
   - **Firefox**: Settings → Privacy & Security → Certificates → View Certificates → Import

## Using Burp Suite with This Lab

### Intercepting Requests

1. Start the frontend (`npm run dev` in `kali/`)
2. Start the backend (`npm start` in `backend/`)
3. Enable interception in Burp Suite: **Proxy** → **Intercept is on**
4. Navigate to `http://localhost:3000` in your browser
5. Requests will appear in Burp Suite's Intercept tab

### Analyzing Requests

#### XSS Lab Requests
- Observe how user input is sent to the server
- Check if any sanitization happens client-side
- Note: XSS is primarily a client-side vulnerability

#### CSRF Lab Requests
- **Login request**: Observe the session cookie being set
- **CSRF token request**: See how the token is retrieved
- **Protected endpoint**: Notice the CSRF token in the request body
- **Unprotected endpoint**: See how it's missing the token validation

### Key Observations

1. **Session Cookies**
   - Look for `Set-Cookie` headers in responses
   - Check `Cookie` headers in requests
   - Note the `SameSite` attribute

2. **CSRF Tokens**
   - Find where tokens are generated
   - See how tokens are included in requests
   - Compare protected vs unprotected endpoints

3. **Request Headers**
   - Observe `Origin` and `Referer` headers
   - Check `Content-Type` headers
   - Note custom headers if any

## What You're Learning

- **Request/Response Analysis**: Understanding the actual HTTP traffic
- **Security Headers**: Seeing security headers in action
- **Session Management**: How cookies are used for authentication
- **CSRF Protection**: How tokens are transmitted and validated

## Important Notes

⚠️ **Only test on localhost or systems you own!**

- This lab is for educational purposes only
- Never intercept traffic from other users
- Always get explicit permission before testing

## Common Tasks

### View Request History
- **Proxy** → **HTTP history** - See all intercepted requests

### Modify Requests
1. Intercept a request
2. Edit the request in the Intercept tab
3. Click **Forward** to send the modified request

### Replay Requests
1. Right-click a request in HTTP history
2. Select **Send to Repeater**
3. Modify and resend in the Repeater tab

### Analyze Response
- Click on a request in HTTP history
- View the **Response** tab to see server responses
- Check headers, body, and status codes

## Troubleshooting

**Requests not appearing?**
- Check proxy settings in browser
- Ensure Burp Suite proxy is running
- Verify intercept is enabled

**HTTPS errors?**
- Install Burp Suite CA certificate
- Check browser certificate settings

**Connection refused?**
- Ensure backend server is running
- Check CORS settings in backend

