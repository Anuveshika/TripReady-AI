"use client";

import { FormEvent, useMemo, useState } from "react";

type View = "overview" | "timeline" | "wallet" | "budget" | "packing";

type TimelineItem = {
  time: string;
  title: string;
  detail: string;
  kind: "flight" | "transfer" | "food" | "stay" | "activity";
  badge?: string;
};

const navItems: Array<{ id: View; label: string; icon: string }> = [
  { id: "overview", label: "Overview", icon: "⌂" },
  { id: "timeline", label: "Timeline", icon: "≡" },
  { id: "wallet", label: "Travel wallet", icon: "▣" },
  { id: "budget", label: "Budget", icon: "£" },
  { id: "packing", label: "Packing", icon: "✓" },
];

const baseTimeline: TimelineItem[] = [
  {
    time: "07:30",
    title: "Arrive at London Heathrow",
    detail: "Air India AI 161 · Terminal 2",
    kind: "flight",
    badge: "Confirmed",
  },
  {
    time: "08:30",
    title: "Immigration & baggage buffer",
    detail: "TripReady estimate · 60 minutes",
    kind: "transfer",
    badge: "Smart buffer",
  },
  {
    time: "09:15",
    title: "Heathrow Express to Paddington",
    detail: "22 min · Platform shown on arrival",
    kind: "transfer",
  },
  {
    time: "10:00",
    title: "Leave bags at Paddington",
    detail: "Bounce luggage storage · Praed Street",
    kind: "stay",
  },
  {
    time: "11:30",
    title: "Lunch at Dishoom Kensington",
    detail: "Reservation for 2 · Vegetarian noted",
    kind: "food",
  },
  {
    time: "15:00",
    title: "Check in · The Hoxton Southwark",
    detail: "4 nights · Booking HX7021",
    kind: "stay",
    badge: "Wallet ready",
  },
  {
    time: "17:30",
    title: "Tower Bridge exhibition",
    detail: "Timed entry · 18 min walk from hotel",
    kind: "activity",
  },
];

const delayedTimeline: TimelineItem[] = [
  {
    time: "10:30",
    title: "Revised arrival at Heathrow",
    detail: "AI 161 · Delayed by 3 hours",
    kind: "flight",
    badge: "Live change",
  },
  {
    time: "11:35",
    title: "Immigration & baggage buffer",
    detail: "Recalculated from live arrival",
    kind: "transfer",
    badge: "Updated",
  },
  {
    time: "12:20",
    title: "Heathrow Express to Paddington",
    detail: "Lunch moved; storage window retained",
    kind: "transfer",
  },
  {
    time: "14:15",
    title: "Hotel early bag drop",
    detail: "Message ready for your approval",
    kind: "stay",
  },
  {
    time: "17:30",
    title: "Tower Bridge exhibition",
    detail: "Still feasible · leave hotel by 16:58",
    kind: "activity",
  },
];

const walletDocs = [
  ["AI", "Flight AI 161", "DEL → LHR", "AB12CD"],
  ["HX", "The Hoxton", "Sep 18–22", "HX7021"],
  ["TR", "Eurostar 9022", "London → Paris", "EU84K2"],
  ["TB", "Tower Bridge", "Sep 18 · 17:30", "TBE-2481"],
];

const packingSeed = [
  "Passport & travel insurance",
  "UK power adapter",
  "Light rain jacket",
  "Comfortable walking shoes",
  "Prescription medication",
  "Offline copies of tickets",
];

export function TripReadyApp({
  userName,
  userEmail,
}: {
  userName: string;
  userEmail: string | null;
}) {
  const [activeView, setActiveView] = useState<View>("overview");
  const [showImport, setShowImport] = useState(false);
  const [showDelay, setShowDelay] = useState(false);
  const [showTravelMode, setShowTravelMode] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const [conflictResolved, setConflictResolved] = useState(false);
  const [delayApplied, setDelayApplied] = useState(false);
  const [documents, setDocuments] = useState(5);
  const [toast, setToast] = useState<string | null>(null);
  const [checkedPacking, setCheckedPacking] = useState<string[]>([
    "Passport & travel insurance",
    "Offline copies of tickets",
  ]);
  const [assistantText, setAssistantText] = useState("");
  const [assistantBusy, setAssistantBusy] = useState(false);

  const firstName = userName.split(/\s|@/)[0] || "Traveler";
  const timeline = delayApplied ? delayedTimeline : baseTimeline;
  const confirmedCount = reviewed ? 8 : 7;

  const title = useMemo(() => {
    if (activeView === "timeline") return "Your master timeline";
    if (activeView === "wallet") return "Travel wallet";
    if (activeView === "budget") return "Trip budget";
    if (activeView === "packing") return "Packing checklist";
    return `Good morning, ${firstName}`;
  }, [activeView, firstName]);

  const flash = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2600);
  };

  const handleImport = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setDocuments((count) => count + 1);
    setShowImport(false);
    flash("Confirmation imported — 4 fields extracted");
  };

  const handleReview = () => {
    setReviewed(true);
    flash("Checkout time confirmed with source provenance");
  };

  const handleShare = async () => {
    const link = "https://tripready.example/share/london-5d";
    try {
      await navigator.clipboard.writeText(link);
      flash("Read-only itinerary link copied");
    } catch {
      flash("Share link ready: tripready.example/share/london-5d");
    }
  };

  const exportCalendar = () => {
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//TripReady//London//EN",
      "BEGIN:VEVENT",
      "UID:ai161@tripready",
      "DTSTART:20260918T063000Z",
      "DTEND:20260918T073000Z",
      "SUMMARY:Arrive at London Heathrow — AI 161",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "tripready-london.ics";
    anchor.click();
    URL.revokeObjectURL(url);
    flash("Calendar export downloaded");
  };

  const askAssistant = async () => {
    const question = assistantText.trim();
    if (!question) return;
    setAssistantBusy(true);
    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question, delayApplied }),
      });
      const data = (await response.json()) as { answer?: string };
      flash(data.answer ?? "I checked your itinerary — today still looks feasible.");
    } catch {
      flash("Your next fixed item is Tower Bridge at 17:30. Leave by 16:58.");
    } finally {
      setAssistantBusy(false);
      setAssistantText("");
    }
  };

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <button
          className="brand"
          onClick={() => setActiveView("overview")}
          aria-label="TripReady home"
        >
          <span className="brand-mark">T</span>
          <span>
            Trip<span>Ready</span>
          </span>
        </button>

        <nav className="primary-nav" aria-label="Trip workspace">
          <p className="nav-label">TRIP WORKSPACE</p>
          {navItems.map((item) => (
            <button
              key={item.id}
              className={activeView === item.id ? "nav-item active" : "nav-item"}
              onClick={() => setActiveView(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
              {item.id === "wallet" && <span className="nav-count">{documents}</span>}
            </button>
          ))}
        </nav>

        <div className="trip-switcher">
          <p className="nav-label">CURRENT TRIP</p>
          <button className="trip-chip">
            <span className="flag-chip">GB</span>
            <span>
              <strong>London in autumn</strong>
              <small>Sep 18–22 · 5 days</small>
            </span>
            <span className="chevron">⌄</span>
          </button>
        </div>

        <div className="sidebar-foot">
          <div className="offline-row">
            <span className="status-dot" />
            Offline wallet ready
          </div>
          <div className="profile-row">
            <span className="avatar">{firstName.slice(0, 1).toUpperCase()}</span>
            <span>
              <strong>{firstName}</strong>
              <small>{userEmail ?? "Demo workspace"}</small>
            </span>
            <span className="more">•••</span>
          </div>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div className="mobile-brand">
            <span className="brand-mark">T</span>
            TripReady
          </div>
          <div className="top-actions">
            <button className="quiet-button" onClick={handleShare}>
              ↗ <span>Share</span>
            </button>
            <button className="quiet-button" onClick={exportCalendar}>
              ↓ <span>Calendar</span>
            </button>
            <button className="import-button" onClick={() => setShowImport(true)}>
              <span>＋</span> Import booking
            </button>
          </div>
        </header>

        <div className="content-wrap">
          <div className="page-heading">
            <div>
              <p className="eyebrow">
                {activeView === "overview" ? "FRIDAY, 18 SEPTEMBER" : "LONDON · 18–22 SEP"}
              </p>
              <h1>{title}</h1>
              <p>
                {activeView === "overview"
                  ? "Everything is organized. One detail needs your attention."
                  : activeView === "timeline"
                    ? "Reservations, transfers, local times and smart buffers — in one place."
                    : activeView === "wallet"
                      ? "Your essential tickets and confirmation codes, available offline."
                      : activeView === "budget"
                        ? "Track confirmed spend and keep room for the good surprises."
                        : "A weather-aware list for five comfortable days in London."}
              </p>
            </div>
            <div className="trip-health">
              <div className="health-ring">
                <span>{conflictResolved ? "96" : "82"}</span>
                <small>%</small>
              </div>
              <div>
                <strong>{conflictResolved ? "Trip ready" : "Trip health"}</strong>
                <small>{conflictResolved ? "No blocking issues" : "1 conflict to review"}</small>
              </div>
            </div>
          </div>

          {activeView === "overview" && (
            <Overview
              timeline={timeline}
              reviewed={reviewed}
              onReview={handleReview}
              conflictResolved={conflictResolved}
              onResolve={() => setConflictResolved(true)}
              delayApplied={delayApplied}
              onDelay={() => setShowDelay(true)}
              onTravelMode={() => setShowTravelMode(true)}
              documents={documents}
              confirmedCount={confirmedCount}
            />
          )}

          {activeView === "timeline" && (
            <TimelineView timeline={timeline} delayApplied={delayApplied} onDelay={() => setShowDelay(true)} />
          )}

          {activeView === "wallet" && <WalletView onImport={() => setShowImport(true)} />}

          {activeView === "budget" && <BudgetView />}

          {activeView === "packing" && (
            <PackingView checked={checkedPacking} setChecked={setCheckedPacking} />
          )}
        </div>

        <div className="assistant-bar">
          <span className="assistant-spark">✦</span>
          <input
            value={assistantText}
            onChange={(event) => setAssistantText(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && askAssistant()}
            placeholder="Ask TripReady — “What should I do next?”"
            aria-label="Ask TripReady"
          />
          <button onClick={askAssistant} disabled={assistantBusy}>
            {assistantBusy ? "Checking…" : "Ask"}
          </button>
        </div>
      </section>

      {showImport && <ImportModal onClose={() => setShowImport(false)} onSubmit={handleImport} />}
      {showDelay && (
        <DelayModal
          onClose={() => setShowDelay(false)}
          onApply={() => {
            setDelayApplied(true);
            setConflictResolved(true);
            setShowDelay(false);
            flash("Revised itinerary applied — nothing changed externally");
          }}
        />
      )}
      {showTravelMode && (
        <TravelMode timeline={timeline} delayApplied={delayApplied} onClose={() => setShowTravelMode(false)} />
      )}
      {toast && <div className="toast">✓ {toast}</div>}
    </main>
  );
}

function Overview({
  timeline,
  reviewed,
  onReview,
  conflictResolved,
  onResolve,
  delayApplied,
  onDelay,
  onTravelMode,
  documents,
  confirmedCount,
}: {
  timeline: TimelineItem[];
  reviewed: boolean;
  onReview: () => void;
  conflictResolved: boolean;
  onResolve: () => void;
  delayApplied: boolean;
  onDelay: () => void;
  onTravelMode: () => void;
  documents: number;
  confirmedCount: number;
}) {
  return (
    <>
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon mint">✓</span>
          <div><strong>{confirmedCount}</strong><small>confirmed bookings</small></div>
          <span className="stat-note">All linked to source</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon amber">!</span>
          <div><strong>{conflictResolved ? 0 : 1}</strong><small>schedule conflict</small></div>
          <span className="stat-note">{conflictResolved ? "Resolved" : "Needs attention"}</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon blue">▣</span>
          <div><strong>{documents}</strong><small>documents ready</small></div>
          <span className="stat-note">Available offline</span>
        </div>
      </div>

      {!conflictResolved ? (
        <section className="conflict-banner">
          <div className="conflict-icon">!</div>
          <div className="conflict-copy">
            <p className="eyebrow">LIKELY SCHEDULE CONFLICT</p>
            <h2>Museum entry is too close to your arrival</h2>
            <p>
              Your flight lands at 13:10. The V&amp;A entry starts at 14:00 and is about 55 minutes from Heathrow — before immigration and baggage.
            </p>
          </div>
          <div className="recommendation">
            <small>TRIPREADY RECOMMENDS</small>
            <strong>Move entry to 16:30</strong>
            <span>Creates a 1h 45m safe buffer</span>
          </div>
          <button className="resolve-button" onClick={onResolve}>Review fix →</button>
        </section>
      ) : (
        <section className="resolved-banner">
          <span>✓</span>
          <div><strong>Your itinerary is realistic and conflict-free</strong><small>Every fixed booking has a verified transfer window.</small></div>
        </section>
      )}

      <div className="dashboard-grid">
        <section className="panel timeline-panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">TODAY IN LONDON</p>
              <h2>{delayApplied ? "Revised arrival day" : "Friday, September 18"}</h2>
            </div>
            <span className="weather-pill">☂ 17° · Rain after 3 PM</span>
          </div>
          <div className="timeline-list">
            {timeline.map((item, index) => (
              <TimelineRow key={`${item.time}-${item.title}`} item={item} last={index === timeline.length - 1} />
            ))}
          </div>
        </section>

        <aside className="side-stack">
          {!reviewed && (
            <section className="panel review-card">
              <div className="panel-head compact">
                <div>
                  <p className="eyebrow">REVIEW 1 DETAIL</p>
                  <h3>Hotel checkout time</h3>
                </div>
                <span className="confidence">73%</span>
              </div>
              <div className="source-field">
                <span>Sep 22 · 11:00 AM</span>
                <small>hotel-confirmation.pdf · page 2</small>
              </div>
              <p className="review-reason">The document says checkout is “between 10 AM and noon.”</p>
              <button className="full-button" onClick={onReview}>Confirm 11:00 AM</button>
            </section>
          )}

          <section className="panel map-card">
            <div className="panel-head compact">
              <div><p className="eyebrow">ROUTE AT A GLANCE</p><h3>Arrival day</h3></div>
              <button className="text-button">Open map ↗</button>
            </div>
            <div className="mini-map" aria-label="Stylized map of London itinerary locations">
              <span className="river river-one" />
              <span className="river river-two" />
              <span className="road road-one" />
              <span className="road road-two" />
              <span className="map-pin pin-airport">1<small>Heathrow</small></span>
              <span className="map-pin pin-hotel">2<small>Hotel</small></span>
              <span className="map-pin pin-bridge">3<small>Tower Bridge</small></span>
              <span className="route-line" />
            </div>
            <div className="map-meta"><span>3 stops</span><span>1h 34m transit</span><span>6.2 km walk</span></div>
          </section>

          <section className="action-grid">
            <button onClick={onTravelMode}><span>◎</span><strong>Travel mode</strong><small>See what’s next</small></button>
            <button onClick={onDelay}><span>↻</span><strong>Plan changed</strong><small>Re-plan safely</small></button>
          </section>
        </aside>
      </div>
    </>
  );
}

function TimelineView({ timeline, delayApplied, onDelay }: { timeline: TimelineItem[]; delayApplied: boolean; onDelay: () => void }) {
  return (
    <div className="wide-grid">
      <section className="panel timeline-panel large">
        <div className="panel-head">
          <div><p className="eyebrow">DAY 1 · ARRIVAL</p><h2>Friday, September 18</h2></div>
          <button className="outline-button" onClick={onDelay}>{delayApplied ? "Update delay" : "Simulate delay"}</button>
        </div>
        <div className="timeline-list">
          {timeline.map((item, index) => <TimelineRow key={`${item.time}-${item.title}`} item={item} last={index === timeline.length - 1} />)}
        </div>
      </section>
      <aside className="panel timezone-card">
        <p className="eyebrow">TIME ZONES</p>
        <h3>Local time, never lost</h3>
        <div className="timezone-row"><span>Delhi</span><strong>12:00</strong><small>Asia/Kolkata</small></div>
        <div className="timezone-row"><span>London</span><strong>07:30</strong><small>Europe/London</small></div>
        <p>Every reservation keeps its original local time, IANA zone, normalized UTC time, and source.</p>
      </aside>
    </div>
  );
}

function WalletView({ onImport }: { onImport: () => void }) {
  return (
    <>
      <div className="wallet-toolbar">
        <div className="offline-badge"><span>✓</span><div><strong>Offline bundle up to date</strong><small>Last synced just now · encrypted on this device</small></div></div>
        <button className="import-button" onClick={onImport}>＋ Add document</button>
      </div>
      <div className="wallet-grid">
        {walletDocs.map(([code, title, subtitle, confirmation]) => (
          <article className="wallet-card" key={title}>
            <div className="wallet-code">{code}</div>
            <div><p className="eyebrow">CONFIRMED</p><h3>{title}</h3><p>{subtitle}</p></div>
            <div className="confirmation"><small>CONFIRMATION</small><strong>{confirmation}</strong></div>
            <button>View ticket →</button>
          </article>
        ))}
      </div>
    </>
  );
}

function BudgetView() {
  const rows = [
    ["Flights & rail", "£1,040", "52%"],
    ["Accommodation", "£620", "31%"],
    ["Food", "£185", "9%"],
    ["Activities", "£96", "5%"],
    ["Local transit", "£59", "3%"],
  ];
  return (
    <div className="budget-layout">
      <section className="panel budget-hero">
        <p className="eyebrow">TOTAL TRIP BUDGET</p>
        <h2>£2,000 <span>of £2,500</span></h2>
        <div className="budget-bar"><span /></div>
        <div className="budget-summary"><span><strong>£1,836</strong><small>confirmed</small></span><span><strong>£164</strong><small>planned</small></span><span><strong>£500</strong><small>remaining</small></span></div>
      </section>
      <section className="panel spending-panel">
        <div className="panel-head compact"><div><p className="eyebrow">BY CATEGORY</p><h3>Where it’s going</h3></div><span className="safe-pill">On track</span></div>
        {rows.map(([label, amount, width]) => (
          <div className="spend-row" key={label}><span>{label}</span><div><i style={{ width }} /></div><strong>{amount}</strong></div>
        ))}
      </section>
    </div>
  );
}

function PackingView({ checked, setChecked }: { checked: string[]; setChecked: (items: string[]) => void }) {
  const toggle = (item: string) => setChecked(checked.includes(item) ? checked.filter((value) => value !== item) : [...checked, item]);
  return (
    <div className="packing-layout">
      <section className="panel packing-panel">
        <div className="panel-head"><div><p className="eyebrow">ESSENTIALS</p><h2>{checked.length} of {packingSeed.length} packed</h2></div><span className="weather-pill">☂ Light rain expected</span></div>
        <div className="packing-progress"><span style={{ width: `${(checked.length / packingSeed.length) * 100}%` }} /></div>
        {packingSeed.map((item) => (
          <label className={checked.includes(item) ? "packing-row done" : "packing-row"} key={item}>
            <input type="checkbox" checked={checked.includes(item)} onChange={() => toggle(item)} />
            <span>{checked.includes(item) ? "✓" : ""}</span>{item}
          </label>
        ))}
      </section>
      <aside className="panel packing-tip"><span>✦</span><p className="eyebrow">SMART ADDITION</p><h3>Pack a foldable tote</h3><p>Your Saturday market plan and 20% rain chance make a small water-resistant bag useful.</p></aside>
    </div>
  );
}

function TimelineRow({ item, last }: { item: TimelineItem; last: boolean }) {
  const glyph = { flight: "✈", transfer: "→", food: "○", stay: "⌂", activity: "◇" }[item.kind];
  return (
    <div className="timeline-row">
      <time>{item.time}</time>
      <div className={`timeline-marker ${item.kind}`}><span>{glyph}</span>{!last && <i />}</div>
      <div className="timeline-copy"><strong>{item.title}</strong><small>{item.detail}</small></div>
      {item.badge && <span className={`event-badge ${item.badge === "Live change" ? "alert" : ""}`}>{item.badge}</span>}
    </div>
  );
}

function ImportModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return (
    <div className="modal-backdrop" role="presentation">
      <form className="modal-card" onSubmit={onSubmit}>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close import dialog">×</button>
        <span className="modal-icon">↑</span>
        <p className="eyebrow">ADD TO YOUR TRIP</p>
        <h2>Import a confirmation</h2>
        <p>Upload a PDF or image, or paste any booking text. TripReady will extract details and keep every field linked to its source.</p>
        <label className="drop-zone">
          <input type="file" accept=".pdf,image/*" />
          <strong>Choose a PDF or image</strong>
          <small>Tickets, screenshots and confirmations · up to 10 MB</small>
        </label>
        <div className="or-divider"><span>or paste confirmation text</span></div>
        <textarea placeholder="Paste an airline, hotel, train or activity confirmation…" rows={4} />
        <div className="modal-actions"><button type="button" className="outline-button" onClick={onClose}>Cancel</button><button className="import-button" type="submit">Extract booking</button></div>
        <small className="privacy-note">Private by default · no reservation is ever changed without your approval</small>
      </form>
    </div>
  );
}

function DelayModal({ onClose, onApply }: { onClose: () => void; onApply: () => void }) {
  return (
    <div className="modal-backdrop" role="presentation">
      <div className="modal-card delay-card">
        <button className="modal-close" onClick={onClose} aria-label="Close delay dialog">×</button>
        <p className="eyebrow">MY PLAN CHANGED</p>
        <h2>Flight delayed by 3 hours</h2>
        <p>TripReady found four affected items and prepared a safe revision. Nothing will be cancelled, sent or changed externally.</p>
        <div className="impact-list">
          <div><span className="impact-icon red">!</span><span><strong>Dishoom lunch</strong><small>No longer feasible · release reminder prepared</small></span><b>Move</b></div>
          <div><span className="impact-icon amber">→</span><span><strong>Luggage storage</strong><small>Window adjusted to 13:15–14:00</small></span><b>Update</b></div>
          <div><span className="impact-icon mint">✓</span><span><strong>Tower Bridge</strong><small>Still feasible with a 32-minute buffer</small></span><b>Keep</b></div>
        </div>
        <div className="alternative"><small>RECOMMENDED PLAN</small><strong>Go directly to the hotel for bag drop</strong><span>Skip the lunch booking and have a quick meal near Southwark at 15:00.</span></div>
        <div className="modal-actions"><button className="outline-button" onClick={onClose}>Keep original</button><button className="import-button" onClick={onApply}>Apply revised plan</button></div>
      </div>
    </div>
  );
}

function TravelMode({ timeline, delayApplied, onClose }: { timeline: TimelineItem[]; delayApplied: boolean; onClose: () => void }) {
  const next = timeline[0];
  return (
    <div className="travel-overlay">
      <div className="travel-phone">
        <header><span className="brand-mark">T</span><strong>Travel mode</strong><button onClick={onClose}>×</button></header>
        <div className="travel-status"><span className="status-dot" /> Offline wallet ready</div>
        <p className="eyebrow">NEXT UP</p>
        <section className="next-card"><time>{next.time}</time><div><strong>{next.title}</strong><span>{next.detail}</span></div></section>
        <section className="travel-brief"><span>✦</span><div><small>MORNING BRIEF</small><p>{delayApplied ? "Your arrival changed. Go directly to the hotel for bag drop; Tower Bridge remains possible at 17:30." : "Leave Heathrow by 09:15 for Paddington. Rain is expected after 3 PM; your outdoor walk has already been moved earlier."}</p></div></section>
        <div className="travel-actions"><button>↗ Directions</button><button>▣ Show ticket</button></div>
        <div className="confirmation-strip"><small>FLIGHT CONFIRMATION</small><strong>AB12CD</strong><button>Copy</button></div>
        <button className="travel-primary" onClick={onClose}>What should I do next? →</button>
        <button className="travel-change" onClick={onClose}>My plan changed</button>
      </div>
    </div>
  );
}
