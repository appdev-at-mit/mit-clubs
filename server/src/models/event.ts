import mongoose, { Document } from "mongoose";

export interface Event extends Document {
  // required fields
  title: string;
  organizer: string;
  organizer_email: string;
  contact_email: string;
  date: Date; // Store as Date in MongoDB
  location: string;
  recievedDate: Date;
  last_modified: Date;

  // optional fields from DormSpam
  source?: string;
  end_time?: Date;
  duration?: number;
  details?: string;
  fromEmailId?: string;
  tags?: Array<{ name: string }>;

  // app-specific fields (not from DormSpam)
  dormspamId?: number; // Original ID from DormSpam API
  imageUrl?: string;
  saveCount?: number;
}

const EventSchema = new mongoose.Schema({
  // required fields
  title: { type: String, required: true, index: true },
  organizer: { type: String, required: true },
  organizer_email: { type: String, required: true },
  contact_email: { type: String, required: true },
  date: { type: Date, required: true, index: true },
  location: { type: String, required: true },
  recievedDate: { type: Date, required: true },
  last_modified: { type: Date, required: true, index: true },

  // optional fields from DormSpam
  source: { type: String },
  end_time: { type: Date },
  duration: { type: Number },
  details: { type: String },
  fromEmailId: { type: String },
  tags: [
    {
      name: { type: String, required: true }
    }
  ],

  // app-specific fields
  dormspamId: { type: Number, unique: true, sparse: true }, // Unique but allows null
  imageUrl: { type: String },
  saveCount: { type: Number, default: 0 },
}, {
  timestamps: true // adds createdAt and updatedAt automatically
});

// indexes for efficient querying
EventSchema.index({ date: 1, last_modified: -1 });
EventSchema.index({ title: 'text', details: 'text' }); // text search
EventSchema.index({ 'tags.name': 1 }); // tag filtering

const EventModel = mongoose.model<Event>("Event", EventSchema);

export default EventModel;
