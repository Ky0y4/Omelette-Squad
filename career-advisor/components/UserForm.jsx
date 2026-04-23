'use client';

import { useState } from 'react';

export default function UserForm({ onAnalyze }) {
  const [userDescription, setUserDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userDescription.trim()) {
      alert('Please describe yourself to get career recommendations');
      return;
    }

    setIsSubmitting(true);

    try {
      // Send simplified data structure
      await onAnalyze({
        description: userDescription.trim(),
        timestamp: new Date().toISOString()
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
        Describe your interests, skills, experience, and career goals. The more detail you provide,
        the better we can match you with suitable career paths.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="description">Your Profile Description *</label>
          <textarea
            id="description"
            value={userDescription}
            onChange={(e) => setUserDescription(e.target.value)}
            placeholder="Example: I'm a 25-year-old computer science graduate with 2 years of experience in web development. I enjoy solving complex problems, working with data, and building user-friendly applications. I'm interested in technology, artificial intelligence, and want a career that allows me to be creative while having work-life balance. I have skills in Python, JavaScript, React, and SQL..."
            rows="12"
            required={true}
          />
          <div className="character-count">
            {userDescription.length} characters
          </div>
        </div>

        <button
          type="submit"
          className="submit-btn"
          disabled={isSubmitting || !userDescription.trim()}
        >
          {isSubmitting ? 'Analyzing...' : 'Get Career Recommendations'}
        </button>
      </form>
    </div>
  );
}

