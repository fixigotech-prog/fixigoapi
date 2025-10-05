
import axios from "axios";
import crypto from "crypto";
import dotenv from "dotenv";
import loginTemplates from "../templates/logintemplate";
dotenv.config();

const templates = {
    login: loginTemplates,
    // signup: loginTemplates, // Example for future use
    // bookingConfirmation: bookingTemplates, 
};

export type TemplateType = keyof typeof templates;
export type Language = keyof typeof loginTemplates;

const appName = process.env.APP_NAME || 'Fixigo';

/**
 * Composes a message for a given type and language, replacing placeholders.
 * @param type The type of message template (e.g., 'login').
 * @param lang The language code (e.g., 'en', 'hi'). Defaults to 'en'.
 * @param data An object with data to replace in the template (e.g., { OTP: '123456' }).
 * @returns The composed message string.
 */
export function composeMessage(type: TemplateType, lang: Language = 'en', data: { [key: string]: string }): string {
    const templateSet = templates[type];
    if (!templateSet) {
        throw new Error(`Template type "${type}" not found.`);
    }
    const template = templateSet[lang] || templateSet.en;

    const allData = { ...data, AppName: appName };

    return template.replace(/\[(\w+)\]/g, (placeholder, key) => allData[key as keyof typeof allData] || placeholder);
}

/**
 * Generates a 6-digit numeric OTP.
 * @returns {string} The generated OTP.
 */
export const generateOtp = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const baseUrl = "https://api.onbuka.com/v3";
const apiKey = "L948gbIc";
const apiPwd = "NYhMEjFX";
const appId = "fixigoservices";

function createHeaders() {
  const timestamp = Math.floor(Date.now() / 1000);
  const raw = `${apiKey}${apiPwd}${timestamp}`;
  const sign = crypto.createHash("md5").update(raw).digest("hex");

  return {
    "Content-Type": "application/json;charset=utf-8",
    Sign: sign,
    Timestamp: String(timestamp),
    "Api-Key": apiKey,
  };
}

export async function sendSms(numbers: string, content:string, senderId:string = "", orderId:string = "") {
  const url = `${baseUrl}/sendSms`;
  const headers = createHeaders();

  const body = {
    appId: appId,
    numbers: [numbers], // comma-separated string
    content: content,
    senderId: senderId,
    orderId: orderId,
  };

  try {
    const response = await axios.post(url, body, { headers });
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error("API Error:", error.response.data);
    } else {
      console.error("Request Error:", error.message);
    }
    throw error;
  }
}
