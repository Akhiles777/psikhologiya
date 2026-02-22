import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

const RECEIVER_EMAIL = "gasanalunkachev@gmail.com";
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

function getSmtpConfig() {
  const provider = (process.env.SMTP_PROVIDER?.trim() || "").toLowerCase();
  let host = process.env.SMTP_HOST?.trim() || "";
  const portRaw = process.env.SMTP_PORT?.trim() || "";
  const user = process.env.SMTP_USER?.trim() || "";
  const pass = process.env.SMTP_PASS?.trim() || "";
  const from = process.env.SMTP_FROM?.trim() || user;

  let secure = (process.env.SMTP_SECURE?.trim() || "") === "true";
  let port = Number(portRaw);

  // Brevo SMTP (бесплатный тариф): не требует API key
  if (!host && provider === "brevo") {
    host = "smtp-relay.brevo.com";
    if (!port) port = 587;
    secure = false;
  }

  // Упрощенный режим для Gmail: достаточно SMTP_USER/SMTP_PASS
  if (!host && provider === "gmail") {
    host = "smtp.gmail.com";
    if (!port) port = 465;
    secure = true;
  }

  // Упрощенный режим Gmail по домену, если SMTP_PROVIDER не задан
  if (!host && !provider && user.toLowerCase().endsWith("@gmail.com")) {
    host = "smtp.gmail.com";
    if (!port) port = 465;
    secure = true;
  }

  if (!port) {
    port = secure ? 465 : 587;
  }

  if (!host || !port || !user || !pass || !from) {
    return null;
  }

  return { host, port, secure, user, pass, from };
}

async function sendComplaintEmail(payload: ComplaintPayload, request: NextRequest) {
  const smtp = getSmtpConfig();
  if (!smtp) {
    throw new Error(
      "Почта не настроена. Укажите SMTP_PROVIDER, SMTP_USER, SMTP_PASS и SMTP_FROM в .env.local."
    );
  }

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: {
      user: smtp.user,
      pass: smtp.pass,
    },
  });

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

  await transporter.sendMail({
    from: smtp.from,
    to: RECEIVER_EMAIL,
    subject,
    text,
    html,
    replyTo: smtp.from,
  });
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
