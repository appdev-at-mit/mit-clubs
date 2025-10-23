import mongoose from "mongoose";

export interface Event{
    title: string;
    organization: string;
    sender_email?: string;
    time: string;
    loc: string;
    description?: string;
}

const EventSchema = new mongoose.Schema({
    title: {type: String, required:true, sparse: true},
    organization: {type: String, required:true, sparse:true},
    sender_email: {type: String},
    time: {type: String, required:true},
    loc: {type: String, required:true},
    description: {type: String},
});

const EventModel = mongoose.model<Event>("event", EventSchema);

function createEventModel() {
  return new EventModel();
}
export type EventModelType = ReturnType<typeof createEventModel>;

export default EventModel;