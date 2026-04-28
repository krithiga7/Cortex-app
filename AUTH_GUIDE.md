# 🔐 Authentication System - Login Credentials

## Overview

The application now has a **complete dual-role authentication system** with separate dashboards for Admin and Volunteer users.

---

## 👥 User Accounts

### **ADMIN Account**
**Username:** `admin`  
**Password:** `admin123`  
**Role:** System Administrator

**Access Level:**
- ✅ Full system access
- ✅ View all requests globally
- ✅ Edit and manage requests
- ✅ Override AI priority decisions
- ✅ Approve/reject requests
- ✅ Manage all volunteers
- ✅ View complete analytics
- ✅ Configure system settings
- ✅ Pause/resume auto-allocation
- ✅ Override volunteer assignments

---

### **VOLUNTEER Accounts**

#### Volunteer 1
**Username:** `arjun`  
**Password:** `volunteer123`  
**Role:** Volunteer  
**Volunteer ID:** V101  
**Name:** Arjun Krishnan

#### Volunteer 2
**Username:** `meena`  
**Password:** `volunteer123`  
**Role:** Volunteer  
**Volunteer ID:** V102  
**Name:** Meena Sundaram

#### Volunteer 3
**Username:** `rahul`  
**Password:** `volunteer123`  
**Role:** Volunteer  
**Volunteer ID:** V103  
**Name:** Rahul Verma

**Volunteer Access Level:**
- ✅ View assigned tasks only
- ✅ Update task status (Accept/Start/Complete)
- ✅ Report issues
- ✅ View personal performance metrics
- ✅ Toggle availability (Available/Busy)
- ✅ Receive smart suggestions
- ❌ Cannot see all requests
- ❌ Cannot assign tasks to others
- ❌ Cannot modify system decisions
- ❌ Cannot access admin features

---

## 🎯 Role-Based Features

### **ADMIN DASHBOARD Features**

#### 1. Global Dashboard Access
- View all incoming requests
- Priority levels overview
- Crisis heatmaps
- System auto-decisions
- Real-time metrics

#### 2. Request Management
- View all requests (global)
- Edit request details
- Manually change priority (override AI)
- Approve/reject requests
- Assign requests manually

#### 3. Decision Control ⭐ (Human-in-the-Loop AI)
- See AI auto-assignments
- Override volunteer assignments
- Reassign to different volunteer
- **Pause auto-allocation system**
- Review decision logs

#### 4. Volunteer Management
- Add/remove volunteers
- Update volunteer skills
- Change availability status
- View performance metrics:
  - Trust score
  - Completion rate
  - Response time
  - Task history

#### 5. Analytics & Insights
- Demand trends
- High-risk zone identification
- Volunteer efficiency reports
- Resource allocation analytics
- System performance metrics

#### 6. System Configuration
- Set priority thresholds
- Configure alert rules
- Manage notification settings
- Adjust AI scoring weights

---

### **VOLUNTEER DASHBOARD Features**

#### 1. Personal Dashboard
- View assigned tasks only
- Task priority levels
- Location details
- ETA information
- Task instructions

#### 2. Task Execution
Each task shows:
- Type (Food/Medical/Shelter/Water/Clothes)
- People count affected
- Full address
- Detailed instructions
- Required resources

#### 3. Status Updates
Interactive buttons:
- **Accept Task** - Acknowledge assignment
- **Start Task** - Begin execution
- **Complete Task** - Mark as done
- **Report Issue** - Flag problems

#### 4. Smart Suggestions
AI-powered recommendations:
- "You are near a high-priority case"
- "New task recommended based on your skills"
- "Update availability status"

#### 5. Performance View
Personal metrics:
- Tasks completed
- Average response time
- Trust score
- Completion rate

#### 6. Availability Toggle
- Available (ready for tasks)
- Busy (currently occupied)
- Offline (not taking tasks)

---

## 🔒 Security Features

### Route Protection
- `/login` - Public (no auth required)
- `/` - Protected (any authenticated user)
- `/requests` - Protected (Admin only)
- `/volunteers` - Protected (Admin only)
- `/analytics` - Protected (Admin only)
- `/settings` - Protected (Admin only)
- `/assignments` - Protected (Both roles)

### Access Control
- Unauthenticated users → Redirected to `/login`
- Volunteers accessing admin routes → Redirected to `/`
- Admin-only features hidden from volunteers
- Role-based UI rendering

---

## 🚀 How to Test

### Test Admin Features:
1. Login with `admin / admin123`
2. Access all tabs: Overview, Priority Engine, Volunteer Graph, Data Collection
3. Navigate to Requests, Volunteers, Analytics, Settings pages
4. View global heatmap and all requests
5. See auto-decisions panel

### Test Volunteer Features:
1. Login with `arjun / volunteer123`
2. See volunteer-specific dashboard
3. View only assigned tasks
4. Click "Start Task" and "Complete Task" buttons
5. See personal metrics and smart suggestions
6. Try accessing `/requests` or `/volunteers` (should redirect)

### Test Role Separation:
1. Login as volunteer
2. Try to access admin-only routes
3. Verify redirect to dashboard
4. Logout
5. Login as admin
6. Verify full access restored

---

## 🎨 UI/UX Features

### Login Page
- Clean, professional design
- Username & password fields with icons
- Error messaging for invalid credentials
- Demo credentials displayed for testing
- Loading state during authentication

### TopBar (Both Roles)
- Shows logged-in user name
- Displays user role badge
- Logout button with hover effect
- Real-time clock
- Smart allocation status
- Notification bell

### Dashboard Differences
- **Admin**: Full system view, all tabs, global metrics
- **Volunteer**: Personal view, task cards, action buttons

---

## 💡 Human-in-the-Loop AI Demo

This is a **key feature for judges/presentations**:

1. **Show AI Auto-Assignment**
   - Navigate to Auto Decisions panel
   - Show how AI assigns volunteers automatically

2. **Demonstrate Override**
   - Admin can override AI decisions
   - Reassign to different volunteer
   - Pause auto-allocation

3. **Explain the Value**
   - AI makes recommendations
   - Human maintains control
   - Best of both worlds

---

## 📊 System Architecture

```
Login Page
    ↓
Authentication Check
    ↓
Role Verification
    ↓
┌─────────────────┬──────────────────┐
│   ADMIN         │   VOLUNTEER      │
│                 │                  │
│ - Global View   │ - Personal View  │
│ - All Requests  │ - Assigned Tasks │
│ - Full Control  │ - Execute Tasks  │
│ - Analytics     │ - Update Status  │
│ - Settings      │ - Performance    │
└─────────────────┴──────────────────┘
```

---

## 🔧 Technical Implementation

- **Authentication Store**: `src/store/auth.ts`
- **Login Page**: `src/pages/Login.tsx`
- **Admin Dashboard**: `src/pages/Dashboard.tsx` (role check)
- **Volunteer Dashboard**: `src/pages/VolunteerDashboard.tsx`
- **Protected Routes**: `src/App.tsx` (ProtectedRoute component)
- **TopBar**: Updated with user info & logout

---

## ✅ Checklist

- ✅ Login page with username/password
- ✅ Admin role with full access
- ✅ Volunteer role with limited access
- ✅ Role-based route protection
- ✅ Separate dashboards per role
- ✅ User info display in TopBar
- ✅ Logout functionality
- ✅ Demo credentials visible
- ✅ Error handling for invalid login
- ✅ Human-in-the-loop AI controls
- ✅ Task execution workflow for volunteers
- ✅ Performance tracking
- ✅ Smart suggestions

---

**🎯 Ready for Demo!**

The authentication system is fully functional and demonstrates:
- Secure login with role separation
- Human-in-the-loop AI (judges love this!)
- Clear volunteer execution plane
- Complete admin control plane
- Professional UI/UX
