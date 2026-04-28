# Supabase Configuration

## Environment Variables

Add these to your `.env` file:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://gdqsnkmhoyutyaynkyav.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_YjpPvL5McrPk0Dvn4S2KLQ_SJsjkdgg
```

## Database Setup

Run this SQL in Supabase SQL Editor:

```sql
-- Create volunteers table
CREATE TABLE volunteers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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

-- Create requests table
CREATE TABLE requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  urgency TEXT NOT NULL,
  location TEXT NOT NULL,
  summary TEXT NOT NULL,
  people_affected INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  priority_score INTEGER DEFAULT 50,
  source TEXT DEFAULT 'form',
  description TEXT,
  x NUMERIC DEFAULT 50,
  y NUMERIC DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable real-time
ALTER PUBLICATION supabase_realtime ADD TABLE volunteers;
ALTER PUBLICATION supabase_realtime ADD TABLE requests;
```

## Features

✅ Volunteer registration saves to Supabase
✅ Real-time data sync
✅ File storage ready
✅ No billing required - 100% FREE
✅ PostgreSQL database
✅ Unlimited API requests

## Free Tier Limits

- 500 MB database
- 1 GB file storage
- 50,000 monthly active users
- Unlimited API requests

Your usage will be well within free tier!
