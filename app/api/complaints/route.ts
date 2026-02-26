import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const MIN_TEXT_LENGTH = 10;
const MAX_TEXT_LENGTH = 6000;

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
  const apiKey = process.env.UNISENDER_API_KEY?.trim() || "";
  const baseUrl = (process.env.UNISENDER_API_URL?.trim() || "https://goapi.unisender.ru/ru/transactional/api/v1").replace(/\/+$/, "");
  const fromEmail = process.env.UNISENDER_FROM_EMAIL?.trim() || "";
  const fromName = process.env.UNISENDER_FROM_NAME?.trim() || "Давай вместе";
  const receiverEmail = process.env.COMPLAINT_RECEIVER_EMAIL?.trim() || "manager@dvmeste.ru";

  if (!apiKey || !fromEmail || !receiverEmail) {
    return null;
  }

  return { apiKey, baseUrl, fromEmail, fromName, receiverEmail };
}

async function sendComplaintEmail(payload: ComplaintPayload, request: NextRequest) {
  const unisender = getUnisenderConfig();
  if (!unisender) {
    throw new Error(
      "Почта не настроена. Укажите UNISENDER_API_KEY, UNISENDER_FROM_EMAIL и COMPLAINT_RECEIVER_EMAIL."
    );
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";
  const sourceUrl = payload.sourceUrl || "не указан";

  const subject = `Жалоба на ${payload.psychologistName}`;
  const text = [
    `Жалоба на ${payload.psychologistName}`,
    payload.psychologistSlug ? `Slug психолога: ${payload.psychologistSlug}` : "",
    `Страница: ${sourceUrl}`,
    `IP: ${ip}`,
    `User-Agent: ${userAgent}`,
    "",
    "Суть жалобы:",
    payload.complaintText,
    "",
    "Контакты для обратной связи:",
    payload.contactsText,
  ]
    .filter(Boolean)
    .join("\n");

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

  const response = await fetch(`${unisender.baseUrl}/email/send.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-API-KEY": unisender.apiKey,
    },
    body: JSON.stringify({
      message: {
        recipients: [{ email: unisender.receiverEmail }],
        subject,
        body: {
          html,
          plaintext: text,
        },
        from_email: unisender.fromEmail,
        from_name: unisender.fromName,
        reply_to: unisender.fromEmail,
        reply_to_name: unisender.fromName,
        track_links: 0,
        track_read: 0,
      },
    }),
  });

  if (!response.ok) {
    const raw = await response.text().catch(() => "");
    throw new Error(`UniSender error (${response.status}): ${raw || "unknown"}`);
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
