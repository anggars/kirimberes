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
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
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
    throw new Error("Failed to open Accurate DB: " + JSON.stringify(data.d));
  }
  // The host URL is usually returned in the response
  return data.host || data.session; 
}
