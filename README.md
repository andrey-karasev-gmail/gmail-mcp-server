# Gmail MCP Server (IMAP + POP3)

This project provides an MCP server for Gmail with support for:

- Read emails
- Delete emails
- Mark emails as read/unread
- Protocol selection: `imap` or `pop3`
- No send-email capability included

## Features

MCP tools exposed by this server:

- `gmail_list_emails`
- `gmail_get_email`
- `gmail_delete_email`
- `gmail_mark_email`
- `gmail_list_folders` (IMAP only)
- `gmail_move_email` (IMAP only)

## Requirements

- Node.js 20+
- Gmail account with App Password enabled
  - Enable 2FA on Gmail
  - Create an App Password

## Quick install (recommended)

```bash
npx -y @web4w3/gmail-mcp-server
```

No cloning or build step needed. The package is pre-compiled and available on npm as [`@web4w3/gmail-mcp-server`](https://www.npmjs.com/package/@web4w3/gmail-mcp-server).

## Setup (build from source)

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables:

```bash
cp .env.example .env
```

Fill values in `.env`.

## Build and Run

```bash
npm run build
npm start
```

For development:

```bash
npm run dev
```

## Environment Variables

- `GMAIL_USER`: Gmail address
- `GMAIL_APP_PASSWORD`: Google app password
- `GMAIL_PROTOCOL`: default protocol (`imap` or `pop3`, default: `imap`)
- `GMAIL_MAILBOX`: mailbox folder for IMAP (default: `INBOX`)
- `GMAIL_HOST_IMAP`: IMAP host (default: `imap.gmail.com`)
- `GMAIL_PORT_IMAP`: IMAP port (default: `993`)
- `GMAIL_HOST_POP3`: POP3 host (default: `pop.gmail.com`)
- `GMAIL_PORT_POP3`: POP3 port (default: `995`)
- `POP3_MARKS_FILE`: local file used to persist POP3 read/unread marks
- `MCP_TRANSPORT`: `stdio` (default) or `http`
- `MCP_HTTP_PORT`: port for HTTP mode (default: `3101`)
- `MCP_HTTP_TOKEN`: Bearer token required on every request in HTTP mode (required when `MCP_TRANSPORT=http`)

## Protocol Notes

- **IMAP**: Supports server-side read/unread flags, deletion, folder listing, and email moving. Folders are Gmail labels.
- **POP3**: Does not support folders or moving emails. Read/unread marks are stored locally in `POP3_MARKS_FILE`. Deletions are performed on the maildrop via `DELE` and committed at `QUIT`.

**Note:** `gmail_list_folders` and `gmail_move_email` only work with IMAP protocol. POP3 will return empty folder list and reject move operations.

## MCP Client Example

Example MCP client config entry:

```json
{
  "mcpServers": {
    "gmail": {
      "command": "npx",
      "args": ["-y", "@web4w3/gmail-mcp-server"],
      "env": {
        "GMAIL_USER": "you@gmail.com",
        "GMAIL_APP_PASSWORD": "app_password"
      }
    }
  }
}
```

### Remote (HTTP) mode

By default the server speaks MCP over stdio for a client on the same machine.
To host it instead (for example on an always-on home server behind a tunnel):

```bash
MCP_TRANSPORT=http MCP_HTTP_PORT=3101 MCP_HTTP_TOKEN=<redacted> npm start
```

The server then listens for Streamable HTTP MCP requests on `/mcp` and
requires the token as `Authorization: Bearer <token>` on every request.
The endpoint is stateless; each request is independent. Keep it behind a
private tunnel or a TLS-terminating proxy — do not expose it to the open
internet without one.

```bash
curl -X POST http://localhost:3101/mcp \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

## Integration with Email Analytics Agent

This server is designed to work with the [Email Analytics Agent](https://github.com/andrey-karasev/email-analytics-agent), which provides:
- Intelligent email grouping by sender domain
- Interactive folder assignment
- Rule learning for automatic email organization

## Security

- Never commit `.env` or app passwords.
- Use Google App Passwords only.
- This server intentionally does not include any send-email action.
