import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const MIN_TEXT_LENGTH = 10;
const MAX_TEXT_LENGTH = 6000;
const UNISENDER_SEND_EMAIL_ENDPOINT = "https://api.unisender.com/ru/api/sendEmail";
const DEFAULT_UNISENDER_PLATFORM = "dvmeste";
const DEFAULT_UNISENDER_COMPLAINT_LIST_TITLE = "Жалобы сайта";

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
  const complaintListId = unquote(process.env.UNISENDER_COMPLAINT_LIST_ID?.trim() || "");
  const defaultListTitle = `${DEFAULT_UNISENDER_COMPLAINT_LIST_TITLE} (${receiverEmail})`;
  const complaintListTitle =
    unquote(process.env.UNISENDER_COMPLAINT_LIST_TITLE?.trim() || "") || defaultListTitle;

  if (!apiKey || !fromEmail || !receiverEmail) {
    return null;
  }

  return { apiKey, fromEmail, fromName, receiverEmail, platform, complaintListId, complaintListTitle };
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
  const listId = await resolveComplaintListId(unisender);
  await ensureReceiverSubscribed(unisender, listId);

  const messageId = await createComplaintEmailMessage(unisender, listId, subject, html);
  try {
    await createComplaintCampaign(unisender, messageId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (!isEmptyOrUnavailableListError(message)) {
      throw error;
    }

    // Fallback: если список пуст или контакты недоступны, отправляем жалобу напрямую.
    await sendComplaintDirect(unisender, subject, html);
  }
}

type ClassicApiResponse<T = unknown> = {
  result?: T;
  error?: string;
  code?: string;
};

type ListItem = {
  id?: string | number;
  title?: string;
};

function buildClassicMethodEndpoint(method: string): string {
  return UNISENDER_SEND_EMAIL_ENDPOINT.replace(/\/sendEmail$/i, `/${method}`);
}

async function callUnisenderClassic<T>(
  method: string,
  unisender: NonNullable<ReturnType<typeof getUnisenderConfig>>,
  params: URLSearchParams
): Promise<T> {
  params.set("format", "json");
  params.set("api_key", unisender.apiKey);
  params.set("platform", unisender.platform);

  const endpoint = buildClassicMethodEndpoint(method);
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      Accept: "application/json",
    },
    body: params.toString(),
  });

  const raw = await response.text().catch(() => "");
  if (!response.ok) {
    throw new Error(`UniSender ${method} error (${response.status}): ${raw || "unknown"}`);
  }

  let parsed: ClassicApiResponse<T>;
  try {
    parsed = JSON.parse(raw) as ClassicApiResponse<T>;
  } catch {
    throw new Error(`UniSender ${method} invalid response: ${raw || "empty response"}`);
  }

  if (parsed.error || parsed.code) {
    throw new Error(`UniSender ${method} error (${parsed.code || "unknown"}): ${parsed.error || "unknown"}`);
  }

  return parsed.result as T;
}

function normalizeListId(value: unknown): string | null {
  const v = String(value ?? "").trim();
  return /^[0-9]+$/.test(v) ? v : null;
}

function isEmptyOrUnavailableListError(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes("the contact list is empty") ||
    m.includes("probably they are unavailable") ||
    m.includes("список") && m.includes("пуст")
  );
}

async function resolveComplaintListId(
  unisender: NonNullable<ReturnType<typeof getUnisenderConfig>>
): Promise<string> {
  const fromEnv = normalizeListId(unisender.complaintListId);
  if (fromEnv) {
    return fromEnv;
  }

  const lists = await callUnisenderClassic<ListItem[]>("getLists", unisender, new URLSearchParams());
  const matched = Array.isArray(lists)
    ? lists.find((list) => String(list?.title || "").trim() === unisender.complaintListTitle)
    : undefined;

  const existingId = normalizeListId(matched?.id);
  if (existingId) {
    return existingId;
  }

  const created = await callUnisenderClassic<{ id?: string | number }>(
    "createList",
    unisender,
    new URLSearchParams({
      title: unisender.complaintListTitle,
    })
  );

  const createdId = normalizeListId(created?.id);
  if (!createdId) {
    throw new Error("UniSender createList вернул некорректный id списка.");
  }

  return createdId;
}

async function ensureReceiverSubscribed(
  unisender: NonNullable<ReturnType<typeof getUnisenderConfig>>,
  listId: string
) {
  const params = new URLSearchParams({
    list_ids: listId,
    double_optin: "0",
    overwrite: "2",
  });
  params.set("fields[email]", unisender.receiverEmail);
  await callUnisenderClassic("subscribe", unisender, params);
}

async function createComplaintEmailMessage(
  unisender: NonNullable<ReturnType<typeof getUnisenderConfig>>,
  listId: string,
  subject: string,
  html: string
): Promise<string> {
  const result = await callUnisenderClassic<{ message_id?: string | number; id?: string | number }>(
    "createEmailMessage",
    unisender,
    new URLSearchParams({
      sender_name: unisender.fromName,
      sender_email: unisender.fromEmail,
      subject,
      body: html,
      list_id: listId,
    })
  );

  const messageId = normalizeListId(result?.message_id ?? result?.id);
  if (!messageId) {
    throw new Error("UniSender createEmailMessage вернул некорректный message_id.");
  }

  return messageId;
}

async function createComplaintCampaign(
  unisender: NonNullable<ReturnType<typeof getUnisenderConfig>>,
  messageId: string
) {
  await callUnisenderClassic(
    "createCampaign",
    unisender,
    new URLSearchParams({
      message_id: messageId,
      track_read: "1",
      track_links: "1",
    })
  );
}

async function sendComplaintDirect(
  unisender: NonNullable<ReturnType<typeof getUnisenderConfig>>,
  subject: string,
  html: string
) {
  await callUnisenderClassic(
    "sendEmail",
    unisender,
    new URLSearchParams({
      email: unisender.receiverEmail,
      sender_name: unisender.fromName,
      sender_email: unisender.fromEmail,
      subject,
      body: html,
    })
  );
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
