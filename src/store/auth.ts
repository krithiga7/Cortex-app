import { useState, useEffect } from 'react';
import { authService } from '@/services/api';

export type UserRole = 'admin' | 'volunteer';

export interface User {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  name: string;
  phone?: string;
  volunteerId?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

// Auth store with Backend API integration
class AuthStore {
  private state: AuthState = {
    user: null,
    isAuthenticated: false
  };
  
  private listeners: Set<(state: AuthState) => void> = new Set();

  constructor() {
    // Load from localStorage on init
    this.loadFromStorage();
  }

  private loadFromStorage() {
    const userStr = localStorage.getItem('auth_user');
    const token = localStorage.getItem('auth_token');
    
    console.log('Loading auth from storage:', { 
      hasUser: !!userStr, 
      hasToken: !!token,
      user: userStr ? JSON.parse(userStr) : null 
    });
    
    if (userStr && token) {
      try {
        this.state.user = JSON.parse(userStr);
        this.state.isAuthenticated = true;
        console.log('Auth loaded from storage:', this.state.user);
      } catch (e) {
        console.error('Failed to load auth from storage:', e);
      }
    } else {
      console.log('No auth in storage, user needs to login');
    }
  }

  getState() {
    return this.state;
  }

  subscribe(listener: (state: AuthState) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit() {
    this.listeners.forEach(listener => listener(this.state));
  }

  async login(email: string, password: string) {
    try {
      const response = await authService.login(email, password);
      
      console.log('Login response from backend:', response);
      
      this.state.user = {
        id: response.user.id,
        email: response.user.email,
        password: '', // Don't store password
        role: response.user.role,
        name: response.user.name
      };
      this.state.isAuthenticated = true;
      
      localStorage.setItem('auth_user', JSON.stringify(this.state.user));
      
      console.log('User saved to localStorage:', {
        user: this.state.user,
        token: localStorage.getItem('auth_token') ? 'EXISTS' : 'MISSING'
      });
      
      this.emit();
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(email: string, password: string, name: string, role: UserRole = 'volunteer') {
    try {
      const response = await authService.register(email, password, name, role);
      
      this.state.user = {
        id: response.user.id,
        email: response.user.email,
        password: '',
        role: response.user.role,
        name: response.user.name
      };
      this.state.isAuthenticated = true;
      
      localStorage.setItem('auth_user', JSON.stringify(this.state.user));
      this.emit();
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  logout() {
    authService.logout();
    this.state.user = null;
    this.state.isAuthenticated = false;
    this.emit();
  }

  updateUser(updates: Partial<User>) {
    if (!this.state.user) {
      throw new Error('No user logged in');
    }
    
    this.state.user = { ...this.state.user, ...updates };
    localStorage.setItem('auth_user', JSON.stringify(this.state.user));
    this.emit();
    
    return this.state.user;
  }
}

export const authStore = new AuthStore();

// React hook
export function useAuth() {
  const [state, setState] = useState(authStore.getState());

  useEffect(() => {
    const unsubscribe = authStore.subscribe((newState) => {
      setState(newState);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    ...state,
    login: authStore.login.bind(authStore),
    register: authStore.register.bind(authStore),
    logout: authStore.logout.bind(authStore),
    updateUser: authStore.updateUser.bind(authStore)
  };
}
