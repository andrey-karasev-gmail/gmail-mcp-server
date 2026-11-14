import path from "node:path";

import type { Protocol } from "./types/email.js";

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function parsePort(name: string, fallback: number): number {
  const raw = process.env[name]?.trim();
  if (!raw) {
    return fallback;
  }

  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`Invalid port in ${name}: ${raw}`);
  }

  return parsed;
}

export interface GmailConfig {
  user: string;
  password: string;
  mailbox: string;
  defaultProtocol: Protocol;
  imap: {
    host: string;
    port: number;
  };
  pop3: {
    host: string;
    port: number;
  };
  pop3MarksFile: string;
  /** MCP transport: "stdio" (default, local) or "http" (remote, for hosting). */
  transport: "stdio" | "http";
  httpPort: number;
  /** Shared secret required as a Bearer token when transport is "http". */
  httpToken?: string;
}

function parseTransport(): "stdio" | "http" {
  const raw = process.env.MCP_TRANSPORT?.trim().toLowerCase();
  if (!raw || raw === "stdio") {
    return "stdio";
  }
  if (raw === "http") {
    return "http";
  }
  throw new Error(`Invalid MCP_TRANSPORT: ${raw} (expected "stdio" or "http")`);
}

export function getConfig(): GmailConfig {
  const defaultProtocolRaw = (process.env.GMAIL_PROTOCOL ?? "imap").toLowerCase();
  const defaultProtocol: Protocol = defaultProtocolRaw === "pop3" ? "pop3" : "imap";

  return {
    user: requireEnv("GMAIL_USER"),
    password: requireEnv("GMAIL_APP_PASSWORD"),
    mailbox: process.env.GMAIL_MAILBOX?.trim() || "INBOX",
    defaultProtocol,
    imap: {
      host: process.env.GMAIL_HOST_IMAP?.trim() || "imap.gmail.com",
      port: parsePort("GMAIL_PORT_IMAP", 993)
    },
    pop3: {
      host: process.env.GMAIL_HOST_POP3?.trim() || "pop.gmail.com",
      port: parsePort("GMAIL_PORT_POP3", 995)
    },
    pop3MarksFile: path.resolve(process.cwd(), process.env.POP3_MARKS_FILE?.trim() || "./data/pop3-marks.json"),
    transport: parseTransport(),
    httpPort: parsePort("MCP_HTTP_PORT", 3101),
    httpToken: process.env.MCP_HTTP_TOKEN?.trim() || undefined
  };
}
