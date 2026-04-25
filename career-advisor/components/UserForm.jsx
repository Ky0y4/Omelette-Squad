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
  const [file, setFile] = useState(null);

  const handleChange = (id, val) => setValues((v) => ({ ...v, [id]: val }));

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    const ext = selected.name.split('.').pop().toLowerCase();
    if (!['pdf', 'docx'].includes(ext)) {
      alert('Only PDF and DOCX files are supported');
      e.target.value = '';
      return;
    }
    setFile(selected);
  };

  const handleRemoveFile = () => {
    setFile(null);
    document.getElementById('file-upload').value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const empty = FIELDS.find((f) => !values[f.id].trim());
    if (empty) {
      alert(`Please fill in "${empty.label}" before continuing.`);
      return;
    }

    setIsSubmitting(true);

    const description = FIELDS
      .filter(f => f.type !== 'select') 
      .map((f) => `${f.label}: ${values[f.id].trim()}.`)
      .join(' ');

    try {
      // FIX: Ensure budgetConstraint and riskTolerance are passed out of the form
      await onAnalyze({ 
        description, 
        timestamp: new Date().toISOString(),
        budgetConstraint: values.budgetConstraint,
        riskTolerance: values.riskTolerance
      }, file);
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

        <div className="form-field">
          <div className="field-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <label htmlFor="file-upload">Upload Resume or CV</label>
            <span className="optional-badge">Optional</span>
          </div>
          <span className="field-hint">PDF or DOCX format. Helps our AI extract deeper context.</span>
          
          <input
            id="file-upload"
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileChange}
            className="file-input-hidden"
          />

          {!file ? (
            <label htmlFor="file-upload" className="custom-file-upload">
              <span className="upload-icon">📄</span>
              <span>Click to select a file</span>
            </label>
          ) : (
            <div className="file-preview">
              <span className="file-name">📄 {file.name}</span>
              <button
                type="button"
                className="remove-file-btn"
                onClick={handleRemoveFile}
              >
                ✕ Remove
              </button>
            </div>
          )}
        </div>

        <hr className="form-divider" />

        <button type="submit" className="submit-btn" disabled={isSubmitting}>
          {isSubmitting ? 'Analysing…' : 'Get career recommendations'}
          {!isSubmitting && <span className="btn-arrow">→</span>}
        </button>
      </form>
    </div>
  );
}