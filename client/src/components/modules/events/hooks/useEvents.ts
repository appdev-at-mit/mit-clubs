import { useState, useEffect } from "react";
import { Event } from "../../../../types";
import { getEvents, getSavedEventIds, saveEvent, unsaveEvent } from "../../../../api/events";

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [savedEventIds, setSavedEventIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const eventsData = await getEvents();
        setEvents(eventsData);
      } catch (error) {
        console.error("Error loading events:", error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  useEffect(() => {
    async function loadSaved() {
      try {
        const ids = await getSavedEventIds();
        setSavedEventIds(ids);
      } catch (err) {
        console.error("Error loading saved events:", err);
      }
    }

    loadSaved();
  }, []);

  async function toggleSave(eventId: string) {
    try {
      let updated;
      if (savedEventIds.includes(eventId)) {
        updated = savedEventIds.filter((id) => id !== eventId);
        await unsaveEvent(eventId);
      } else {
        updated = [...savedEventIds, eventId];
        await saveEvent(eventId);
      }
      setSavedEventIds(updated);
    } catch (err) {
      console.error("Error saving/unsaving event:", err);
    }
  }

  return {
    events,
    savedEventIds,
    loading,
    toggleSave,
  };
}
