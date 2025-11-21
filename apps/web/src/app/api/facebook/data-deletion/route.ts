import crypto from "node:crypto";

import { deleteUserById } from "@holiday-promo/api/services/delete-user";
import { db } from "@holiday-promo/db";
import { account } from "@holiday-promo/db/schema/auth";
import { and, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";

type FacebookSignedRequestPayload = {
  algorithm?: string;
  issued_at?: number;
  user_id?: string;
  user?: {
    id?: string;
  };
};

const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;
const DELETION_STATUS_URL = process.env.FACEBOOK_DELETION_STATUS_URL;
const FACEBOOK_PROVIDER_ID = "facebook";

function normalizeBase64(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? 0 : 4 - (normalized.length % 4);
  return normalized.padEnd(normalized.length + padding, "=");
}

function decodePayload(encodedPayload: string): FacebookSignedRequestPayload {
  const payloadJson = Buffer.from(
    normalizeBase64(encodedPayload),
    "base64"
  ).toString("utf8");
  return JSON.parse(payloadJson) as FacebookSignedRequestPayload;
}

function verifySignedRequest(signedRequest: string) {
  if (!FACEBOOK_APP_SECRET) {
    throw new Error("FACEBOOK_APP_SECRET is not configured");
  }

  const [encodedSignature, encodedPayload] = signedRequest.split(".");

  if (!(encodedSignature && encodedPayload)) {
    throw new Error("Invalid Facebook signed_request");
  }

  const expectedSignature = crypto
    .createHmac("sha256", FACEBOOK_APP_SECRET)
    .update(encodedPayload)
    .digest();

  const providedSignature = Buffer.from(
    normalizeBase64(encodedSignature),
    "base64"
  );

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

function buildStatusUrl(params: { confirmationCode: string; userId: string }) {
  if (!DELETION_STATUS_URL) {
    throw new Error("FACEBOOK_DELETION_STATUS_URL is not configured");
  }

  const base = new URL(DELETION_STATUS_URL);
  base.searchParams.set("confirmation_code", params.confirmationCode);
  base.searchParams.set("user_id", params.userId);
  return base.toString();
}

export async function POST(req: NextRequest) {
  try {
    const signedRequest = await extractSignedRequest(req);

    if (!signedRequest) {
      return NextResponse.json(
        { error: "signed_request missing" },
        { status: 400 }
      );
    }

    const payload = verifySignedRequest(signedRequest);
    const facebookUserId = payload.user_id || payload.user?.id;

    if (!facebookUserId) {
      return NextResponse.json(
        { error: "user_id missing in signed_request" },
        { status: 400 }
      );
    }

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

    if (accountRecord) {
      await deleteUserById(accountRecord.userId);
    }

    const confirmationCode = crypto.randomUUID();
    const statusUrl = buildStatusUrl({
      confirmationCode,
      userId: accountRecord?.userId ?? facebookUserId,
    });

    return NextResponse.json({ url: statusUrl });
  } catch (error) {
    console.error("Facebook data deletion error", error);
    return NextResponse.json(
      { error: "Unable to process data deletion request" },
      { status: 500 }
    );
  }
}
