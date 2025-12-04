import mongoose, { Document } from "mongoose";

export interface Event {
   event_id: number;
    title: string;
    organizer: string;
    date: string; // ISO 8601 DateTime
    location: string;
    recievedDate: string; // ISO 8601 DateTime
    last_modified: string; // ISO 8601 DateTime
    // Optional fields
    source?: string;
    organizer_email?: string;
    contact_email?: string;
    end_time?: string; // ISO 8601 DateTime
    duration?: number;
    details?: string;
    fromEmailId?: string;
    tags?: string[];
    saveCount?: number;
}

const EventSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    title: { type: String, required: true },
    organizer: { type: String, required: true },
    date: { type: String, required: true },
    location: { type: String, required: true },
    recievedDate: { type: String, required: true },
    last_modified: { type: String, required: true },
    // Optional fields
    source: { type: String },
    organizer_email: { type: String },
    contact_email: { type: String },
    end_time: { type: String },
    duration: { type: Number },
    details: { type: String },
    fromEmailId: { type: String },
    tags: [{ type: String }],
    saveCount: { type: Number, default: 0 },
});

const EventModel = mongoose.model<Event>("event", EventSchema);

function createEventModel() {
  return new EventModel();
}
export type EventModelType = ReturnType<typeof createEventModel>;

export default EventModel;
