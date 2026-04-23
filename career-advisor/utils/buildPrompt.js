/**
 * buildPrompt.js - Utility function to create AI prompts for career analysis
 *
 * Takes user profile and careers dataset, returns a structured prompt string
 * that instructs AI to analyze and recommend suitable careers.
 */

export function buildPrompt(userProfile, careersDataset) {
  // Extract user profile data - now simplified to just description
  const { description = '' } = userProfile;

  // Format user profile section
  const userProfileSection = `
## USER PROFILE DESCRIPTION:

${description}

**Timestamp:** ${userProfile.timestamp || 'Not provided'}
`;

  // Format careers dataset
  const careersSection = careersDataset.careers
    .map((career, index) => `
${index + 1}. **${career.role}** (${career.category})
   - Salary Range: ${career.salary_range}
   - Demand Level: ${career.demand_level}
   - Growth Outlook: ${career.growth_outlook}
   - Required Skills: ${career.required_skills.join(', ')}
   - Preferred Interests: ${career.preferred_interests.join(', ')}
   - Work Style: ${career.work_style.join(', ')}
   - Education Relevance: ${career.education_relevance}
   - Description: ${career.short_description}
`)
    .join('\n');

  // Build the complete prompt
  const prompt = `You are an expert career advisor AI. Your task is to analyze a user's profile and recommend the most suitable careers from the provided dataset.

${userProfileSection}

## AVAILABLE CAREERS:
${careersSection}

## ANALYSIS INSTRUCTIONS:

1. **Analyze the user's profile** by examining their:
   - Interests and hobbies (what they enjoy doing)
   - Academic background and strongest subjects
   - Achievements and accomplishments
   - Preferred work style and environment
   - Career goals and aspirations
   - Target salary expectations
   - Preferred industries

2. **Compare against careers** by evaluating:
   - How well their interests align with career requirements
   - Academic background fit with education requirements
   - Work style preferences match
   - Salary expectations alignment
   - Industry preferences
   - Skills they might already have vs. what needs to be developed

3. **Score and rank careers** on a scale of 0-100 based on overall fit

4. **Select top 3 careers** that best match their profile

5. **For each recommended career**, provide:
   - **why_it_fits**: Specific reasons why this career matches their interests, skills, goals, etc.
   - **trade_offs**: Potential downsides or trade-offs (salary vs. work-life balance, learning curve, etc.)
   - **next_steps**: Concrete, actionable steps they should take to pursue this career

## RESPONSE FORMAT:

You MUST respond with ONLY valid JSON in this exact structure:

{
  "top_careers": [
    {
      "role": "Career Name",
      "match_score": 85,
      "why_it_fits": "Detailed explanation of why this career fits their profile, interests, skills, and goals. Be specific and reference their background.",
      "trade_offs": "Potential trade-offs, challenges, or considerations. For example: competitive job market, steep learning curve, work-life balance concerns, salary vs. fulfillment, etc.",
      "next_steps": "Specific, actionable steps: certifications to get, courses to take, skills to develop, networking opportunities, entry-level positions to consider, etc."
    }
  ],
  "summary": "A 2-3 sentence overall summary of their career fit analysis, highlighting their strengths and the most promising paths forward."
}

IMPORTANT:
- Return ONLY valid JSON, no markdown formatting or extra text
- Ensure match_score is a number between 0-100
- Make recommendations specific and actionable
- Consider their current background and what they need to develop
- Focus on realistic career paths based on their profile
`;

  return prompt;
}

/**
 * Alternative function for simpler prompt building
 * Useful for testing or when you want less detailed analysis
 */
export function buildSimplePrompt(userProfile, careersDataset) {
  const interests = userProfile.interests?.join(', ') || 'Not specified';
  const hobbies = userProfile.hobbies?.join(', ') || 'Not specified';
  const goals = userProfile.careerGoals || 'Not specified';

  return `Analyze this person's career fit:
Interests: ${interests}
Hobbies: ${hobbies}
Career Goals: ${goals}

Available careers: ${careersDataset.careers.map(c => c.role).join(', ')}

Return top 3 career recommendations with match scores (0-100) and brief explanations.`;
}
