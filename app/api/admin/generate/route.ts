import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

// Перевірка адмін-доступу
function checkAuth(req: NextRequest): boolean {
  const login = process.env.ADMIN_LOGIN;
  const pass = process.env.ADMIN_PASSWORD;
  if (!login && !pass) return true;
  const okLogin = !login || req.headers.get('x-admin-login') === login;
  const okPass = !pass || req.headers.get('x-admin-password') === pass;
  return okLogin && okPass;
}

const SYSTEM_PROMPT = `Ти — копірайтер українського інтернет-магазину "Добробуд" (електротранспорт, велосипеди, автохімія, інструмент).
Твоє завдання — написати продаючий SEO-опис товару українською мовою на основі назви та технічних характеристик.

Вимоги до опису:
- Природна українська мова, без кальок з російської
- 2-3 короткі абзаци (вступний + переваги + підсумок)
- Перший абзац містить назву товару та головну вигоду
- Використовуй ключові характеристики (потужність, акумулятор, запас ходу тощо) як переваги, а не сухий перелік
- Уникай вигадування фактів: спирайся ТІЛЬКИ на надані характеристики
- Не пиши ціну, не вигадуй гарантії чи акції
- Тон: впевнений, корисний, без надмірного захоплення
- Обсяг: 400-700 символів
- Поверни ЛИШЕ текст опису, без заголовків, markdown чи лапок`;

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Доступ заборонено' }, { status: 401 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY не налаштований' }, { status: 500 });
  }

  let body: { title?: string; specs?: Record<string, any>; rawDescription?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Некоректний запит' }, { status: 400 });
  }

  const { title, specs, rawDescription } = body;
  if (!title) {
    return NextResponse.json({ error: 'Потрібна назва товару' }, { status: 400 });
  }

  const specLines = specs
    ? Object.entries(specs)
        .filter(([k]) => !['source_url', 'article', 'subcategory'].includes(k))
        .map(([k, v]) => `${k}: ${v}`)
        .join('\n')
    : '';

  const userContent = `Назва товару: ${title}

Характеристики:
${specLines || '(немає окремих характеристик)'}

${rawDescription ? `Наявний технічний опис (переформулюй його гарно):\n${rawDescription.slice(0, 2000)}` : ''}`;

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userContent }],
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      return NextResponse.json({ error: `Claude API: ${resp.status} ${errText.slice(0, 200)}` }, { status: 502 });
    }

    const data = await resp.json();
    const text = (data.content || [])
      .filter((b: any) => b.type === 'text')
      .map((b: any) => b.text)
      .join('\n')
      .trim();

    if (!text) {
      return NextResponse.json({ error: 'Порожня відповідь від Claude' }, { status: 502 });
    }

    return NextResponse.json({ description: text });
  } catch (e: any) {
    return NextResponse.json({ error: `Помилка генерації: ${e.message}` }, { status: 500 });
  }
}
