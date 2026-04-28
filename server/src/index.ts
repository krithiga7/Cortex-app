import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || true, // Allow all origins in production
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ==========================================
// AUTHENTICATION MIDDLEWARE
// ==========================================

interface AuthRequest extends Request {
  user?: any;
}

const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// ==========================================
// AUTHENTICATION API
// ==========================================

// Register new user
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name, role } = req.body;

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        email,
        password: hashedPassword,
        name,
        role: role || 'volunteer'
      })
      .select()
      .single();

    if (error) throw error;

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    console.log('Login attempt:', { email, passwordLength: password?.length });

    // Find user
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      console.log('User not found:', error?.message || 'No user');
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    console.log('User found:', { id: user.id, email: user.email, role: user.role, hasPassword: !!user.password });

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    console.log('Password valid:', validPassword);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );
    
    console.log('Login successful, token generated');

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get current user profile
app.get('/api/auth/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    });
  } catch (error: any) {
    console.error('Get user error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// HEALTH CHECK
// ==========================================
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ==========================================
// REQUESTS API
// ==========================================

// Get all requests
app.get('/api/requests', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new request
app.post('/api/requests', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('requests')
      .insert(req.body)
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error: any) {
    console.error('Error creating request:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update request
app.patch('/api/requests/:id', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('requests')
      .update(req.body)
      .eq('request_id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('Error updating request:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// VOLUNTEERS API
// ==========================================

// Get all volunteers
app.get('/api/volunteers', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('volunteers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('Error fetching volunteers:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create volunteer
app.post('/api/volunteers', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('volunteers')
      .insert(req.body)
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error: any) {
    console.error('Error creating volunteer:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update volunteer
app.patch('/api/volunteers/:id', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('volunteers')
      .update(req.body)
      .eq('volunteer_id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('Error updating volunteer:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// ASSIGNMENTS API
// ==========================================

// Get all assignments
app.get('/api/assignments', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create assignment
app.post('/api/assignments', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('assignments')
      .insert(req.body)
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error: any) {
    console.error('Error creating assignment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update assignment
app.patch('/api/assignments/:id', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('assignments')
      .update(req.body)
      .eq('assignment_id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('Error updating assignment:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// AI MATCHING ENGINE (Gemini API)
// ==========================================

app.post('/api/ai/match', async (req: Request, res: Response) => {
  try {
    const { requestType, requestLocation, urgency, volunteers, requestX, requestY } = req.body;

    // Prepare prompt for Gemini
    const prompt = `
You are an INTELLIGENT VOLUNTEER MATCHING ENGINE for crisis response in Chennai, India.

Match the BEST volunteer to this emergency request using AI optimization.

REQUEST DETAILS:
- Type: ${requestType}
- Location: ${requestLocation}
- Urgency: ${urgency}
- Request Coordinates: (${requestX}, ${requestY})

AVAILABLE VOLUNTEERS:
${JSON.stringify(volunteers, null, 2)}

MATCHING CRITERIA (in order of importance):

1. SKILL MATCH (40% weight)
2. PROXIMITY (30% weight)
3. WORKLOAD BALANCE (15% weight)
4. RELIABILITY (10% weight)
5. EXPERIENCE (5% weight)

Return JSON EXACTLY:
{
  "volunteerId": "ID of best matched volunteer",
  "volunteerName": "Name of volunteer",
  "matchScore": number (0-100),
  "reasons": ["Array of 2-3 specific reasons"],
  "estimatedArrival": number (in minutes)
}

NO OTHER TEXT. Return ONLY valid JSON.`;

    // Call Gemini AI - Using gemini-2.5-flash (proven working)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid AI response format');
    }

    const matchResult = JSON.parse(jsonMatch[0]);
    res.json(matchResult);
  } catch (error: any) {
    console.error('AI Matching error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// ERROR HANDLING
// ==========================================

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════╗
║  🚀 Crisis Response Backend Server          ║
║  📡 Running on: http://localhost:${PORT}       ║
║  🌍 Environment: ${process.env.NODE_ENV || 'development'}              ║
║  🔗 API Docs: http://localhost:${PORT}/api/health║
╚══════════════════════════════════════════════╝
  `);
});

export default app;
