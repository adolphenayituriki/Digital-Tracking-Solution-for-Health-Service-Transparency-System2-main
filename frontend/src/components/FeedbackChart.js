import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import '../styles.css';

ChartJS.register(ArcElement, Tooltip, Legend);

function FeedbackChart({ feedbacks = [] }) {
  // If no feedback available, show a placeholder
  if (!feedbacks || feedbacks.length === 0) {
    return (
      <div className="feedback-chart-container">
        <p>No feedback data available</p>
      </div>
    );
  }

  // Process the feedback data to count positive and negative sentiments
  const positiveCount = feedbacks.filter(f => f.sentiment === 'positive').length;
  const negativeCount = feedbacks.filter(f => f.sentiment === 'negative').length;

  const data = {
    labels: ['Positive', 'Negative'],
    datasets: [
      {
        data: [positiveCount, negativeCount],
        backgroundColor: ['#007bff', '#dc3545'],
        hoverBackgroundColor: ['#0056b3', '#c82333'],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Feedback Distribution',
      },
    },
  };

  return (
    <div className="feedback-chart-container">
      <div style={{ height: '250px' }}>
        <Doughnut data={data} options={options} />
      </div>
    </div>
  );
}

export default FeedbackChart;
