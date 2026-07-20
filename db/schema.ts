import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const trips = sqliteTable(
  "trips",
  {
    id: text("id").primaryKey(),
    ownerEmail: text("owner_email").notNull(),
    name: text("name").notNull(),
    destination: text("destination").notNull(),
    startsOn: text("starts_on").notNull(),
    endsOn: text("ends_on").notNull(),
    preferencesJson: text("preferences_json").notNull().default("{}"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [index("trips_owner_idx").on(table.ownerEmail)],
);

export const sourceDocuments = sqliteTable(
  "source_documents",
  {
    id: text("id").primaryKey(),
    tripId: text("trip_id").notNull().references(() => trips.id, { onDelete: "cascade" }),
    ownerEmail: text("owner_email").notNull(),
    filename: text("filename").notNull(),
    contentType: text("content_type").notNull(),
    r2Key: text("r2_key").notNull(),
    status: text("status", { enum: ["uploaded", "processing", "review", "ready", "failed"] }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    index("source_documents_trip_idx").on(table.tripId),
    index("source_documents_owner_idx").on(table.ownerEmail),
  ],
);

export const reservations = sqliteTable(
  "reservations",
  {
    id: text("id").primaryKey(),
    tripId: text("trip_id").notNull().references(() => trips.id, { onDelete: "cascade" }),
    ownerEmail: text("owner_email").notNull(),
    sourceDocumentId: text("source_document_id").notNull().references(() => sourceDocuments.id, { onDelete: "restrict" }),
    type: text("type", { enum: ["flight", "hotel", "train", "activity", "restaurant", "transfer"] }).notNull(),
    provider: text("provider").notNull(),
    confirmationNumber: text("confirmation_number"),
    startLocal: text("start_local").notNull(),
    startTimeZone: text("start_time_zone").notNull(),
    startUtc: text("start_utc").notNull(),
    endLocal: text("end_local"),
    endTimeZone: text("end_time_zone"),
    endUtc: text("end_utc"),
    status: text("status", { enum: ["draft", "review", "confirmed", "cancelled"] }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    index("reservations_trip_idx").on(table.tripId),
    index("reservations_owner_idx").on(table.ownerEmail),
    index("reservations_start_utc_idx").on(table.startUtc),
  ],
);

export const reservationFields = sqliteTable(
  "reservation_fields",
  {
    id: text("id").primaryKey(),
    reservationId: text("reservation_id").notNull().references(() => reservations.id, { onDelete: "cascade" }),
    fieldName: text("field_name").notNull(),
    valueJson: text("value_json").notNull(),
    sourceDocumentId: text("source_document_id").notNull().references(() => sourceDocuments.id, { onDelete: "restrict" }),
    sourcePage: integer("source_page"),
    sourceExcerpt: text("source_excerpt"),
    confidence: real("confidence").notNull(),
    requiresReview: integer("requires_review", { mode: "boolean" }).notNull().default(false),
    confirmedByEmail: text("confirmed_by_email"),
    confirmedAt: integer("confirmed_at", { mode: "timestamp_ms" }),
  },
  (table) => [index("reservation_fields_reservation_idx").on(table.reservationId)],
);
