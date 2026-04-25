'use client';

import { useState } from 'react';
import './UserForm.css';

const FIELDS = [
  {
    id: 'educationLevel',
    label: 'Education level & field of study',
    hint: 'Your highest completed or in-progress qualification',
    placeholder: "e.g. Bachelor's in Computer Science (Year 1)",
    type: 'input',
  },
  {
    id: 'technicalSkills',
    label: 'Technical skills or tools you know',
    hint: 'List 3–5 that you\'re most confident with',
    placeholder: 'e.g. Python, React, SQL, data analysis',
    type: 'textarea',
    rows: 3,
  },
  {
    id: 'enjoyTasks',
    label: 'Tasks or problems you enjoy solving',
    hint: 'Think about what gets you in the zone',
    placeholder: 'e.g. building dashboards, debugging logic, writing clear documentation',
    type: 'textarea',
    rows: 3,
  },
  {
    id: 'workEnvironment',
    label: 'Ideal work environment',
    hint: 'Culture, pace, team size — whatever matters to you',
    placeholder: 'e.g. remote-first, fast-paced startup, collaborative team',
    type: 'input',
  },
  {
    id: 'targetSalaryLocation',
    label: 'Target salary & preferred location',
    hint: 'Be as specific or broad as you like',
    placeholder: 'e.g. RM 80k in Kuala Lumpur, or remote ASEAN roles',
    type: 'input',
  },
  {
    id: 'budgetConstraint',
    label: 'Budget constraint',
    hint: 'How much you want or can invest in education',
    type: 'select',
    options: [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
    ],
  },
  {
    id: 'riskTolerance',
    label: 'Risk tolerance',
    hint: 'How comfortable you are with financial uncertainty',
    type: 'select',
    options: [
      { value: 'low', label: 'Low' },
      { value: 'high', label: 'High' },
    ],
  },
];

export default function UserForm({ onAnalyze }) {
  const [values, setValues] = useState({
    educationLevel: '',
    technicalSkills: '',
    enjoyTasks: '',
    workEnvironment: '',
    targetSalaryLocation: '',
    budgetConstraint: 'medium',
    riskTolerance: 'low',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (id, val) => setValues((v) => ({ ...v, [id]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    const empty = FIELDS.find((f) => !values[f.id].trim());
    if (empty) {
      alert(`Please fill in "${empty.label}" before continuing.`);
      return;
    }

    setIsSubmitting(true);

    const description = FIELDS.map((f) => `${f.label}: ${values[f.id].trim()}.`).join(' ');

    try {
      await onAnalyze({
        description,
        timestamp: new Date().toISOString(),
        budgetConstraint: values.budgetConstraint,
        riskTolerance: values.riskTolerance,
      });
    } catch (err) {
      console.error('Submission error:', err);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="user-form">
      <div className="form-intro">
        <h2>Tell us about yourself</h2>
        <p>
          Five questions help our system give you the most accurate career match.
          Be as honest and specific as you can — the more context, the better.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {FIELDS.map((field, i) => (
          <div className="form-field" key={field.id}>
            <div className="field-label">
              <label htmlFor={field.id}>{field.label}</label>
              <span className="field-num">0{i + 1}</span>
            </div>
            {field.hint && <span className="field-hint">{field.hint}</span>}

            {field.type === 'textarea' ? (
              <textarea
                id={field.id}
                value={values[field.id]}
                onChange={(e) => handleChange(field.id, e.target.value)}
                placeholder={field.placeholder}
                rows={field.rows || 3}
                required
              />
            ) : field.type === 'select' ? (
              <select
                id={field.id}
                value={values[field.id]}
                onChange={(e) => handleChange(field.id, e.target.value)}
                required
              >
                {field.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id={field.id}
                type="text"
                value={values[field.id]}
                onChange={(e) => handleChange(field.id, e.target.value)}
                placeholder={field.placeholder}
                required
              />
            )}
          </div>
        ))}

        <hr className="form-divider" />

        <button type="submit" className="submit-btn" disabled={isSubmitting}>
          {isSubmitting ? 'Analysing…' : 'Get career recommendations'}
          {!isSubmitting && <span className="btn-arrow">→</span>}
        </button>
      </form>
    </div>
  );
}
