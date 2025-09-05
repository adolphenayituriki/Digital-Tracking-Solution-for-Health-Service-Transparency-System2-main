import React, { useState } from "react";
import api from "../api";

export default function CitizenFeedback() {
  const [trackingId, setTrackingId] = useState("");
  const [message, setMessage] = useState("");

  const submitFeedback = () => {
    api.post("/feedbacks", { tracking_id: trackingId, message }).then(() => {
      alert("Feedback submitted!");
      setTrackingId("");
      setMessage("");
    });
  };

  return (
    <div>
      <h2>Confirm Receipt / Report Issue</h2>
      <input
        placeholder="Tracking ID"
        value={trackingId}
        onChange={(e) => setTrackingId(e.target.value)}
      />
      <textarea
        placeholder="Message (optional)"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={submitFeedback}>Submit</button>
    </div>
  );
}
