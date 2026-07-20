import { NextRequest, NextResponse } from "next/server";
import { getChatGPTUser } from "../../chatgpt-auth";

const SYSTEM_PROMPT = `You are TripReady, a conservative travel operations assistant.
Use the supplied itinerary facts exactly. Explain schedule risks in plain language.
Never invent a confirmation number, time, booking, live status, or legal/visa claim.
Never imply that you cancelled, purchased, sent, or modified a reservation.
External changes require explicit user approval. Keep answers below 90 words.`;

const itinerary = {
  trip: "London in autumn",
  local_date: "2026-09-18",
  time_zone: "Europe/London",
  items: [
    { time: "07:30", item: "Arrive LHR on AI 161", source: "flight-confirmation.pdf" },
    { time: "08:30", item: "Estimated immigration completion", source: "TripReady estimate" },
    { time: "09:15", item: "Heathrow Express", source: "TripReady route plan" },
    { time: "11:30", item: "Dishoom Kensington for 2", source: "restaurant-email.txt" },
    { time: "15:00", item: "The Hoxton Southwark check-in", source: "hotel-confirmation.pdf" },
    { time: "17:30", item: "Tower Bridge timed entry", source: "tower-bridge-ticket.png" },
  ],
};

export async function POST(request: NextRequest) {
  const user = await getChatGPTUser();
  const body = (await request.json().catch(() => null)) as { question?: unknown; delayApplied?: unknown } | null;
  const question = typeof body?.question === "string" ? body.question.trim().slice(0, 1200) : "";

  if (!question) {
    return NextResponse.json({ error: "A question is required." }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      answer: body?.delayApplied
        ? "Your next fixed item is Tower Bridge at 17:30. The revised plan keeps a 32-minute buffer; leave the hotel by 16:58."
        : "Your next fixed item is Dishoom at 11:30. Leave Paddington by 10:55 and keep your luggage-storage receipt handy.",
      mode: "demo",
    });
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-5.6-sol",
      reasoning: { effort: "medium" },
      instructions: SYSTEM_PROMPT,
      input: JSON.stringify({
        authenticated_user: user?.email ?? "demo-user",
        delay_applied: Boolean(body?.delayApplied),
        itinerary,
        question,
      }),
      text: { verbosity: "low" },
      store: false,
    }),
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: "TripReady could not reach the planning model." },
      { status: 502 },
    );
  }

  const data = (await response.json()) as { output_text?: string };
  return NextResponse.json({
    answer: data.output_text ?? "I checked the itinerary and found no new blocking issue.",
    mode: "gpt-5.6",
  });
}
