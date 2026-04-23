import { NextResponse } from 'next/server';
import careersDataset from '@/data/careers.json';
import { buildPrompt } from '@/utils/buildPrompt';

export async function POST(request) {
  try {
    // Parse the user profile data from the request
    const userProfile = await request.json();

    // Validate required fields - now just checking for description
    if (!userProfile.description || !userProfile.description.trim()) {
      return NextResponse.json(
        {
          error: 'Missing required field: description'
        },
        { status: 400 }
      );
    }

    // Build the AI prompt using the helper function
    const aiPrompt = buildPrompt(userProfile, careersDataset);

    // Check if Z.AI API key is availability
    const apiKey = process.env.ZAI_API_KEY;

    if (apiKey) {
      // TODO: Replace with actual Z.AI API call
      // This is placeholder code for when you have the real API

      try {
        // Example structure for Z.AI API call (replace with actual endpoint)
        const response = await fetch('https://api.z.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4', // or whatever model Z.AI uses
            messages: [
              {
                role: 'system',
                content: 'You are an expert career advisor. Analyze the user profile and recommend suitable careers.'
              },
              {
                role: 'user',
                content: aiPrompt
              }
            ],
            temperature: 0.7,
            max_tokens: 2000,
          }),
        });

        if (!response.ok) {
          throw new Error(`AI API error: ${response.status}`);
        }

        const aiResponse = await response.json();

        // Parse the AI response (assuming it returns JSON)
        let analysisResult;
        try {
          // If AI returns JSON directly
          analysisResult = JSON.parse(aiResponse.choices[0].message.content);
        } catch (parseError) {
          // If AI returns text that needs parsing
          // You might need to adjust this based on Z.AI's response format
          analysisResult = {
            top_careers: [],
            summary: 'AI analysis completed but response format needs adjustment.'
          };
        }

        return NextResponse.json(analysisResult);

      } catch (aiError) {
        console.error('AI API call failed:', aiError);

        // Return error instead of fallback to mock response
        return NextResponse.json(
          {
            error: 'AI service unavailable',
            message: 'Unable to connect to AI service. Please try again later.'
          },
          { status: 503 }
        );
      }

    } else {
      // No API key - return error instead of mock response
      console.log('No ZAI_API_KEY found - AI integration required');

      return NextResponse.json(
        {
          error: 'AI integration not configured',
          message: 'Please set up Z.AI API key to enable career analysis'
        },
        { status: 503 }
      );
    }

  } catch (error) {
    console.error('Analysis API error:', error);

    return NextResponse.json(
      {
        error: 'Failed to analyze career profile',
        details: error.message
      },
      { status: 500 }
    );
  }
}

/**
 * Generate mock career analysis response for development/testing
 * This simulates what the AI would return
 */
function generateMockResponse(userProfile, careersDataset) {
  const { interests = [], hobbies = [], preferredIndustries = [] } = userProfile;

  // Simple matching logic based on interests and industries
  const scoredCareers = careersDataset.careers.map(career => {
    let score = Math.floor(Math.random() * 40) + 60; // Base score 60-100

    // Boost score for matching interests
    interests.forEach(interest => {
      if (career.preferred_interests.some(ci =>
        ci.toLowerCase().includes(interest.toLowerCase()) ||
        interest.toLowerCase().includes(ci.toLowerCase())
      )) {
        score += 10;
      }
    });

    // Boost score for matching industries
    if (preferredIndustries.includes(career.category)) {
      score += 15;
    }

    return {
      ...career,
      match_score: Math.min(100, score)
    };
  });

  // Get top 3 careers
  const topCareers = scoredCareers
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, 3)
    .map(career => ({
      role: career.role,
      match_score: career.match_score,
      why_it_fits: `Your interests in ${interests.slice(0, 2).join(' and ')} align well with the requirements for ${career.role}. This career matches your preferred work style and offers opportunities in ${career.category}.`,
      trade_offs: career.demand_level === 'Very High'
        ? 'High competition for positions, may require continuous learning'
        : career.growth_outlook === 'Good'
        ? 'Stable but slower growth compared to emerging fields'
        : 'Strong growth potential but may require significant initial investment in education/training',
      next_steps: `1. Research ${career.role} job requirements on LinkedIn\n2. Take online courses in ${career.required_skills.slice(0, 2).join(' and ')}\n3. Network with professionals in ${career.category}\n4. Consider certifications in relevant tools\n5. Look for entry-level positions or internships`
    }));

  return {
    top_careers: topCareers,
    summary: `Based on your profile, you show strong potential in ${topCareers[0].role} with a ${topCareers[0].match_score}% match. Your interests and background align well with technology and analytical roles. Consider focusing on skill development in your top matches while exploring related career paths.`
  };
}
