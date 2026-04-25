'use client';

import { useState } from 'react';

export default function UserForm({ onAnalyze }) {
  const [educationLevel, setEducationLevel] = useState('');
  const [technicalSkills, setTechnicalSkills] = useState('');
  const [enjoyTasks, setEnjoyTasks] = useState('');
  const [workEnvironment, setWorkEnvironment] = useState('');
  const [targetSalaryLocation, setTargetSalaryLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !educationLevel.trim() ||
      !technicalSkills.trim() ||
      !enjoyTasks.trim() ||
      !workEnvironment.trim() ||
      !targetSalaryLocation.trim()
    ) {
      alert('Please complete all fields so we can provide a strong recommendation.');
      return;
    }

    setIsSubmitting(true);

    const description = `Education: ${educationLevel.trim()}. Skills / tools: ${technicalSkills.trim()}. Tasks I enjoy: ${enjoyTasks.trim()}. Ideal environment: ${workEnvironment.trim()}. Target salary and location: ${targetSalaryLocation.trim()}.`;

    try {
      await onAnalyze({
        description,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Submission error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="user-form">
      <h2>Tell Us About Yourself</h2>
      <p className="form-description">
        We’ve broken your profile into five structured questions to help the Decision Intelligence System give the most accurate recommendation.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="educationLevel">Current education level and field of study *</label>
          <input
            id="educationLevel"
            type="text"
            value={educationLevel}
            onChange={(e) => setEducationLevel(e.target.value)}
            placeholder="Example: Bachelor's in Computer Science"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="technicalSkills">3-5 technical skills or tools you know *</label>
          <textarea
            id="technicalSkills"
            value={technicalSkills}
            onChange={(e) => setTechnicalSkills(e.target.value)}
            placeholder="Example: Python, React, SQL, data analysis"
            rows="3"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="enjoyTasks">Tasks or problems you enjoy solving *</label>
          <textarea
            id="enjoyTasks"
            value={enjoyTasks}
            onChange={(e) => setEnjoyTasks(e.target.value)}
            placeholder="Example: building dashboards, solving business problems, optimizing processes"
            rows="3"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="workEnvironment">Ideal work environment *</label>
          <input
            id="workEnvironment"
            type="text"
            value={workEnvironment}
            onChange={(e) => setWorkEnvironment(e.target.value)}
            placeholder="Example: remote, fast-paced, collaborative team"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="targetSalaryLocation">Target salary and preferred location *</label>
          <input
            id="targetSalaryLocation"
            type="text"
            value={targetSalaryLocation}
            onChange={(e) => setTargetSalaryLocation(e.target.value)}
            placeholder="Example: RM80k in Kuala Lumpur or remote ASEAN roles"
            required
          />
        </div>

        <button
          type="submit"
          className="submit-btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Analyzing...' : 'Get Career Recommendations'}
        </button>
      </form>
    </div>
  );
}

