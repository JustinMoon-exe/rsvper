// src/pages/api/rsvp.ts
import type { NextApiRequest, NextApiResponse } from 'next';

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxsJ0_04Pc8H48foxBve87kcC1Pdd4FiKB1s98RikdzpYenJ1Ua4C2jxM_f3fcSdgh8Aw/exec";
// put your Apps Script URL in a .env.local: 
//    ==APPS_SCRIPT_URL=https://script.google.com/macros/s/AKfycbwQc2vinNAFh0QMQc0lq8Ux2rPQpDk0akKnlT-mFkjtJCBenbS9Hl6NPK_YhW64byz5Vw/exec

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST from the browser
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    // Forward the JSON body to your Apps Script
    const response = await fetch(APPS_SCRIPT_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    // Mirror status code and JSON back to front-end
    res.status(response.status).json(data);
  } catch (err: any) {
    console.error('Error proxying to Apps Script:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
}
