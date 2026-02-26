import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const MIN_TEXT_LENGTH = 10;
const MAX_TEXT_LENGTH = 6000;
const UNISENDER_SEND_EMAIL_ENDPOINT = "https://api.unisender.com/ru/api/sendEmail";
const DEFAULT_UNISENDER_PLATFORM = "dvmeste";

type ComplaintPayload = {
  psychologistName: string;
  psychologistSlug?: string;
  complaintText: string;
  contactsText: string;
  sourceUrl?: string;
};

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function unquote(value: string): string {
  return value.trim().replace(/^['"]+|['"]+$/g, "");
}

function normalizePlatform(value: string): string {
  const normalized = value.trim().replace(/[^a-zA-Z0-9_]/g, "");
  return normalized || DEFAULT_UNISENDER_PLATFORM;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function validatePayload(payload: ComplaintPayload): string | null {
  if (!payload.psychologistName) return "Укажите ФИО психолога.";
  if (!payload.complaintText || payload.complaintText.length < MIN_TEXT_LENGTH) {
    return "Опишите суть жалобы подробнее (минимум 10 символов).";
  }
  if (!payload.contactsText || payload.contactsText.length < MIN_TEXT_LENGTH) {
    return "Укажите контакты для обратной связи (минимум 10 символов).";
  }
  if (payload.complaintText.length > MAX_TEXT_LENGTH) return "Текст жалобы слишком длинный.";
  if (payload.contactsText.length > MAX_TEXT_LENGTH) return "Контакты слишком длинные.";
  return null;
}

function getUnisenderConfig() {
  const apiKey = unquote(process.env.UNISENDER_API_KEY?.trim() || "");
  const fromEmail = unquote(process.env.UNISENDER_FROM_EMAIL?.trim() || "");
  const fromName = unquote(process.env.UNISENDER_FROM_NAME?.trim() || "Давай вместе");
  const receiverEmail = unquote(process.env.COMPLAINT_RECEIVER_EMAIL?.trim() || "manager@dvmeste.ru");
  const platform = normalizePlatform(
    unquote(process.env.UNISENDER_PLATFORM?.trim() || DEFAULT_UNISENDER_PLATFORM)
  );

  if (!apiKey || !fromEmail || !receiverEmail) {
    return null;
  }

  return { apiKey, fromEmail, fromName, receiverEmail, platform };
}

function buildComplaintMessage(payload: ComplaintPayload, request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";
  const sourceUrl = payload.sourceUrl || "не указан";

  const subject = `Жалоба на ${payload.psychologistName}`;
  const html = `
    <h2>Жалоба на ${escapeHtml(payload.psychologistName)}</h2>
    <p><b>Slug психолога:</b> ${escapeHtml(payload.psychologistSlug || "не указан")}</p>
    <p><b>Страница:</b> ${escapeHtml(sourceUrl)}</p>
    <p><b>IP:</b> ${escapeHtml(ip)}</p>
    <p><b>User-Agent:</b> ${escapeHtml(userAgent)}</p>
    <hr />
    <p><b>Суть жалобы:</b></p>
    <p>${escapeHtml(payload.complaintText).replaceAll("\n", "<br />")}</p>
    <p><b>Контакты для обратной связи:</b></p>
    <p>${escapeHtml(payload.contactsText).replaceAll("\n", "<br />")}</p>
  `;

  return { subject, html };
}

async function sendComplaintEmail(payload: ComplaintPayload, request: NextRequest) {
  const unisender = getUnisenderConfig();
  if (!unisender) {
    throw new Error(
      "Почта не настроена. Укажите UNISENDER_API_KEY, UNISENDER_FROM_EMAIL и COMPLAINT_RECEIVER_EMAIL."
    );
  }

  const { subject, html } = buildComplaintMessage(payload, request);

  const body = new URLSearchParams({
    format: "json",
    api_key: unisender.apiKey,
    platform: unisender.platform,
    email: unisender.receiverEmail,
    sender_name: unisender.fromName,
    sender_email: unisender.fromEmail,
    subject,
    body: html,
  });

  const response = await fetch(UNISENDER_SEND_EMAIL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      Accept: "application/json",
    },
    body: body.toString(),
  });

  const raw = await response.text().catch(() => "");
  if (!response.ok) {
    throw new Error(`UniSender classic error (${response.status}): ${raw || "unknown"}`);
  }

  let parsed: { result?: unknown; error?: string; code?: string } = {};
  try {
    parsed = JSON.parse(raw) as { result?: unknown; error?: string; code?: string };
  } catch {
    throw new Error(`UniSender classic invalid response: ${raw || "empty response"}`);
  }

  if (parsed.error || parsed.code) {
    throw new Error(`UniSender classic error (${parsed.code || "unknown"}): ${parsed.error || "unknown"}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<ComplaintPayload>;
    const payload: ComplaintPayload = {
      psychologistName: normalizeText(body.psychologistName),
      psychologistSlug: normalizeText(body.psychologistSlug),
      complaintText: normalizeText(body.complaintText),
      contactsText: normalizeText(body.contactsText),
      sourceUrl: normalizeText(body.sourceUrl),
    };

    const validationError = validatePayload(payload);
    if (validationError) {
      return NextResponse.json({ success: false, error: validationError }, { status: 400 });
    }

    await sendComplaintEmail(payload, request);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Не удалось отправить жалобу.";
    console.error("[api/complaints][POST] failed:", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

