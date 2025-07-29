/**
 * Authentication utility functions
 */

import { STORAGE_KEYS } from '../config/constants';

export const authUtils = {
  /**
   * Get the current user ID from localStorage
   */
  getCurrentUserId: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.USER_ID) || 
           localStorage.getItem(STORAGE_KEYS.ACCOUNT_ID) ||
           localStorage.getItem('userID') || 
           localStorage.getItem('AccountID');
  },

  /**
   * Check if user is logged in
   */
  isLoggedIn: (): boolean => {
    return localStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN) === 'true';
  },

  /**
   * Get user role
   */
  getUserRole: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.USER_ROLE);
  },
  
  /**
   * Check if user has a specific role
   */
  hasRole: (role: string): boolean => {
    const userRole = localStorage.getItem(STORAGE_KEYS.USER_ROLE);
    if (!userRole) return false;
    return userRole.toLowerCase() === role.toLowerCase();
  },
  
  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole: (roles: string[]): boolean => {
    const userRole = localStorage.getItem(STORAGE_KEYS.USER_ROLE);
    if (!userRole) return false;
    return roles.some(role => userRole.toLowerCase() === role.toLowerCase());
  },

  /**
   * Get user token
   */
  getToken: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  },

  /**
   * Set user ID for testing purposes
   */
  setTestUserId: (userId: string): void => {
    localStorage.setItem(STORAGE_KEYS.USER_ID, userId);
    localStorage.setItem(STORAGE_KEYS.ACCOUNT_ID, userId);
    localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
    localStorage.setItem(STORAGE_KEYS.USER_ROLE, 'consultant');
  },

  /**
   * Clear all auth data
   */
  clearAuth: (): void => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.IS_LOGGED_IN);
    localStorage.removeItem(STORAGE_KEYS.USER_ROLE);
    localStorage.removeItem(STORAGE_KEYS.USER_ID);
    localStorage.removeItem(STORAGE_KEYS.ACCOUNT_ID);
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  /**
   * Debug localStorage contents
   */
  debugLocalStorage: (): void => {
    console.log('🔍 localStorage Debug:');
    console.log('All keys:', Object.keys(localStorage));
    console.log('TOKEN:', localStorage.getItem(STORAGE_KEYS.TOKEN));
    console.log('USER_ID:', localStorage.getItem(STORAGE_KEYS.USER_ID));
    console.log('ACCOUNT_ID:', localStorage.getItem(STORAGE_KEYS.ACCOUNT_ID));
    console.log('IS_LOGGED_IN:', localStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN));
    console.log('USER_ROLE:', localStorage.getItem(STORAGE_KEYS.USER_ROLE));
    console.log('USER:', localStorage.getItem(STORAGE_KEYS.USER));
  }
};
