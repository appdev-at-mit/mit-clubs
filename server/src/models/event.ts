import mongoose from "mongoose";

/*
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
    saveCount: { type: Number},
});
*/

export interface Event {
  event_id: string;
  name: string;
  description: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  location: string;
  organizerId: string;
  organizerName: string;
  attendeeCount: number;
  maxAttendees?: number;
  imageUrl?: string;
  tags: string[];
  category: string;
  isRegistered?: boolean;
  isSavedInitially?: boolean;
  saveCount?: number;
}

const EventSchema = new mongoose.Schema({
  event_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  location: { type: String, required: true },
  organizerId: { type: String, required: true },
  organizerName: { type: String, required: true },
  attendeeCount: { type: Number, required: true },
  maxAttendees: { type: Number },
  imageUrl: { type: String },
  tags: [{ type: String }],
  category: { type: String, required: true },
  isRegistered: { type: Boolean, default: false },
  isSavedInitially: { type: Boolean, default: false },
  saveCount: { type: Number, default: 0 },
});


const EventModel = mongoose.model<Event>("event", EventSchema);

function createEventModel() {
  return new EventModel();
}
export type EventModelType = ReturnType<typeof createEventModel>;

export default EventModel;