/**
 * Services Index
 * 
 * File này export tất cả các service để dễ dàng import trong các component
 */

// Import all services
import appointmentService from './appointmentService';
import authService from './authService';
import blogService from './blogService';
import consultantService from './consultantService';
import contactService from './contactService';
import cycleTrackingService from './cycleTrackingService';
import paymentService from './paymentService';
import serviceService from './serviceService';
import slotService from './slotService';
import testResultService from './testResultService';
export { default as qnaService } from './qnaService';

// Export all services
export {
  appointmentService,
  authService,
  blogService,
  consultantService,
  contactService,
  cycleTrackingService,
  paymentService,
  serviceService,
  slotService,
  testResultService,
};

// Also re-export the auth and user APIs from api.ts
export { authAPI, userAPI } from '../utils/api';

// Default export of all services as a single object
export default {
  appointment: appointmentService,
  auth: authService,
  blog: blogService,
  consultant: consultantService,
  contact: contactService,
  cycleTracking: cycleTrackingService,
  payment: paymentService,
  service: serviceService,
  slot: slotService,
  testResult: testResultService,
}; 