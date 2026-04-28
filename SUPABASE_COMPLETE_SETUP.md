# Supabase Setup Guide - Complete App Migration

## Step 1: Run SQL in Supabase SQL Editor

Go to: https://supabase.com/dashboard/project/gdqsnkmhoyutyaynkyav/sql/new

Copy and run this complete SQL:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- VOLUNTEERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS volunteers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  volunteer_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  skills TEXT[] DEFAULT '{}',
  location TEXT NOT NULL,
  availability TEXT DEFAULT 'Available',
  rating NUMERIC DEFAULT 0,
  completed_tasks INTEGER DEFAULT 0,
  current_load INTEGER DEFAULT 0,
  max_capacity INTEGER DEFAULT 5,
  x NUMERIC DEFAULT 50,
  y NUMERIC DEFAULT 50,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- REQUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  request_id TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,  -- Medical, Food, Shelter, Clothes, Water
  people INTEGER NOT NULL,
  location TEXT NOT NULL,
  priority TEXT NOT NULL,  -- High, Medium, Low
  score NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'Pending',  -- Pending, Assigned, In Progress, Resolved
  description TEXT,
  source TEXT DEFAULT 'Form',  -- Form, WhatsApp, Voice, OCR, Manual
  urgency INTEGER DEFAULT 5,  -- 1-10
  severity INTEGER DEFAULT 5,  -- 1-10
  location_risk INTEGER DEFAULT 5,  -- 1-10
  suggested_volunteer TEXT,
  x NUMERIC DEFAULT 50,
  y NUMERIC DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ASSIGNMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS assignments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  assignment_id TEXT UNIQUE NOT NULL,
  request_id TEXT NOT NULL REFERENCES requests(request_id),
  volunteer_id TEXT NOT NULL REFERENCES volunteers(volunteer_id),
  eta INTEGER DEFAULT 0,
  status TEXT DEFAULT 'Pending',  -- Pending, Accepted, Rejected, Dispatched, In Progress, Completed
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  proof_submitted BOOLEAN DEFAULT FALSE,
  proof_url TEXT,
  feedback TEXT,
  verification_status TEXT DEFAULT 'Pending',  -- Pending, Verified, Failed
  match_score NUMERIC DEFAULT 0,
  rating NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ENABLE REAL-TIME FOR ALL TABLES
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE volunteers;
ALTER PUBLICATION supabase_realtime ADD TABLE requests;
ALTER PUBLICATION supabase_realtime ADD TABLE assignments;

-- ============================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_volunteers_availability ON volunteers(availability);
CREATE INDEX idx_volunteers_location ON volunteers(location);
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_priority ON requests(priority);
CREATE INDEX idx_assignments_status ON assignments(status);
CREATE INDEX idx_assignments_volunteer ON assignments(volunteer_id);
CREATE INDEX idx_assignments_request ON assignments(request_id);
```

## Step 2: Restart Dev Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

## Step 3: Test All Features

✅ **Volunteer Registration** - Save to Supabase  
✅ **Volunteer Dashboard** - Load from Supabase  
✅ **Requests Page** - Load/save from Supabase  
✅ **Assignments Page** - Load/save from Supabase  
✅ **Admin Dashboard** - Real-time sync from Supabase  
✅ **Volunteers Page** - Real-time sync from Supabase  

All data now persists in Supabase - no more local storage!
