# Wireshark - Analyzing HTTP vs HTTPS Traffic

## Overview

Wireshark is a network protocol analyzer. In this lab, we use it to capture and analyze HTTP and HTTPS traffic to understand the differences and security implications.

## Setup

### 1. Install Wireshark

- **Linux**: `sudo apt-get install wireshark` (or your package manager)
- **Windows/Mac**: Download from https://www.wireshark.org/download.html

⚠️ **Note**: On Linux, you may need to add your user to the `wireshark` group:
```bash
sudo usermod -aG wireshark $USER
# Log out and back in for changes to take effect
```

### 2. Capture Interface Selection

1. Launch Wireshark
2. Select the interface to capture on:
   - **Linux**: Usually `eth0`, `wlan0`, or `lo` (loopback for localhost)
   - **Windows**: Usually `Ethernet` or `Wi-Fi`
   - **For localhost**: Use `Loopback` or `lo` interface

## Capturing Localhost Traffic

### Option 1: Loopback Interface

1. Select the loopback interface (`lo` on Linux, `Loopback` on Windows)
2. Click the blue shark fin icon to start capturing
3. Filter: `tcp.port == 3000 || tcp.port == 3001`

### Option 2: Use RawCap (Windows)

If loopback capture doesn't work on Windows:

1. Download RawCap: https://www.netresec.com/?page=RawCap
2. Run: `RawCap.exe 127.0.0.1 output.pcap`
3. Open `output.pcap` in Wireshark

## Analyzing HTTP Traffic

### Starting the Capture

1. Start Wireshark capture on loopback interface
2. Apply filter: `http && tcp.port == 3001` (backend traffic)
3. Start the backend server
4. Make requests from the frontend

### What to Look For

#### Request Headers
- `Host`: Target hostname
- `User-Agent`: Browser/client information
- `Cookie`: Session cookies (visible in plain text!)
- `Content-Type`: Request body format
- `Origin`: Where the request came from

#### Response Headers
- `Set-Cookie`: Session cookie being set
- `Content-Type`: Response format
- Security headers (if configured)

#### Request/Response Bodies
- Login credentials (if sent over HTTP - **INSECURE!**)
- CSRF tokens
- API payloads

### Example: CSRF Lab Traffic

When testing the CSRF lab, you'll see:

1. **Login Request**:
   ```
   POST /api/login HTTP/1.1
   Host: localhost:3001
   Content-Type: application/json
   
   {"username":"testuser"}
   ```

2. **Login Response**:
   ```
   HTTP/1.1 200 OK
   Set-Cookie: sessionId=session-1234567890-abc123; HttpOnly; SameSite=Lax
   Content-Type: application/json
   
   {"success":true,"csrfToken":"abc123..."}
   ```

3. **Protected Request**:
   ```
   POST /api/change-email HTTP/1.1
   Host: localhost:3001
   Cookie: sessionId=session-1234567890-abc123
   Content-Type: application/json
   
   {"email":"new@email.com","csrfToken":"abc123..."}
   ```

## Analyzing HTTPS Traffic

### The Challenge

HTTPS traffic is **encrypted**, so you can't see the actual data in Wireshark by default.

### What You CAN See

- **TLS Handshake**: The encryption negotiation
- **Encrypted Data**: Encrypted packets (not readable)
- **Metadata**: Source/destination, packet sizes, timing

### Decrypting HTTPS (Advanced)

To decrypt HTTPS traffic, you need the server's private key:

1. Configure Wireshark: **Edit** → **Preferences** → **Protocols** → **TLS**
2. Add RSA key: Point to server's private key file
3. Re-capture traffic

⚠️ **Note**: This only works for traffic you control. You cannot decrypt other people's HTTPS traffic.

## Key Differences: HTTP vs HTTPS

### HTTP (Insecure)
- ✅ **Visible**: All headers, cookies, and data in plain text
- ❌ **Vulnerable**: Anyone on the network can read/modify traffic
- ❌ **No authentication**: Can't verify server identity
- ❌ **No integrity**: Data can be modified in transit

### HTTPS (Secure)
- ✅ **Encrypted**: Data is encrypted, not readable
- ✅ **Authenticated**: Server identity is verified via certificates
- ✅ **Integrity**: Data cannot be modified without detection
- ❌ **Less visible**: Harder to debug (but more secure!)

## Security Implications

### What HTTP Reveals

1. **Session Cookies**: Visible in plain text
   - Attackers can steal cookies via network interception
   - Man-in-the-Middle (MitM) attacks are possible

2. **Credentials**: Login data in plain text
   - Passwords, tokens, API keys all visible
   - Never use HTTP for authentication!

3. **CSRF Tokens**: Visible but that's okay
   - Tokens are meant to be in requests
   - HTTPS prevents token theft via interception

### Why HTTPS Matters

- **Encryption**: Protects data in transit
- **Authentication**: Verifies you're talking to the real server
- **Integrity**: Prevents tampering

## Practical Exercises

### Exercise 1: Capture Login Flow

1. Start Wireshark capture
2. Filter: `http && tcp.port == 3001`
3. Log in through the CSRF lab
4. Find the login request/response
5. Observe the session cookie being set

### Exercise 2: Compare HTTP vs HTTPS

1. Set up HTTPS on the backend (beyond this lab's scope)
2. Capture both HTTP and HTTPS traffic
3. Compare what's visible in each

### Exercise 3: Analyze CSRF Protection

1. Capture traffic during CSRF lab testing
2. Compare requests with and without CSRF tokens
3. Observe how tokens are transmitted

## Useful Wireshark Filters

```bash
# HTTP traffic only
http

# Traffic to/from specific port
tcp.port == 3001

# HTTP requests
http.request

# HTTP responses
http.response

# Specific HTTP method
http.request.method == "POST"

# Traffic containing cookies
http.cookie

# Follow TCP stream (see full conversation)
# Right-click packet → Follow → TCP Stream
```

## What You're Learning

- **Network protocols**: Understanding HTTP/HTTPS at the packet level
- **Security implications**: Why encryption matters
- **Traffic analysis**: How to inspect network communication
- **Vulnerability awareness**: What HTTP exposes

## Important Notes

⚠️ **Only capture traffic you own or have permission to analyze!**

- Capturing other people's traffic without permission is illegal
- This lab is for educational purposes only
- Always get explicit permission before capturing network traffic

## Troubleshooting

**No traffic appearing?**
- Check interface selection
- Verify services are running
- Ensure filter is correct
- Try capturing on all interfaces

**Can't see localhost traffic?**
- Use loopback interface
- On Windows, try RawCap
- Check firewall settings

**Too much traffic?**
- Use filters to narrow down
- Focus on specific ports
- Use display filters after capture

