import crypto from 'crypto';

const ACCURATE_HOST = process.env.ACCURATE_HOST || "https://account.accurate.id";
const CLIENT_ID = process.env.ACCURATE_CLIENT_ID;
const CLIENT_SECRET = process.env.ACCURATE_CLIENT_SECRET;
const API_TOKEN = process.env.ACCURATE_API_TOKEN;
const OAUTH_CALLBACK = process.env.ACCURATE_OAUTH_CALLBACK;

/**
 * Generate X-Api-Signature for Accurate API
 * Accurate requires HMAC-SHA256 of the Timestamp string using the Client Secret (Signature Secret)
 */
function getAccurateSignature(timestamp: string, secret: string) {
  return crypto.createHmac('sha256', secret).update(timestamp).digest('base64');
}

/**
 * Get formatted timestamp for Accurate (dd/MM/yyyy HH:mm:ss)
 */
function getAccurateTimestamp() {
  const date = new Date();
  // Vercel runs in UTC. We force the time to Asia/Jakarta (GMT+7)
  const jakartaTime = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
  
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(jakartaTime.getDate())}/${pad(jakartaTime.getMonth() + 1)}/${jakartaTime.getFullYear()} ${pad(jakartaTime.getHours())}:${pad(jakartaTime.getMinutes())}:${pad(jakartaTime.getSeconds())}`;
}

/**
 * Generic fetch wrapper for Accurate API
 */
export async function fetchAccurateAPI(endpoint: string, method = "GET", body?: any, hostUrl = ACCURATE_HOST) {
  if (!API_TOKEN || !CLIENT_SECRET) {
    throw new Error("API Token or Client Secret is not configured in .env");
  }
  
  const timestamp = getAccurateTimestamp();
  const signature = getAccurateSignature(timestamp, CLIENT_SECRET);
  
  const response = await fetch(`${hostUrl}${endpoint}`, {
    method,
    headers: {
      "Authorization": `Bearer ${API_TOKEN}`,
      "Content-Type": "application/json",
      "X-Api-Timestamp": timestamp,
      "X-Api-Signature": signature,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  
  return response.json();
}

/**
 * Opens database session and retrieves the database host URL
 * E.g., https://zeus.accurate.id/...
 */
export async function openAccurateDatabase(dbId: string) {
  const data = await fetchAccurateAPI(`/api/open-db.do?id=${dbId}`);
  if (data.s === false) {
    // If the token is already bound to a database session, Accurate will reject open-db.do
    // with this specific message. We can just use the base host in that case.
    if (data.d && data.d[0] && typeof data.d[0] === 'string' && data.d[0].includes("termasuk Sesi Database")) {
      return "https://public.accurate.id/accurate";
    }
    throw new Error("Failed to open Accurate DB: " + JSON.stringify(data.d));
  }
  // The host URL is usually returned in the response
  return data.host || data.session; 
}
