import crypto from "node:crypto";

import { deleteUserById } from "@holiday-promo/api/services/delete-user";
import { db } from "@holiday-promo/db";
import { account } from "@holiday-promo/db/schema/auth";
import { and, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { createApiErrorResponse } from "@/utils/error-response";

interface FacebookSignedRequestPayload {
  algorithm?: string;
  issued_at?: number;
  user_id?: string;
  user?: {
    id?: string;
  };
}

const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;
const DELETION_STATUS_URL = process.env.FACEBOOK_DELETION_STATUS_URL;
const FACEBOOK_PROVIDER_ID = "facebook";

/**
 * Normalizes Facebook's URL-safe base64 encoding to standard base64
 * (replaces - with + and _ with /, then adds padding)
 */
function normalizeBase64(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? 0 : 4 - (normalized.length % 4);
  return normalized.padEnd(normalized.length + padding, "=");
}

/**
 * Decodes the base64-encoded payload from Facebook's signed_request
 */
function decodePayload(encodedPayload: string): FacebookSignedRequestPayload {
  const payloadJson = Buffer.from(
    normalizeBase64(encodedPayload),
    "base64"
  ).toString("utf8");
  return JSON.parse(payloadJson) as FacebookSignedRequestPayload;
}

/**
 * Verifies Facebook's signed_request using HMAC-SHA256 signature validation
 * Returns the decoded payload if verification succeeds
 */
function verifySignedRequest(signedRequest: string) {
  if (!FACEBOOK_APP_SECRET) {
    throw new Error("FACEBOOK_APP_SECRET is not configured");
  }

  // Facebook signed_request format: signature.payload
  const [encodedSignature, encodedPayload] = signedRequest.split(".");

  if (!(encodedSignature && encodedPayload)) {
    throw new Error("Invalid Facebook signed_request");
  }

  // Compute expected signature using app secret
  const expectedSignature = crypto
    .createHmac("sha256", FACEBOOK_APP_SECRET)
    .update(encodedPayload)
    .digest();

  const providedSignature = Buffer.from(
    normalizeBase64(encodedSignature),
    "base64"
  );

  // Use timing-safe comparison to prevent timing attacks
  if (
    providedSignature.length !== expectedSignature.length ||
    !crypto.timingSafeEqual(providedSignature, expectedSignature)
  ) {
    throw new Error("Invalid Facebook signature");
  }

  const payload = decodePayload(encodedPayload);

  if (payload.algorithm?.toUpperCase() !== "HMAC-SHA256") {
    throw new Error("Unsupported signature algorithm");
  }

  return payload;
}

/**
 * Extracts the signed_request from the request body
 * Supports both JSON and form-encoded content types
 */
async function extractSignedRequest(req: NextRequest) {
  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const body = await req.json().catch(() => null);
    if (body && typeof body === "object") {
      const value = (body as Record<string, unknown>).signed_request;
      if (typeof value === "string") {
        return value;
      }
    }
  } else {
    const formData = await req.formData();
    const value = formData.get("signed_request");
    if (typeof value === "string") {
      return value;
    }
  }

  return null;
}

/**
 * Builds the status URL for Facebook to check deletion status
 * Includes confirmation code and user ID as query parameters
 */
function buildStatusUrl(params: { confirmationCode: string; userId: string }) {
  if (!DELETION_STATUS_URL) {
    throw new Error("FACEBOOK_DELETION_STATUS_URL is not configured");
  }

  const base = new URL(DELETION_STATUS_URL);
  base.searchParams.set("confirmation_code", params.confirmationCode);
  base.searchParams.set("user_id", params.userId);
  return base.toString();
}

/**
 * Facebook Data Deletion Callback endpoint
 * Handles user data deletion requests from Facebook per their policy requirements
 * Verifies the signed_request, deletes the user if found, and returns a status URL
 */
export async function POST(req: NextRequest) {
  try {
    const signedRequest = await extractSignedRequest(req);

    if (!signedRequest) {
      return createApiErrorResponse("signed_request missing", 400, {
        statusText: "Bad Request",
      });
    }

    // Verify the signed_request authenticity and extract payload
    const payload = verifySignedRequest(signedRequest);
    const facebookUserId = payload.user_id || payload.user?.id;

    if (!facebookUserId) {
      return createApiErrorResponse("user_id missing in signed_request", 400, {
        statusText: "Bad Request",
      });
    }

    // Find the user account linked to this Facebook account
    const [accountRecord] = await db
      .select({ userId: account.userId })
      .from(account)
      .where(
        and(
          eq(account.providerId, FACEBOOK_PROVIDER_ID),
          eq(account.accountId, facebookUserId)
        )
      )
      .limit(1);

    // Delete user data if account exists
    if (accountRecord) {
      await deleteUserById(accountRecord.userId);
    }

    // Generate confirmation code and status URL for Facebook
    const confirmationCode = crypto.randomUUID();
    const statusUrl = buildStatusUrl({
      confirmationCode,
      userId: accountRecord?.userId ?? facebookUserId,
    });

    return NextResponse.json({ url: statusUrl });
  } catch (error) {
    console.error("Facebook data deletion error", error);
    return createApiErrorResponse(
      "Unable to process data deletion request",
      500,
      {
        error,
        statusText: "Internal Server Error",
      }
    );
  }
}
