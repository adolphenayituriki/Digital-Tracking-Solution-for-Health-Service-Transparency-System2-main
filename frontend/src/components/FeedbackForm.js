import React, { useState, useEffect } from 'react';
import { postFeedback, getShipments } from '../services/api';
import '../styles.css';

function FeedbackForm({ user }) {
  const [shipments, setShipments] = useState([]);
  const [selectedShipment, setSelectedShipment] = useState('');
  const [message, setMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState('receipt');
  const [anonymous, setAnonymous] = useState(false);
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;

    getShipments()
      .then(res => {
        const userShipments = res.data.filter(s => s.user_id === user.id);
        setShipments(userShipments);
      })
      .catch(err => console.error('Error fetching shipments:', err));
  }, [user]);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!message.trim()) return;

    setSubmitting(true);
    try {
      await postFeedback({
        user_id: anonymous ? null : user.id,
        shipment_id: selectedShipment || null,
        type: feedbackType,
        message,
      });

      setStatus('Feedback submitted successfully!');
      setMessage('');
      setSelectedShipment('');
      setFeedbackType('receipt');

      setTimeout(() => setStatus(''), 4000);
    } catch (err) {
      console.error(err);
      setStatus('Error submitting feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="feedback-container" style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', background: '#f9f9f9', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#006633' }}>Submit Your Feedback</h3>
      <form className="feedback-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <label htmlFor="shipment" style={{ fontWeight: '600' }}>Select Shipment (optional)</label>
        <select
          id="shipment"
          value={selectedShipment}
          onChange={e => setSelectedShipment(e.target.value)}
          style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem' }}
        >
          <option value="">-- Select Shipment --</option>
          {shipments.map(s => (
            <option key={s.id} value={s.id}>
              {s.item_name} - {s.status || 'Pending'}
            </option>
          ))}
        </select>

        <label htmlFor="type" style={{ fontWeight: '600' }}>Feedback Type</label>
        <select
          id="type"
          value={feedbackType}
          onChange={e => setFeedbackType(e.target.value)}
          required
          style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem' }}
        >
          <option value="receipt">Receipt Confirmation</option>
          <option value="missing">Missing Shipment</option>
          <option value="delay">Delay</option>
          <option value="quality">Quality Issue</option>
        </select>

        <label htmlFor="feedback" style={{ fontWeight: '600' }}>Your Feedback</label>
        <textarea
          id="feedback"
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Type your feedback or report an issue..."
          maxLength="500"
          required
          style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '1rem', minHeight: '100px', resize: 'vertical' }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            id="anonymous"
            checked={anonymous}
            onChange={e => setAnonymous(e.target.checked)}
          />
          <label htmlFor="anonymous" style={{ fontSize: '0.95rem' }}>Submit anonymously</label>
        </div>

        <button
          type="submit"
          disabled={submitting}
          style={{
            padding: '12px',
            backgroundColor: '#006633',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '1rem',
            cursor: submitting ? 'not-allowed' : 'pointer',
            transition: 'background 0.3s',
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#005022'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#006633'}
        >
          {submitting ? 'Submitting...' : 'Submit Feedback'}
        </button>

        {status && <div style={{ marginTop: '10px', textAlign: 'center', color: status.includes('successfully') ? '#22543D' : '#B71C1C', fontWeight: '600' }}>{status}</div>}
      </form>
    </div>
  );
}

export default FeedbackForm;
