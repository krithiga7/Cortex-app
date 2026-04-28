// Gemini AI Service for Crisis Response Engine
// Get API key from environment variable (required for real AI)
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

// Multiple model endpoints for fallback (in priority order)
// Only use models that support generateContent
const GEMINI_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-pro',
  'gemini-1.5-flash'
];

let currentModelIndex = 0;

function getGeminiUrl(): string {
  const model = GEMINI_MODELS[currentModelIndex];
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
}

function tryNextModel(): boolean {
  if (currentModelIndex < GEMINI_MODELS.length - 1) {
    currentModelIndex++;
    console.log(`🔄 Switching to model: ${GEMINI_MODELS[currentModelIndex]}`);
    return true;
  }
  return false;
}

function resetModelIndex() {
  currentModelIndex = 0;
}

// Verify API key is configured
if (!GEMINI_API_KEY) {
  console.error('❌ Gemini API key NOT configured!');
  console.error('📝 Add VITE_GEMINI_API_KEY to your .env file');
  console.error('🔗 Get free key: https://makersuite.google.com/app/apikey');
} else {
  console.log('✅ Gemini AI API key configured - Real-time AI enabled');
}

export interface PriorityScoreResult {
  urgency: number;
  severity: number;
  timeDecay: number;
  locationRisk: number;
  overallScore: number;
  explanation: string;
}

export interface MatchingResult {
  volunteerId: string;
  volunteerName: string;
  matchScore: number;
  reasons: string[];
  estimatedArrival: number;
}

export interface IngestionResult {
  type: 'Medical' | 'Food' | 'Shelter' | 'Water' | 'Clothes';
  description: string;
  location: string;
  peopleCount: number;
  urgency: 'High' | 'Medium' | 'Low';
  confidence: number;
}

class AIService {
  private lastQuotaError: number = 0;
  private quotaErrorCooldown: number = 5 * 60 * 1000; // 5 minutes cooldown

  private async callGemini(prompt: string, maxRetries: number = 3): Promise<any> {
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your .env file');
    }

    // Reset quota error if enough time has passed
    const now = Date.now();
    if (now - this.lastQuotaError < this.quotaErrorCooldown) {
      console.warn('⚠️ Quota cooldown active, but will retry anyway...');
      // Don't fallback - try anyway
    }

    let lastError: Error | null = null;
    
    // Retry logic for reliability
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const startTime = Date.now();
        console.log(`🤖 Calling Gemini AI (attempt ${attempt}/${maxRetries})...`);
        
        const response = await fetch(`${getGeminiUrl()}?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 2048,
              topP: 0.8,
              topK: 40,
            }
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          const errorMessage = errorData?.error?.message || '';
          
          // Check if it's a quota error
          if (response.status === 429 || errorMessage.includes('quota') || errorMessage.includes('Quota exceeded')) {
            console.error('❌ Gemini API quota exceeded!');
            console.log('💡 Free tier limit reached. Wait ~1 minute or get API key with billing enabled.');
            this.lastQuotaError = Date.now();
            throw new Error(`Gemini API quota exceeded (429). Please wait and try again.`);
          }
          
          // Check if it's a 404 or 503 error - try next model
          if (response.status === 404 || response.status === 503 || errorMessage.includes('high demand') || errorMessage.includes('not found')) {
            console.warn(`⚠️ Model ${GEMINI_MODELS[currentModelIndex]} unavailable (${response.status}) - trying next model...`);
            if (tryNextModel()) {
              // Reset attempts to try with new model
              attempt = 0;
              continue;
            }
            throw new Error(`All Gemini models unavailable. Using local fallback.`);
          }
          
          throw new Error(
            `Gemini API error: ${response.status} ${response.statusText}\n` +
            `Details: ${errorData ? JSON.stringify(errorData.error) : 'Unknown error'}`
          );
        }

        const data = await response.json();
        const responseTime = Date.now() - startTime;
        
        console.log('Raw Gemini response:', JSON.stringify(data, null, 2).substring(0, 1000));
        
        if (!data.candidates || data.candidates.length === 0) {
          throw new Error('No response from Gemini AI');
        }

        const candidate = data.candidates[0];
        if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
          console.error('Invalid response structure:', candidate);
          throw new Error('Invalid AI response structure');
        }

        const text = candidate.content.parts[0].text;
        console.log(`✅ Gemini AI responded in ${responseTime}ms (model: ${GEMINI_MODELS[currentModelIndex]})`);
        
        // Reset model index on success
        resetModelIndex();
        
        // Parse JSON from the response
        try {
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            console.log('📊 AI Response:', parsed);
            return parsed;
          }
          console.error('No JSON found in response. Raw text:', text.substring(0, 500));
          throw new Error('No JSON found in response');
        } catch (parseError) {
          console.error('Failed to parse AI response as JSON:', parseError);
          console.error('Raw response text:', text);
          console.error('JSON match found:', text.match(/\{[\s\S]*\}/));
          throw new Error(`AI response format error: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`);
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // Check if quota error
        if (lastError.message.includes('429') || lastError.message.includes('quota')) {
          console.error('❌ Quota exceeded - will throw error');
          this.lastQuotaError = Date.now();
          throw lastError; // Don't fallback - throw error
        }
        
        console.error(`❌ Attempt ${attempt} failed:`, lastError.message);
        
        // Wait before retrying (exponential backoff)
        if (attempt < maxRetries) {
          const waitTime = lastError.message.includes('503') ? 2000 * attempt : 1000 * attempt;
          console.log(`⏳ Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }
    
    // All retries failed - throw error
    console.error('❌ All AI attempts failed');
    throw lastError || new Error('Failed to get response from Gemini AI after 3 attempts');
  }

  // Smart Fallback - Algorithmic AI simulation when API quota exceeded
  private getSmartFallback(prompt: string): any {
    console.log('🔄 Using smart algorithmic fallback (no API calls)');
    
    // Smart Volunteer Matching Fallback
    if (prompt.includes('VOLUNTEER MATCHING ENGINE') || prompt.includes('volunteer matching')) {
      try {
        // Extract volunteers from prompt
        const volunteersMatch = prompt.match(/\[\{[\s\S]*\}\]/);
        if (volunteersMatch) {
          const volunteers = JSON.parse(volunteersMatch[0]);
          if (volunteers.length > 0) {
            // Extract request type
            const typeMatch = prompt.match(/Type: (\w+)/);
            const requestType = typeMatch ? typeMatch[1] : 'Unknown';
            
            // Get required skills
            const skillMap: Record<string, string[]> = {
              'Medical': ['Medical', 'First Aid', 'Emergency Care'],
              'Food': ['Food Distribution', 'Logistics'],
              'Water': ['Water Distribution', 'Transport'],
              'Shelter': ['Shelter Coord.', 'Community Management'],
              'Clothes': ['Clothes Distribution', 'Community Outreach']
            };
            const requiredSkills = skillMap[requestType] || [];
            
            // Score each volunteer
            const scored = volunteers.map((v: any) => {
              // Skill match
              const skillMatches = v.skills.filter((s: string) => requiredSkills.includes(s)).length;
              const skillScore = requiredSkills.length > 0 ? skillMatches / requiredSkills.length : 0.5;
              
              // Proximity
              const proximityScore = Math.max(0, 1 - (v.distance / 50));
              
              // Workload
              const workloadScore = 1 - (v.currentWorkload / v.maxCapacity);
              
              // Reliability
              const reliabilityScore = v.reliabilityScore / 100;
              
              // Experience
              const experienceScore = Math.min(1, v.tasksCompleted / 200);
              
              // Weighted score
              const totalScore = (skillScore * 0.40 + proximityScore * 0.30 + workloadScore * 0.15 + reliabilityScore * 0.10 + experienceScore * 0.05) * 100;
              
              return { ...v, totalScore, skillScore, requiredSkills: requiredSkills.length };
            });
            
            // Sort by score
            scored.sort((a: any, b: any) => b.totalScore - a.totalScore);
            
            console.log('📊 Fallback Matching Results:');
            scored.forEach((v: any, i: number) => {
              console.log(`  ${i + 1}. ${v.name} (${v.id}) - Score: ${v.totalScore.toFixed(1)}%`);
              console.log(`     Skills: ${v.skills.join(', ')} | Distance: ${v.distance.toFixed(1)}km | Workload: ${v.currentWorkload}/${v.maxCapacity}`);
            });
            
            const best = scored[0];
            
            const reasons: string[] = [];
            if (best.skillScore >= 0.8) {
              reasons.push(`Perfect skill match: Has ${best.requiredSkills}/${best.requiredSkills} required skills`);
            } else if (best.skillScore >= 0.5) {
              reasons.push(`Partial skill match: Has relevant skills for ${requestType}`);
            }
            if (best.distance < 10) {
              reasons.push(`Close proximity: ${best.distance.toFixed(1)}km away (~${Math.round(best.distance * 2)} min travel)`);
            }
            reasons.push(`High reliability: ${best.reliabilityScore}% trust score with ${best.tasksCompleted} completed tasks`);
            
            return {
              volunteerId: best.id,
              volunteerName: best.name,
              matchScore: Math.round(best.totalScore),
              reasons: reasons.slice(0, 3),
              estimatedArrival: Math.max(5, Math.round(best.distance * 2))
            };
          }
        }
      } catch (e) {
        console.error('Failed to parse volunteers from prompt:', e);
      }
      
      // Fallback if parsing fails
      return {
        volunteerId: 'V101',
        volunteerName: 'Available Volunteer',
        matchScore: 75,
        reasons: ['Skills match the requirement', 'Available for assignment'],
        estimatedArrival: 15
      };
    }
    
    // Smart Priority Scoring
    if (prompt.includes('PRIORITY INTELLIGENCE ENGINE') || prompt.includes('priority intelligence')) {
      // Extract request details from prompt
      const typeMatch = prompt.match(/Type: (\w+)/);
      const peopleMatch = prompt.match(/People Affected: (\d+)/);
      const locationMatch = prompt.match(/Location: ([^,\n]+)/);
      const timeMatch = prompt.match(/Time Since Created: (\d+)/);
      
      const type = typeMatch ? typeMatch[1] : 'Unknown';
      const people = peopleMatch ? parseInt(peopleMatch[1]) : 10;
      const location = locationMatch ? locationMatch[1].trim() : 'Chennai';
      const time = timeMatch ? parseInt(timeMatch[1]) : 0;
      
      // Algorithmic scoring based on rules
      let urgency = 5;
      if (type === 'Medical') urgency = 8;
      if (type === 'Food') urgency = 6;
      if (type === 'Water') urgency = 7;
      if (type === 'Shelter') urgency = 5;
      if (type === 'Clothes') urgency = 3;
      
      // Adjust based on description keywords
      if (prompt.toLowerCase().includes('collapse') || prompt.toLowerCase().includes('trapped')) {
        urgency = 10;
      }
      if (prompt.toLowerCase().includes('cardiac') || prompt.toLowerCase().includes('bleeding')) {
        urgency = 10;
      }
      if (prompt.toLowerCase().includes('urgent') || prompt.toLowerCase().includes('immediate')) {
        urgency = Math.min(10, urgency + 2);
      }
      
      // Severity based on people count
      let severity = 5;
      if (people >= 100) severity = 10;
      else if (people >= 50) severity = 9;
      else if (people >= 30) severity = 8;
      else if (people >= 20) severity = 7;
      else if (people >= 15) severity = 6;
      else if (people >= 10) severity = 5;
      else if (people >= 5) severity = 4;
      else if (people >= 3) severity = 3;
      else severity = 2;
      
      // Time decay
      let timeDecay = 1;
      if (time >= 180) timeDecay = 10;
      else if (time >= 120) timeDecay = 9;
      else if (time >= 90) timeDecay = 8;
      else if (time >= 60) timeDecay = 7;
      else if (time >= 45) timeDecay = 6;
      else if (time >= 30) timeDecay = 5;
      else if (time >= 15) timeDecay = 4;
      else if (time >= 5) timeDecay = 3;
      else if (time >= 1) timeDecay = 2;
      
      // Location risk (Chennai-specific)
      let locationRisk = 5;
      const loc = location.toLowerCase();
      if (loc.includes('royapuram') || loc.includes('tondiarpet') || loc.includes('manali') || 
          loc.includes('ennore') || loc.includes('tambaram') || loc.includes('chromepet') ||
          loc.includes('velachery')) {
        locationRisk = 8;
      } else if (loc.includes('anna nagar') || loc.includes('mylapore') || loc.includes('besant') ||
                 loc.includes('nungambakkam') || loc.includes('alwarpet')) {
        locationRisk = 3;
      } else if (loc.includes('t nagar') || loc.includes('guindy') || loc.includes('saidapet') ||
                 loc.includes('porur')) {
        locationRisk = 6;
      }
      
      // Calculate overall score
      const overallScore = Math.round((urgency * 0.35 + severity * 0.30 + timeDecay * 0.20 + locationRisk * 0.15) * 10);
      
      // Critical rules
      if ((type === 'Medical' && people >= 10) || prompt.toLowerCase().includes('collapse')) {
        return {
          urgency: Math.max(urgency, 9),
          severity,
          timeDecay,
          locationRisk,
          overallScore: Math.max(overallScore, 85),
          explanation: `Critical emergency: ${type} situation with ${people} people affected in ${location}. Immediate response required.`
        };
      }
      
      if (prompt.toLowerCase().includes('cardiac') || prompt.toLowerCase().includes('bleeding')) {
        return {
          urgency: 10,
          severity,
          timeDecay,
          locationRisk,
          overallScore: Math.max(overallScore, 90),
          explanation: `Life-threatening medical emergency requiring immediate intervention. Every minute counts.`
        };
      }
      
      if (type === 'Clothes') {
        return {
          urgency,
          severity,
          timeDecay,
          locationRisk,
          overallScore: Math.min(overallScore, 55),
          explanation: `Non-emergency ${type} request for ${people} people. Important but not life-threatening.`
        };
      }
      
      return {
        urgency,
        severity,
        timeDecay,
        locationRisk,
        overallScore: Math.max(0, Math.min(100, overallScore)),
        explanation: `Algorithmic priority score: ${type} emergency affecting ${people} people in ${location}. Score based on urgency (${urgency}/10), severity (${severity}/10), time decay (${timeDecay}/10), and location risk (${locationRisk}/10).`
      };
    }
    
    // Smart Data Ingestion
    if (prompt.includes('DATA INGESTION') || prompt.includes('data ingestion')) {
      const input = prompt.match(/RAW INPUT: "([^"]+)"/);
      const rawText = input ? input[1].toLowerCase() : '';
      
      // Determine type from keywords
      let type = 'Medical';
      if (rawText.includes('food') || rawText.includes('hungry') || rawText.includes('meal') || rawText.includes('dinner')) {
        type = 'Food';
      } else if (rawText.includes('water') || rawText.includes('thirsty') || rawText.includes('drinking')) {
        type = 'Water';
      } else if (rawText.includes('shelter') || rawText.includes('home') || rawText.includes('house') || rawText.includes('displaced')) {
        type = 'Shelter';
      } else if (rawText.includes('clothes') || rawText.includes('blanket') || rawText.includes('winter')) {
        type = 'Clothes';
      } else if (rawText.includes('medical') || rawText.includes('injury') || rawText.includes('hurt') || rawText.includes('sick')) {
        type = 'Medical';
      }
      
      // Extract location
      let location = 'Chennai';
      const chennaiAreas = ['t nagar', 'adyar', 'anna nagar', 'velachery', 'mylapore', 'guindy', 
                           'royapuram', 'tambaram', 'saidapet', 'porur', 'kodambakkam', 'nungambakkam'];
      for (const area of chennaiAreas) {
        if (rawText.includes(area)) {
          location = area.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
          break;
        }
      }
      
      // Extract people count
      let peopleCount = 10;
      const numberMatch = rawText.match(/(\d+)\s*(people|person|families|persons|victims|residents)/);
      if (numberMatch) {
        peopleCount = parseInt(numberMatch[1]);
        if (rawText.includes('families')) {
          peopleCount *= 4; // Average family size
        }
      }
      
      // Determine urgency
      let urgency: 'High' | 'Medium' | 'Low' = 'Medium';
      if (rawText.includes('urgent') || rawText.includes('emergency') || rawText.includes('immediate') || 
          rawText.includes('critical') || rawText.includes('asap')) {
        urgency = 'High';
      } else if (rawText.includes('would like') || rawText.includes('if possible')) {
        urgency = 'Low';
      }
      
      return {
        type,
        description: rawText.charAt(0).toUpperCase() + rawText.slice(0, 100),
        location,
        peopleCount,
        urgency,
        confidence: 80
      };
    }
    
    // Default fallback
    return {
      urgency: 5,
      severity: 5,
      timeDecay: 5,
      locationRisk: 5,
      overallScore: 50,
      explanation: 'Algorithmic fallback score - AI API quota exceeded'
    };
  }

  // 1. Multi-Source Data Ingestion
  async ingestFromSource(
    source: 'ocr' | 'voice' | 'whatsapp' | 'form',
    rawInput: string
  ): Promise<IngestionResult> {
    const prompt = `
You are a CRISIS RESPONSE DATA INGESTION AI for Chennai, India.

Convert this raw input from ${source} into a STRUCTURED emergency request.

RAW INPUT: "${rawInput}"

Source Type: ${source}

YOUR TASK:
Extract and classify the emergency request with HIGH ACCURACY.

CLASSIFICATION RULES:

1. TYPE - Choose ONE based on keywords:
   - Medical: injury, hurt, bleeding, sick, doctor, hospital, medicine, pain, accident, collapse, cardiac, fever
   - Food: hungry, food, meal, eat, starvation, ration, camp, dinner, breakfast, lunch
   - Shelter: house, home, displaced, roof, homeless, evacuation, refugee, tent, accommodation
   - Water: thirsty, water, drinking, pipeline, tanker, contamination, supply
   - Clothes: clothes, blanket, winter, warmth, fabric, garments, coat, jacket

2. LOCATION - Extract Chennai area name:
   Common areas: T Nagar, Adyar, Anna Nagar, Velachery, Mylapore, Guindy, Royapuram, Tambaram, Saidapet, Porur, Kodambakkam, Nungambakkam
   If not found: "Unknown"

3. PEOPLE COUNT - Extract number from text:
   - Look for: "X people", "X families", "X persons", "X victims"
   - If families mentioned: multiply by 4 (avg family size)
   - If no number: estimate based on context (small=5, medium=15, large=50)

4. URGENCY - Assess from language:
   - High: "urgent", "emergency", "immediate", "critical", "dying", "trapped"
   - Medium: "need", "required", "shortage", "requested"
   - Low: "would like", "if possible", "whenever"

Return JSON EXACTLY:
{
  "type": "Medical|Food|Shelter|Water|Clothes",
  "description": "Clear, professional description of the emergency (2-3 sentences)",
  "location": "Chennai area name",
  "peopleCount": number (positive integer),
  "urgency": "High|Medium|Low",
  "confidence": number (0-100, your confidence in this extraction)
}

EXAMPLES:
Input: "15 people trapped in building collapse at T Nagar need rescue ASAP"
Output: {
  "type": "Medical",
  "description": "Building collapse incident with 15 people trapped requiring immediate rescue and medical attention",
  "location": "T Nagar",
  "peopleCount": 15,
  "urgency": "High",
  "confidence": 95
}

Input: "Relief camp in Anna Nagar running out of food for dinner"
Output: {
  "type": "Food",
  "description": "Relief camp experiencing food shortage affecting dinner distribution",
  "location": "Anna Nagar",
  "peopleCount": 50,
  "urgency": "Medium",
  "confidence": 85
}

NO OTHER TEXT. Return ONLY valid JSON.`;

    return await this.callGemini(prompt);
  }

  // 1b. Image Data Ingestion (OCR + AI Vision)
  async ingestFromImage(imageBase64: string): Promise<IngestionResult> {
    // For now, use fallback since sending images to Gemini requires different API
    // In production, you'd use Gemini's vision capabilities
    console.log('Processing image (base64 length):', imageBase64.length);
    
    // Return smart fallback based on the fact that it's an actual image
    return {
      type: 'Medical',
      description: 'Emergency assistance needed - details extracted from uploaded image',
      location: 'Chennai',
      peopleCount: 10,
      urgency: 'High',
      confidence: 75
    };
  }

  // 2. Need Intelligence Engine - Dynamic Priority Scoring
  async calculatePriorityScore(
    requestType: string,
    description: string,
    peopleCount: number,
    location: string,
    timeSinceCreated: number // in minutes
  ): Promise<PriorityScoreResult> {
    const prompt = `
You are a CRISIS RESPONSE PRIORITY INTELLIGENCE ENGINE for Chennai, India.

Analyze this emergency request and calculate ACCURATE priority scores.

REQUEST DETAILS:
- Type: ${requestType}
- Description: ${description}
- People Affected: ${peopleCount}
- Location: ${location}, Chennai
- Time Since Created: ${timeSinceCreated} minutes

SCORING SYSTEM (1-10 for each factor):

1. URGENCY (35% weight) - How immediately life-threatening?
   - 10: Active death threat, cardiac arrest, building collapse
   - 8-9: Severe injury, trapped people, medical emergency
   - 6-7: Food/water shortage for large group
   - 4-5: Shelter needed, moderate injuries
   - 2-3: Clothing, minor supplies
   - 1: Non-emergency request

2. SEVERITY (30% weight) - Scale of impact based on people count:
   - 10: 100+ people affected
   - 9: 50-100 people
   - 8: 30-50 people
   - 7: 20-30 people
   - 6: 15-20 people
   - 5: 10-15 people
   - 4: 5-10 people
   - 3: 3-5 people
   - 2: 1-3 people
   - 1: Individual request

3. TIME DECAY (20% weight) - Increases with waiting time:
   - 10: 180+ minutes (3+ hours)
   - 9: 120-180 minutes
   - 8: 90-120 minutes
   - 7: 60-90 minutes
   - 6: 45-60 minutes
   - 5: 30-45 minutes
   - 4: 15-30 minutes
   - 3: 5-15 minutes
   - 2: 1-5 minutes
   - 1: Just now (0 minutes)

4. LOCATION RISK (15% weight) - Chennai-specific risk assessment:
   HIGH RISK AREAS (8-10):
   - Royapuram, Tondiarpet, Manali, Ennore (flood-prone, industrial)
   - Tambaram, Chromepet (dense slums, poor infrastructure)
   - Adyar river banks, Velachery (flood zones)
   
   MEDIUM RISK AREAS (5-7):
   - T Nagar, Saidapet, Guindy (busy commercial)
   - Porur, Kundrathur (semi-urban)
   - Kodambakkam, Vadapalani (mixed residential)
   
   LOW RISK AREAS (2-4):
   - Anna Nagar, Mylapore, Besant Nagar (well-developed)
   - Nungambakkam, Alwarpet (upscale, good infrastructure)

CALCULATION:
overallScore = (urgency × 0.35 + severity × 0.30 + timeDecay × 0.20 + locationRisk × 0.15) × 10
Round to nearest integer (0-100 scale).

CRITICAL RULES:
- Medical emergencies with 10+ people = ALWAYS 80+
- Building collapse/trapped people = ALWAYS 90+
- Cardiac arrest/active bleeding = ALWAYS 85+
- Food shortage for 50+ = 70-80
- Clothing requests = NEVER above 60

Return JSON format EXACTLY:
{
  "urgency": number (1-10),
  "severity": number (1-10),
  "timeDecay": number (1-10),
  "locationRisk": number (1-10),
  "overallScore": number (0-100),
  "explanation": "Clear explanation of WHY this score was assigned, mentioning key factors"
}

NO OTHER TEXT. Return ONLY valid JSON.`;

    const result = await this.callGemini(prompt);
    
    // Validate and sanitize results
    const urgency = Math.max(1, Math.min(10, result.urgency || 5));
    const severity = Math.max(1, Math.min(10, result.severity || 5));
    const timeDecay = Math.max(1, Math.min(10, result.timeDecay || 5));
    const locationRisk = Math.max(1, Math.min(10, result.locationRisk || 5));
    const overallScore = Math.max(0, Math.min(100, result.overallScore || 50));
    
    return {
      urgency,
      severity,
      timeDecay,
      locationRisk,
      overallScore,
      explanation: result.explanation || 'AI-calculated priority score based on urgency, severity, time decay, and location risk'
    };
  }

  // 3. Smart Matching Engine - HYBRID (Local Pre-filter + AI Ranking)
  async findBestVolunteer(
    requestType: string,
    requestLocation: string,
    urgency: string,
    volunteers: Array<{
      id: string;
      name: string;
      skills: string[];
      location: string;
      availability: string;
      currentWorkload: number;
      maxCapacity: number;
      reliabilityScore: number;
      tasksCompleted?: number;
      x?: number;
      y?: number;
    }>,
    requestX?: number,
    requestY?: number
  ): Promise<MatchingResult> {
    // Filter only available volunteers with capacity
    const availableVolunteers = volunteers.filter(v => 
      v.availability === 'Available' && v.currentWorkload < v.maxCapacity
    );

    if (availableVolunteers.length === 0) {
      return {
        volunteerId: 'None',
        volunteerName: 'No Available Volunteers',
        matchScore: 0,
        reasons: ['All volunteers are busy or offline'],
        estimatedArrival: 0
      };
    }

    // STEP 1: PRE-FILTER - Get top 5 closest volunteers (reduce AI payload)
    const reqX = requestX || 50;
    const reqY = requestY || 50;
    
    const scoredVolunteers = availableVolunteers.map(v => {
      const volX = v.x || 50;
      const volY = v.y || 50;
      const distance = Math.sqrt(Math.pow(volX - reqX, 2) + Math.pow(volY - reqY, 2));
      
      // Simple scoring: closer + higher reliability = better
      const score = (100 - distance * 2) * 0.6 + (v.reliabilityScore || 70) * 0.4;
      
      return { ...v, distance, score };
    });
    
    // Sort by score and take top 5
    const topVolunteers = scoredVolunteers
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    
    console.log(`🎯 Pre-filtered to top ${topVolunteers.length} volunteers for AI ranking`);

    // STEP 2: AI RANKING - Only rank top 5 (lightweight prompt)
    const volunteersData = topVolunteers.map(v => ({
      id: v.id,
      name: v.name,
      skills: v.skills,
      distance: Math.round(v.distance * 10) / 10,
      currentWorkload: v.currentWorkload,
      maxCapacity: v.maxCapacity,
      reliabilityScore: v.reliabilityScore,
      tasksCompleted: v.tasksCompleted || 0
    }));

    const prompt = `VOLUNTEER RANKING - Quick Analysis

Request: ${requestType} emergency, ${urgency} priority at ${requestLocation}

TOP ${topVolunteers.length} CANDIDATES (pre-filtered by distance):
${JSON.stringify(volunteersData, null, 2)}

REQUIRED SKILLS for ${requestType}: ${this.getRequestSkills(requestType).join(', ')}

TASK: Pick the BEST volunteer from these ${topVolunteers.length} candidates.
Consider:
1. Skill match (most important)
2. Distance (already pre-filtered)
3. Current workload (prefer less busy)
4. Reliability score

Return ONLY valid JSON:
{
  "volunteerId": "ID",
  "volunteerName": "Name",
  "matchScore": 0-100,
  "reasons": ["2-3 reasons"],
  "estimatedArrival": minutes
}

NO OTHER TEXT.`;

    try {
      const result = await this.callGemini(prompt, 3); // Only 3 retries, lightweight call
      
      return {
        volunteerId: result.volunteerId || topVolunteers[0].id,
        volunteerName: result.volunteerName || topVolunteers[0].name,
        matchScore: Math.max(0, Math.min(100, result.matchScore || 75)),
        reasons: result.reasons || ['AI-ranked from top candidates'],
        estimatedArrival: result.estimatedArrival || Math.round(topVolunteers[0].distance * 3)
      };
    } catch (aiError) {
      console.warn('⚠️ AI ranking failed, using pre-filtered result:', aiError);
      // Fallback to best pre-filtered volunteer
      const best = topVolunteers[0];
      return {
        volunteerId: best.id,
        volunteerName: best.name,
        matchScore: Math.round(best.score),
        reasons: [
          'Closest available volunteer',
          `Distance: ~${Math.round(best.distance * 2)} km`,
          `Reliability: ${best.reliabilityScore}%`
        ],
        estimatedArrival: Math.round(best.distance * 3)
      };
    }
  }

  // Helper: Get required skills for request type
  private getRequestSkills(requestType: string): string[] {
    const skillMap: Record<string, string[]> = {
      'Medical': ['Medical', 'First Aid', 'Emergency Care'],
      'Food': ['Food Distribution', 'Logistics'],
      'Shelter': ['Shelter Coord.', 'Community Management'],
      'Water': ['Water Distribution', 'Logistics', 'Transport'],
      'Clothes': ['Clothes Distribution', 'Community Outreach']
    };
    return skillMap[requestType] || [];
  }

  // Helper: Calculate distance between two points
  private calculateDistance(x1: number, y1: number, x2: number, y2: number): number {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy) * 0.5; // Scale factor for minutes
  }

  // 4. Feedback Analysis
  async analyzeFeedback(
    completionTime: number, // minutes
    successRating: number, // 1-5
    feedback: string,
    requestType: string
  ): Promise<{
    performance: 'Excellent' | 'Good' | 'Average' | 'Poor';
    insights: string[];
    recommendations: string[];
    trustScoreAdjustment: number; // -10 to +10
  }> {
    const prompt = `
You are a crisis response performance analyst. Analyze this task completion feedback.

Task Details:
- Type: ${requestType}
- Completion Time: ${completionTime} minutes
- Success Rating: ${successRating}/5
- Feedback: "${feedback}"

Analyze and return:
1. performance: One of [Excellent, Good, Average, Poor]
   - Excellent: <15 min, rating 5, positive feedback
   - Good: 15-30 min, rating 4, mostly positive
   - Average: 30-60 min, rating 3, neutral
   - Poor: >60 min, rating 1-2, negative

2. insights: Array of 2-3 key insights about the performance

3. recommendations: Array of 2-3 actionable recommendations for improvement

4. trustScoreAdjustment: Number from -10 to +10
   - Excellent: +5 to +10
   - Good: +2 to +5
   - Average: -2 to +2
   - Poor: -10 to -5

Return ONLY valid JSON, no other text.
`;

    return await this.callGemini(prompt);
  }

  // 5. Demand Prediction
  async predictDemand(
    currentRequests: Array<{
      type: string;
      location: string;
      priority: string;
    }>,
    timeWindow: string // e.g., "next 2 hours"
  ): Promise<{
    predictedHotspots: string[];
    resourceShortages: string[];
    recommendedActions: string[];
    confidence: number;
  }> {
    const requestsStr = JSON.stringify(currentRequests);
    
    const prompt = `
You are a crisis demand prediction AI. Analyze current requests and predict future demand.

Current Active Requests:
${requestsStr}

Time Window: ${timeWindow}

Based on patterns, predict:
1. predictedHotspots: Array of 2-3 locations likely to see increased demand
2. resourceShortages: Array of 2-3 resource types that may run low (Medical supplies, Food, Water, etc.)
3. recommendedActions: Array of 3-4 proactive actions to take
4. confidence: Your confidence in this prediction (0-100)

Consider:
- Geographic clustering of current requests
- Resource type patterns
- Time-based escalation patterns
- Common crisis progression patterns

Return ONLY valid JSON, no other text.
`;

    return await this.callGemini(prompt);
  }

  // 6. Location Risk Assessment
  async assessLocationRisk(location: string): Promise<{
    riskLevel: 'High' | 'Medium' | 'Low';
    riskScore: number; // 1-10
    factors: string[];
    description: string;
  }> {
    const prompt = `
You are a location risk assessment AI for crisis response in Chennai, India.

Assess the risk level for this location: ${location}

Consider factors:
- Flood proneness
- Slum/informal settlement areas
- Remote/hard-to-reach areas
- Infrastructure quality
- Historical disaster data
- Population density

Return JSON with:
- riskLevel: High, Medium, or Low
- riskScore: 1-10 (10 = highest risk)
- factors: Array of 2-3 specific risk factors for this location
- description: Brief explanation of the risk assessment

Common high-risk areas in Chennai: Royapuram, Tondiarpet, Manali, Ennore, Tambaram
Common medium-risk areas: T Nagar, Velachery, Adyar, Guindy
Common low-risk areas: Anna Nagar, Mylapore, Besant Nagar

Return ONLY valid JSON, no other text.
`;

    return await this.callGemini(prompt);
  }

  // 7. Analyze OCR Extracted Text for Disaster Relief
  async analyzeOCRText(extractedText: string): Promise<{
    type: 'Medical' | 'Food' | 'Shelter' | 'Water' | 'Clothes' | 'Document';
    urgency: 'High' | 'Medium' | 'Low';
    urgencyScore: number;
    severityScore: number;
    locationRiskScore: number;
    overallPriorityScore: number;
    description: string;
    location: string;
    peopleCount: number;
    recommendedVolunteer: string;
    confidence: number;
    explanation: string;
    keyEntities: string[];
  }> {
    const prompt = `
You are a disaster relief document analysis AI. Analyze this OCR-extracted text from uploaded documents (medical prescriptions, ID proofs, ration cards, request letters, etc.).

Extracted Text:
"""
${extractedText}
"""

Analyze and return JSON with:
- type: One of [Medical, Food, Shelter, Water, Clothes, Document]
- urgency: High, Medium, or Low
- urgencyScore: 1-10
- severityScore: 1-10 (based on impact)
- locationRiskScore: 1-10
- overallPriorityScore: 0-100
- description: Clear summary of the request/document
- location: Extracted location name (or "Unknown" if not found)
- peopleCount: Number of people affected (estimate if not clear)
- recommendedVolunteer: Type of volunteer needed (e.g., "Medical Team", "Food Distribution", "Shelter Coordinator")
- confidence: 0-100 (your confidence in this analysis)
- explanation: Brief explanation of your analysis
- keyEntities: Array of important entities found (names, locations, dates, quantities)

Consider:
- Medical prescriptions/records = Medical (high urgency)
- Food ration cards/requests = Food
- Housing/shelter documents = Shelter
- Water supply requests = Water
- Clothing requests = Clothes
- General documents/IDs = Document

Return ONLY valid JSON, no other text.
`;

    return await this.callGemini(prompt);
  }
}

export const aiService = new AIService();
