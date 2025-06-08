// src/app/api/rsvp/route.ts
import { NextResponse } from 'next/server';

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxsJ0_04Pc8H48foxBve87kcC1Pdd4FiKB1s98RikdzpYenJ1Ua4C2jxM_f3fcSdgh8Aw/exec";
if (!APPS_SCRIPT_URL) {
  throw new Error('Missing NEXT_PUBLIC_APPS_SCRIPT_URL env var');
}

export async function GET(request: Request) {
  // Build a URL for your Apps Script endpoint
  const url = new URL(APPS_SCRIPT_URL);

  // Copy over each query param (mode, guest) from the incoming request
  const incomingParams = new URL(request.url).searchParams;
  incomingParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  // Fetch from Apps Script
  const gsRes = await fetch(url.toString());
  const text = await gsRes.text();

  // Try to JSON-parse; if it fails, return the raw text (so you can debug)
  try {
    const json = JSON.parse(text);
    return NextResponse.json(json, { status: gsRes.status });
  } catch {
    return new NextResponse(text, {
      status: gsRes.status,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch (err) {
    return NextResponse.json(
      { status: 'error', message: 'Invalid JSON payload', details: String(err) },
      { status: 400 }
    );
  }

  const gsRes = await fetch(APPS_SCRIPT_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });
  const text = await gsRes.text();
  try {
    return NextResponse.json(JSON.parse(text), { status: gsRes.status });
  } catch {
    return new NextResponse(text, {
      status: gsRes.status,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}
