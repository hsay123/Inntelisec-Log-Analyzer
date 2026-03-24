# 🛡️ Inntelisec Log Analyzer

> **A cybersecurity-focused, AI-ready log analysis platform built with Next.js 14 and TypeScript — designed to detect threats, parse anomalies, and surface actionable insights from raw system logs.**

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Example Log Input & Output](#example-log-input--output)
- [Use Cases](#use-cases)
- [Future Roadmap](#future-roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Modern systems generate enormous volumes of logs from servers, applications, firewalls, and security tools. These logs contain critical signals about:

- **Authentication attempts** (successful and failed logins)
- **Network activity** (unusual connections, port scans)
- **Security threats** (brute force, privilege escalation, intrusion attempts)
- **System errors** (disk failures, crashes, misconfigurations)
- **Performance anomalies** (resource exhaustion, unusual process activity)

Manually reviewing thousands of log lines is impractical for security teams. **Inntelisec Log Analyzer** solves this by automatically parsing, classifying, and surfacing events — giving SOC analysts, developers, and sysadmins a clear picture of what happened and when.

---

## Features

### 🔍 Log File Parsing
Reads and processes raw log files from common formats including syslog, auth.log, kernel logs, application logs, and custom log sources.

### 🚨 Security Event Detection
Identifies suspicious patterns such as:
- Failed login attempts and brute-force sequences
- Unauthorized access or privilege escalation
- Repeated errors from a single source IP
- Unusual system activity outside normal baselines

### ⚠️ Error Analysis
Detects and categorizes system errors, highlights critical kernel messages, and surfaces application-level failures with relevant context.

### 📊 Automated Log Insights
Converts raw, noisy log data into structured, readable summaries with severity classifications (INFO / WARNING / ERROR / CRITICAL).

### 🌐 Web-Based Interface
Built on Next.js 14 with a modern React frontend — no command-line knowledge required. Upload a log file and get instant results in-browser.

### 🔒 Cybersecurity Monitoring
Purpose-built for SOC analysts, incident responders, developers, and system administrators who need rapid situational awareness.

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 14 (App Router) | Server-side rendering, routing, API routes |
| **Language** | TypeScript | Type-safe development across the full stack |
| **UI Components** | Shadcn/ui + Radix UI | Accessible, composable component library |
| **Styling** | Tailwind CSS | Utility-first responsive styling |
| **State / Hooks** | Custom React hooks (`/hooks`) | Encapsulated log parsing and analysis logic |
| **Utilities** | `/lib` utilities | Log parsers, pattern matchers, formatters |
| **Package Manager** | pnpm | Fast, disk-efficient dependency management |
| **Build** | Turbopack (via Next.js) | Ultra-fast local development builds |

> **Note:** While the repository README describes a Python-based CLI, the actual codebase (96.6% TypeScript) is a full-stack Next.js web application. The Python description reflects the original design concept; the implementation is a modern web platform.

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Browser (Client)                  │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  Upload  │  │  Dashboard   │  │  Report View  │  │
│  │  Panel   │  │  & Filters   │  │  & Export     │  │
│  └────┬─────┘  └──────┬───────┘  └───────┬───────┘  │
│       └───────────────┼──────────────────┘           │
│                       │  React Components (/components)│
└───────────────────────┼─────────────────────────────┘
                        │ HTTP / Server Actions
┌───────────────────────┼─────────────────────────────┐
│              Next.js 14 App Router (/app)            │
│  ┌─────────────────────────────────────────────┐    │
│  │              API Routes / Server Actions     │    │
│  └──────────────────────┬──────────────────────┘    │
│                         │                            │
│  ┌──────────────────────┼──────────────────────┐    │
│  │           Core Logic Layer (/lib + /hooks)   │    │
│  │  ┌─────────────┐  ┌───────────┐  ┌────────┐ │    │
│  │  │  Log Parser  │  │ Pattern   │  │ Event  │ │    │
│  │  │  (formats)   │  │ Matcher   │  │Classify│ │    │
│  │  └─────────────┘  └───────────┘  └────────┘ │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
                        │
┌───────────────────────┼─────────────────────────────┐
│                  Data / Assets                       │
│   /public (static assets)   styles/ (globals)       │
└─────────────────────────────────────────────────────┘
```

<div align="center">
  <img src="Aritecturee.png" width="800" alt="System Architecture" style="border-radius:10px; />
</div>

---
### Data Flow

1. **User uploads** a log file (or pastes raw log text) via the web UI
2. **Next.js API route** receives the file and passes it to the core logic layer
3. **Log Parser** (in `/lib`) tokenizes the file line-by-line, normalizing timestamps and fields
4. **Pattern Matcher** applies security rules and regex patterns to classify each event
5. **Event Classifier** assigns severity levels and groups related events (e.g., brute force sequences)
6. **React components** render the classified events as an interactive dashboard
7. **Report View** allows users to export or download the structured analysis

---

## Project Structure

```
Inntelisec-Log-Analyzer/
│
├── app/                        # Next.js 14 App Router
│   ├── layout.tsx              # Root layout (fonts, metadata, providers)
│   ├── page.tsx                # Home page — log upload entry point
│   └── api/                    # API routes for server-side log processing
│       └── analyze/
│           └── route.ts        # POST /api/analyze — core analysis endpoint
│
├── components/                 # Reusable React UI components
│   ├── log-uploader.tsx        # Drag-and-drop / file picker component
│   ├── event-table.tsx         # Classified events display table
│   ├── severity-badge.tsx      # INFO / WARNING / ERROR / CRITICAL badges
│   ├── summary-panel.tsx       # High-level stats (total events, threats)
│   └── ui/                     # Shadcn/ui primitive components
│       ├── button.tsx
│       ├── card.tsx
│       ├── table.tsx
│       └── ...
│
├── hooks/                      # Custom React hooks
│   ├── use-log-analysis.ts     # Manages analysis state and API calls
│   └── use-filter.ts           # Client-side event filtering/search
│
├── lib/                        # Core business logic (pure TypeScript)
│   ├── parser.ts               # Log tokenizer — handles syslog, auth, kernel formats
│   ├── patterns.ts             # Security regex patterns and rule definitions
│   ├── classifier.ts           # Assigns severity and event categories
│   └── utils.ts                # Shared helpers (date parsing, IP extraction, etc.)
│
├── public/                     # Static assets (icons, sample log files)
│
├── styles/                     # Global CSS
│   └── globals.css             # Tailwind base + custom tokens
│
├── components.json             # Shadcn/ui configuration
├── next.config.mjs             # Next.js configuration
├── tsconfig.json               # TypeScript compiler options
├── package.json                # NPM dependencies and scripts
├── pnpm-lock.yaml              # Locked dependency tree
└── README.md                   # This file
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **pnpm** >= 8.x (`npm install -g pnpm`)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/hsay123/Inntelisec-Log-Analyzer.git
   cd Inntelisec-Log-Analyzer
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Run the development server:**
   ```bash
   pnpm dev
   ```

4. **Open in browser:**
   ```
   http://localhost:3000
   ```

### Production Build

```bash
pnpm build
pnpm start
```

---

## Usage

### Via the Web Interface

1. Navigate to `http://localhost:3000`
2. Drag and drop a `.log` file onto the upload panel, or click to browse
3. Click **Analyze** — results appear in the dashboard within seconds
4. Filter events by severity, IP address, or time range
5. Export the report as JSON or plain text

### Via the API (Programmatic)

Send a `POST` request to `/api/analyze` with your log content:

```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"log": "Mar 12 10:15:22 server sshd[1234]: Failed password for root from 192.168.1.10 port 22"}'
```

**Response:**
```json
{
  "events": [
    {
      "timestamp": "Mar 12 10:15:22",
      "severity": "WARNING",
      "category": "AUTH_FAILURE",
      "message": "Failed login attempt",
      "source_ip": "192.168.1.10",
      "user": "root",
      "raw": "Mar 12 10:15:22 server sshd[1234]: Failed password for root from 192.168.1.10 port 22"
    }
  ],
  "summary": {
    "total_lines": 1,
    "warnings": 1,
    "errors": 0,
    "critical": 0
  }
}
```

---

## Example Log Input & Output

### Input Log File

```
Mar 12 10:15:22 server sshd[1234]: Failed password for root from 192.168.1.10 port 22
Mar 12 10:15:24 server sshd[1234]: Failed password for root from 192.168.1.10 port 22
Mar 12 10:15:26 server sshd[1234]: Failed password for root from 192.168.1.10 port 22
Mar 12 10:16:10 server sshd[1235]: Accepted password for user from 192.168.1.5 port 22
Mar 12 10:17:03 server kernel: Error reading disk sector
Mar 12 10:18:44 server sudo: user1 : command not allowed ; USER=root ; COMMAND=/bin/bash
```

### Analyzed Output

```
╔══════════════════════════════════════════════════════════╗
║          INNTELISEC LOG ANALYSIS REPORT                  ║
╚══════════════════════════════════════════════════════════╝

Summary:  6 lines parsed  |  1 CRITICAL  |  2 WARNINGS  |  1 ERROR

─────────────────────────────────────────────────────────
[CRITICAL]  Brute Force Detected
  Source IP : 192.168.1.10
  Target    : root
  Attempts  : 3 in 4 seconds (10:15:22 – 10:15:26)
  Rule      : SSH_BRUTE_FORCE (3+ failures within 10s)

[INFO]      Successful Login
  User      : user
  Source IP : 192.168.1.5
  Time      : Mar 12 10:16:10

[ERROR]     Disk Read Error
  Host      : server (kernel)
  Time      : Mar 12 10:17:03
  Message   : Error reading disk sector

[WARNING]   Unauthorized Privilege Escalation Attempt
  User      : user1
  Attempted : sudo /bin/bash as root
  Time      : Mar 12 10:18:44
─────────────────────────────────────────────────────────
```

---

## Use Cases

| Role | How They Use It |
|------|----------------|
| **SOC Analyst** | Upload SIEM exports or raw auth logs to rapidly triage incidents |
| **Incident Responder** | Analyze logs post-breach to reconstruct attacker activity |
| **System Administrator** | Monitor authentication and kernel logs for silent failures |
| **DevOps Engineer** | Detect application errors and performance anomalies in CI/CD pipelines |
| **Security Student** | Learn log analysis by uploading sample logs and reviewing classifications |

---

## Future Roadmap

- [ ] **AI-based anomaly detection** — integrate ML models for behavioral baseline analysis
- [ ] **Real-time log streaming** — WebSocket support for live log tailing
- [ ] **Interactive dashboard** — charts for event frequency, top threat IPs, timeline views
- [ ] **SIEM integration** — connectors for Splunk, Elastic, and Graylog
- [ ] **Alert system** — email/webhook notifications for CRITICAL events
- [ ] **Multi-format support** — Windows Event Logs (.evtx), JSON logs, Apache/Nginx access logs
- [ ] **Custom rule editor** — UI for writing and testing custom detection patterns
- [ ] **User authentication** — multi-user support with role-based access control

---

## Contributing

Contributions are welcome and appreciated! Here's how to get involved:

1. **Fork** the repository on GitHub
2. **Create** a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** and add tests if applicable
4. **Commit** with a clear message:
   ```bash
   git commit -m "feat: add brute force detection for FTP logs"
   ```
5. **Push** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
6. **Open a Pull Request** against the `master` branch — describe what you changed and why

### Code Style

- All code must be TypeScript with strict mode enabled
- Follow the existing component structure in `/components`
- Keep business logic in `/lib` — keep components presentational
- Run `pnpm lint` before submitting a PR

---

## License

This project is open-source. See [LICENSE](./LICENSE) for details.

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/hsay123">hsay123</a> — forked from <a href="https://github.com/Shreyashio/Shree-Guru-Tegbahadursingh_22">Shreyashio</a>
</p>
