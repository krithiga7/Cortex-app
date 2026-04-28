# 🤖 AI-Powered Features Implementation Guide

## Overview

This document describes the complete AI-powered crisis response engine implementation using **Gemini AI**.

---

## 🔑 Gemini API Configuration

**API Key:** Configured in `src/services/ai.ts`  
**Model:** Gemini 2.0 Flash  
**Base URL:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`

---

## 📋 Implemented AI Features

### **1. Multi-Source Data Ingestion Layer**

**Location:** `src/pages/DataIngestion.tsx`  
**Route:** `/data-ingestion`

#### Capabilities:

**a) Online Forms** → Structured Input
- User fills standardized form
- AI validates and calculates priority score
- Creates standardized Need Event

**b) WhatsApp Messages** → API Ingestion
- Paste raw WhatsApp message
- AI extracts: type, location, people count, urgency
- Converts to structured format

**c) Voice Notes** → Speech-to-Text
- Voice transcript input
- AI understands context and extracts data
- Maps to crisis response categories

**d) OCR/Handwritten** → Digital Text
- Scanned handwritten text
- AI interprets and structures data
- Confidence scoring included

#### AI Service Method:
```typescript
aiService.ingestFromSource(source, rawInput)
```

**Returns:**
```typescript
{
  type: 'Medical' | 'Food' | 'Shelter' | 'Water' | 'Clothes',
  description: string,
  location: string,
  peopleCount: number,
  urgency: 'High' | 'Medium' | 'Low',
  confidence: number // 0-100
}
```

---

### **2. Need Intelligence Engine** 🔥 CORE DIFFERENTIATOR

**Location:** `src/services/ai.ts` - `calculatePriorityScore()`

#### Dynamic Priority Score Calculation

AI computes scores based on 4 weighted factors:

| Factor | Weight | Description |
|--------|--------|-------------|
| **Urgency** | 35% | Medical emergencies > Food > General |
| **Severity** | 30% | Number of people affected |
| **Time Decay** | 20% | Older requests increase priority |
| **Location Risk** | 15% | Flood zones, slums, remote areas |

#### Formula:
```
Priority Score = (Urgency × 0.35) + (Severity × 0.30) + (TimeDecay × 0.20) + (LocationRisk × 0.15)
```

#### AI Service Method:
```typescript
aiService.calculatePriorityScore(
  requestType,
  description,
  peopleCount,
  location,
  timeSinceCreated
)
```

**Returns:**
```typescript
{
  urgency: number,        // 1-10
  severity: number,       // 1-10
  timeDecay: number,      // 1-10
  locationRisk: number,   // 1-10
  overallScore: number,   // 0-100
  explanation: string     // AI explanation
}
```

#### Example AI Prompt Logic:

**Urgency Scoring:**
- Medical emergencies = 9-10
- Food/Water shortages = 6-8
- Shelter/Clothing = 3-5

**Severity Scoring:**
- 50+ people = 9-10
- 20-50 people = 7-8
- 10-20 people = 5-6
- <10 people = 3-4

**Time Decay:**
- 0-30 min = 3-4
- 30-60 min = 5-6
- 60-120 min = 7-8
- 120+ min = 9-10

**Location Risk:**
- Flood zones/slums = 8-10
- Urban areas = 5-7
- Safe areas = 2-4

---

### **3. Volunteer Graph Engine**

**Implementation:** Volunteer nodes with attributes

Each volunteer is modeled as a graph node with:
```typescript
{
  id: string,
  name: string,
  skills: string[],           // Multi-skill support
  location: string,
  availability: 'Available' | 'Busy' | 'Offline',
  currentWorkload: number,
  maxCapacity: number,
  reliabilityScore: number    // 0-100
}
```

#### Graph Properties:
- **Nodes:** Volunteers
- **Edges:** Skill matches, location proximity, availability
- **Weights:** Reliability scores, workload capacity

---

### **4. Smart Matching Engine** (Optimization Layer)

**Location:** `src/pages/MatchingEngine.tsx`  
**Route:** `/matching-engine`

#### AI-Powered Matching Algorithm

**NOT random assignment.** Uses multi-factor optimization:

| Criterion | Weight | Description |
|-----------|--------|-------------|
| **Skill Match** | 40% | Does volunteer have relevant skills? |
| **Proximity** | 25% | Is volunteer nearby? |
| **Availability** | 20% | Is volunteer available now? |
| **Workload** | 10% | Does volunteer have capacity? |
| **Reliability** | 5% | Historical performance |

#### AI Service Method:
```typescript
aiService.findBestVolunteer(
  requestType,
  requestLocation,
  urgency,
  volunteers[]
)
```

**Returns:**
```typescript
{
  volunteerId: string,
  volunteerName: string,
  matchScore: number,        // 0-100
  reasons: string[],         // AI explanation
  estimatedArrival: number   // minutes
}
```

#### Features:
- ✅ Real-time AI matching
- ✅ Detailed reasoning for each match
- ✅ Estimated arrival time
- ✅ One-click assignment
- ✅ Re-match capability

---

### **5. Execution + Feedback Loop**

**Location:** `src/services/ai.ts` - `analyzeFeedback()`

#### Task Execution Tracking

**Status Flow:**
```
Pending → Dispatched → In Progress → Completed
```

#### Feedback Analysis

AI analyzes completed tasks:

```typescript
aiService.analyzeFeedback(
  completionTime,    // minutes
  successRating,     // 1-5
  feedback,          // text
  requestType
)
```

**Returns:**
```typescript
{
  performance: 'Excellent' | 'Good' | 'Average' | 'Poor',
  insights: string[],
  recommendations: string[],
  trustScoreAdjustment: number  // -10 to +10
}
```

#### Performance Criteria:
- **Excellent:** <15 min, rating 5, positive feedback → +5 to +10 trust
- **Good:** 15-30 min, rating 4 → +2 to +5 trust
- **Average:** 30-60 min, rating 3 → -2 to +2 trust
- **Poor:** >60 min, rating 1-2 → -10 to -5 trust

---

### **6. Demand Prediction** 🔮

**AI Service Method:**
```typescript
aiService.predictDemand(currentRequests[], timeWindow)
```

**Returns:**
```typescript
{
  predictedHotspots: string[],
  resourceShortages: string[],
  recommendedActions: string[],
  confidence: number  // 0-100
}
```

#### Predictive Analytics:
- Geographic clustering analysis
- Resource type patterns
- Time-based escalation
- Crisis progression patterns

---

### **7. Location Risk Assessment** 📍

**AI Service Method:**
```typescript
aiService.assessLocationRisk(location)
```

**Returns:**
```typescript
{
  riskLevel: 'High' | 'Medium' | 'Low',
  riskScore: number,     // 1-10
  factors: string[],
  description: string
}
```

#### Risk Factors Considered:
- Flood proneness
- Slum/informal settlements
- Remote/hard-to-reach areas
- Infrastructure quality
- Historical disaster data
- Population density

---

## 🎯 How to Use

### **For Judges/Demo:**

#### 1. Show Data Ingestion (2 min)
1. Login as admin
2. Navigate to **Data Ingestion** page
3. Show all 4 input methods:
   - Fill out form
   - Paste WhatsApp message
   - Show voice transcript example
   - Show OCR text example
4. Highlight AI extraction and confidence scores

#### 2. Demonstrate Priority Engine (2 min)
1. Show how AI calculates priority scores
2. Explain the 4 weighted factors
3. Show AI explanations for scoring
4. Highlight dynamic nature (time decay)

#### 3. Show Smart Matching (3 min) ⭐
1. Navigate to **Matching Engine** page
2. Select a pending request
3. Watch AI find best volunteer
4. Show detailed reasoning
5. Click "Assign Volunteer"
6. Emphasize: **NOT random, AI-optimized**

#### 4. Explain Feedback Loop (1 min)
1. Show task completion
2. AI analyzes performance
3. Updates trust scores
4. Improves future matching

---

## 🔧 Technical Architecture

```
┌─────────────────────────────────────────┐
│         Multi-Source Input              │
│  Forms | WhatsApp | Voice | OCR         │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      AI Ingestion Service               │
│   (Gemini API - Data Extraction)        │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│    Need Intelligence Engine             │
│  (Dynamic Priority Scoring AI)          │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      Volunteer Graph Engine             │
│   (Skills + Location + Availability)    │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│     Smart Matching Engine               │
│   (AI Optimization Algorithm)           │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│     Execution & Feedback                │
│   (Performance Analysis AI)             │
└─────────────────────────────────────────┘
```

---

## 📊 Key Differentiators for Judges

### **1. AI-Powered, Not Rule-Based**
- Uses Gemini AI for intelligent decisions
- Learns and adapts
- Handles edge cases

### **2. Human-in-the-Loop**
- AI recommends, humans decide
- Override capabilities
- Transparent reasoning

### **3. Multi-Source Ingestion**
- Real-world messy data handling
- OCR, Voice, WhatsApp support
- Standardization layer

### **4. Dynamic Scoring**
- Not static priorities
- Time-based escalation
- Context-aware

### **5. Optimization, Not Random**
- Multi-factor matching
- Weighted algorithm
- Explainable AI

### **6. Continuous Learning**
- Feedback analysis
- Trust score updates
- Performance improvement

---

## 🚀 API Endpoints Used

### Gemini AI API
- **Base URL:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`
- **Method:** POST
- **Auth:** API Key in query parameter
- **Model:** Gemini 2.0 Flash

### Request Format:
```json
{
  "contents": [{
    "parts": [{
      "text": "Your prompt here"
    }]
  }],
  "generationConfig": {
    "temperature": 0.7,
    "maxOutputTokens": 1024
  }
}
```

---

## ✅ Feature Checklist

- ✅ Multi-source data ingestion (Forms, WhatsApp, Voice, OCR)
- ✅ AI-powered priority scoring with 4 factors
- ✅ Dynamic time decay mechanism
- ✅ Location risk assessment
- ✅ Volunteer graph with attributes
- ✅ Smart matching with optimization
- ✅ Explainable AI (reasons provided)
- ✅ One-click assignment
- ✅ Feedback analysis
- ✅ Trust score updates
- ✅ Demand prediction
- ✅ Performance tracking
- ✅ Real-time processing
- ✅ Human-in-the-loop controls

---

## 💡 Demo Script Highlights

**Opening:**
> "We're not building another form submission platform. We're building an AI-powered crisis response engine."

**Data Ingestion:**
> "Real-world crises don't send structured data. They come as messy WhatsApp messages, voice notes, handwritten papers. Our AI handles it all."

**Priority Engine:**
> "This is our core differentiator. Not manual triage, but AI-powered dynamic scoring that considers urgency, severity, time decay, and location risk."

**Matching Engine:**
> "We don't randomly assign volunteers. Our AI optimizes based on skills, proximity, availability, workload, and reliability."

**Closing:**
> "From messy input to intelligent action - all powered by AI, controlled by humans."

---

**Built with ❤️ using Gemini AI for humanitarian impact**
