import type { Metadata } from "next";
import { getChatGPTUser } from "./chatgpt-auth";
import { TripReadyApp } from "./tripready-app";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your trip, ready for reality",
  description:
    "A conflict-aware travel workspace that turns scattered confirmations into one dependable itinerary.",
};

export default async function Home() {
  const user = await getChatGPTUser();

  return (
    <TripReadyApp
      userName={user?.displayName ?? "Anika"}
      userEmail={user?.email ?? null}
    />
  );
}
