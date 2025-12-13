# nmap - Scanning Localhost Services

## Overview

`nmap` (Network Mapper) is a network scanning tool. In this lab, we use it to scan localhost and discover what services are running on our development machine.

## Why Scan Localhost?

- **Discover running services**: Find what ports are open
- **Security awareness**: Understand what's exposed
- **Learning tool**: Practice network scanning in a safe environment

## Basic Usage

### Scan Localhost

```bash
nmap localhost
```

This will scan common ports on localhost (127.0.0.1).

### Scan Specific Ports

```bash
# Scan ports 3000-3010 (common dev server range)
nmap -p 3000-3010 localhost

# Scan specific ports
nmap -p 3000,3001,8080 localhost
```

### Scan All Ports (Slower)

```bash
nmap -p- localhost
```

⚠️ **Warning**: Scanning all ports can take a long time!

## Scanning This Lab

### Expected Results

When running this security lab, you should see:

```bash
$ nmap -p 3000,3001 localhost

Starting Nmap 7.94 ( https://nmap.org ) at 2024-01-01 12:00 UTC
Nmap scan report for localhost (127.0.0.1)
Host is up (0.0001s latency).

PORT     STATE SERVICE
3000/tcp open  http
3001/tcp open  http

Nmap done: 1 IP address (1 host up) scanned in 0.05 seconds
```

- **Port 3000**: Frontend (Vite dev server)
- **Port 3001**: Backend (Express server)

## Useful nmap Options

### Service Version Detection

```bash
nmap -sV localhost
```

Shows version information for detected services.

### OS Detection

```bash
nmap -O localhost
```

⚠️ Requires root/admin privileges.

### Verbose Output

```bash
nmap -v localhost
```

More detailed output.

### Save Results

```bash
# Save to file
nmap -oN scan-results.txt localhost

# Save in XML format
nmap -oX scan-results.xml localhost
```

## Understanding Results

### Port States

- **open**: Service is running and accepting connections
- **closed**: Port is accessible but no service is listening
- **filtered**: Firewall is blocking the port
- **unfiltered**: Port is accessible but state is unknown

### Common Services

- **22/tcp**: SSH
- **80/tcp**: HTTP
- **443/tcp**: HTTPS
- **3000/tcp**: Common dev server port
- **3306/tcp**: MySQL
- **5432/tcp**: PostgreSQL
- **8080/tcp**: Alternative HTTP port

## Security Implications

### What This Teaches

1. **Service Discovery**: How attackers discover running services
2. **Port Scanning**: Understanding network reconnaissance
3. **Exposure Awareness**: What services are accessible

### Best Practices

- **Close unused services**: Don't run services you don't need
- **Use firewalls**: Block unnecessary ports
- **Limit exposure**: Only expose what's necessary
- **Monitor services**: Know what's running on your system

## Advanced Scanning

### Stealth Scan (SYN scan)

```bash
nmap -sS localhost
```

⚠️ Requires root/admin privileges.

### UDP Scan

```bash
nmap -sU localhost
```

Scans UDP ports (slower than TCP).

### Timing Options

```bash
# Aggressive scan (faster, more detectable)
nmap -T4 localhost

# Paranoid scan (slower, less detectable)
nmap -T0 localhost
```

## What You're Learning

- **Network reconnaissance**: How services are discovered
- **Port scanning**: Understanding network security basics
- **Service identification**: Recognizing common services
- **Security awareness**: What's exposed on your system

## Important Notes

⚠️ **Only scan systems you own or have permission to test!**

- Scanning without permission is illegal in many jurisdictions
- This lab is for educational purposes only
- Always get explicit permission before scanning

## Troubleshooting

**No results?**
- Ensure services are running
- Check firewall settings
- Verify you're scanning the correct host

**Permission denied?**
- Some scans require root/admin privileges
- Use `sudo` (Linux/Mac) or run as Administrator (Windows)

**Slow scans?**
- Use specific port ranges instead of all ports
- Adjust timing options (`-T` flag)

