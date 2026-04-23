'use client';

import { useState } from 'react';
import { UserProfile } from '@/lib/types';

interface UserInputFormProps {
  onSubmit: (profile: UserProfile) => void;
  isLoading: boolean;
}

export default function UserInputForm({ onSubmit, isLoading }: UserInputFormProps) {
  const [formData, setFormData] = useState<UserProfile>({
    interests: [],
    hobbies: [],
    achievements: [],
    preferredWorkStyle: [],
    careerGoals: '',
    transcriptSummary: '',
    additionalNotes: '',
  });

  const [interestInput, setInterestInput] = useState('');
  const [hobbyInput, setHobbyInput] = useState('');
  const [achievementInput, setAchievementInput] = useState('');

  const workStyleOptions = [
    'Collaborative',
    'Independent',
    'Remote-friendly',
    'Fast-paced',
    'Structured',
    'Creative',
  ];

  const handleAddInterest = () => {
    if (interestInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        interests: [...prev.interests, interestInput.trim()],
      }));
      setInterestInput('');
    }
  };

  const handleAddHobby = () => {
    if (hobbyInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        hobbies: [...prev.hobbies, hobbyInput.trim()],
      }));
      setHobbyInput('');
    }
  };

  const handleAddAchievement = () => {
    if (achievementInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        achievements: [...prev.achievements, achievementInput.trim()],
      }));
      setAchievementInput('');
    }
  };

  const handleRemoveItem = (category: 'interests' | 'hobbies' | 'achievements', index: number) => {
    setFormData((prev) => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== index),
    }));
  };

  const handleWorkStyleChange = (style: string) => {
    setFormData((prev) => ({
      ...prev,
      preferredWorkStyle: prev.preferredWorkStyle.includes(style)
        ? prev.preferredWorkStyle.filter((s) => s !== style)
        : [...prev.preferredWorkStyle, style],
    }));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const text = await file.text();
      setFormData((prev) => ({
        ...prev,
        transcriptSummary: text.substring(0, 1000), // Store first 1000 chars
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.interests.length === 0) {
      alert('Please add at least one interest');
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <div className="form-section">
        <h2>🎯 Interests</h2>
        <div className="input-group">
          <input
            type="text"
            value={interestInput}
            onChange={(e) => setInterestInput(e.target.value)}
            placeholder="e.g., Problem-solving, Technology, Design"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInterest())}
          />
          <button type="button" onClick={handleAddInterest}>
            Add
          </button>
        </div>
        <div className="tags-container">
          {formData.interests.map((interest: string, idx: number) => (
            <span key={idx} className="tag">
              {interest}
              <button
                type="button"
                onClick={() => handleRemoveItem('interests', idx)}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="form-section">
        <h2>🎮 Hobbies</h2>
        <div className="input-group">
          <input
            type="text"
            value={hobbyInput}
            onChange={(e) => setHobbyInput(e.target.value)}
            placeholder="e.g., Reading, Coding, Drawing"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddHobby())}
          />
          <button type="button" onClick={handleAddHobby}>
            Add
          </button>
        </div>
        <div className="tags-container">
          {formData.hobbies.map((hobby: string, idx: number) => (
            <span key={idx} className="tag">
              {hobby}
              <button
                type="button"
                onClick={() => handleRemoveItem('hobbies', idx)}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="form-section">
        <h2>🏆 Achievements</h2>
        <div className="input-group">
          <input
            type="text"
            value={achievementInput}
            onChange={(e) => setAchievementInput(e.target.value)}
            placeholder="e.g., Led team project, Won hackathon"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAchievement())}
          />
          <button type="button" onClick={handleAddAchievement}>
            Add
          </button>
        </div>
        <div className="tags-container">
          {formData.achievements.map((achievement: string, idx: number) => (
            <span key={idx} className="tag">
              {achievement}
              <button
                type="button"
                onClick={() => handleRemoveItem('achievements', idx)}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="form-section">
        <h2>💼 Preferred Work Style</h2>
        <div className="checkbox-group">
          {workStyleOptions.map((style: string) => (
            <label key={style}>
              <input
                type="checkbox"
                checked={formData.preferredWorkStyle.includes(style)}
                onChange={() => handleWorkStyleChange(style)}
              />
              {style}
            </label>
          ))}
        </div>
      </div>

      <div className="form-section">
        <h2>📄 Upload Academic Records</h2>
        <input
          type="file"
          accept=".txt,.pdf,.csv,.md"
          onChange={handleFileUpload}
        />
        {formData.transcriptSummary && (
          <p className="file-info">✓ File uploaded ({formData.transcriptSummary.length} characters)</p>
        )}
      </div>

      <div className="form-section">
        <h2>🎯 Career Goals</h2>
        <textarea
          value={formData.careerGoals}
          onChange={(e) => setFormData((prev) => ({ ...prev, careerGoals: e.target.value }))}
          placeholder="What are your career aspirations? What do you want to achieve?"
          rows={3}
        />
      </div>

      <div className="form-section">
        <h2>📝 Additional Notes</h2>
        <textarea
          value={formData.additionalNotes}
          onChange={(e) => setFormData((prev) => ({ ...prev, additionalNotes: e.target.value }))}
          placeholder="Any other information we should consider?"
          rows={3}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading || formData.interests.length === 0}
        className="submit-button"
      >
        {isLoading ? '⏳ Analyzing...' : '🚀 Get Career Recommendations'}
      </button>
    </form>
  );
}
