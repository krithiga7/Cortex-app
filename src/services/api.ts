// API Service - Connects frontend to backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function for API calls
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('auth_token');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// ==========================================
// AUTHENTICATION
// ==========================================

export const authService = {
  async register(email: string, password: string, name: string, role: string = 'volunteer') {
    const data = await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, role }),
    });
    
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
    }
    
    return data;
  },

  async login(email: string, password: string) {
    const data = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
    }
    
    return data;
  },

  async getProfile() {
    return apiCall('/auth/me');
  },

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  },

  getToken() {
    return localStorage.getItem('auth_token');
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('auth_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated() {
    return !!this.getToken();
  },
};

// ==========================================
// REQUESTS
// ==========================================

export const requestService = {
  async getAll() {
    return apiCall('/requests');
  },

  async create(request: any) {
    return apiCall('/requests', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  async update(id: string, updates: any) {
    return apiCall(`/requests/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },
};

// ==========================================
// VOLUNTEERS
// ==========================================

export const volunteerService = {
  async getAll() {
    return apiCall('/volunteers');
  },

  async create(volunteer: any) {
    return apiCall('/volunteers', {
      method: 'POST',
      body: JSON.stringify(volunteer),
    });
  },

  async update(id: string, updates: any) {
    return apiCall(`/volunteers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },
};

// ==========================================
// ASSIGNMENTS
// ==========================================

export const assignmentService = {
  async getAll() {
    return apiCall('/assignments');
  },

  async create(assignment: any) {
    return apiCall('/assignments', {
      method: 'POST',
      body: JSON.stringify(assignment),
    });
  },

  async update(id: string, updates: any) {
    return apiCall(`/assignments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },
};

// ==========================================
// AI MATCHING
// ==========================================

export const aiService = {
  async matchVolunteer(requestData: any) {
    return apiCall('/ai/match', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  },
};
