#!/usr/bin/env node

/**
 * InstaDeck MCP Bridge Client (Stdio -> HTTP JSON-RPC)
 * Digunakan oleh Claude Desktop, Cursor, dan VS Code untuk menghubungkan AI Assistant
 * langsung ke InstaDeck Cloud Engine.
 */

const readline = require('readline');

const API_KEY = process.env.INSTADECK_API_KEY;
const API_URL = process.env.INSTADECK_API_URL || 'https://pro.instadeck.id/api/mcp';

if (!API_KEY) {
  const errorMsg = JSON.stringify({
    jsonrpc: '2.0',
    id: null,
    error: {
      code: -32001,
      message: 'INSTADECK_API_KEY tidak ditemukan di environment. Silakan set INSTADECK_API_KEY di konfigurasi Claude Desktop.',
    },
  });
  process.stdout.write(errorMsg + '\n');
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

rl.on('line', async (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;

  try {
    const jsonReq = JSON.parse(trimmed);

    // Kirim request ke endpoint InstaDeck MCP
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(jsonReq),
    });

    const jsonRes = await response.json();
    process.stdout.write(JSON.stringify(jsonRes) + '\n');
  } catch (err) {
    const errorRes = {
      jsonrpc: '2.0',
      id: null,
      error: {
        code: -32603,
        message: `Internal bridge error: ${err.message}`,
      },
    };
    process.stdout.write(JSON.stringify(errorRes) + '\n');
  }
});
