import { postApi } from './api'

export const INQUIRY_URL = '/api/inquiry.php'
export const ADMIN_URL = '/api/admin.php'

// Matches SERVICES in public/api/inquiry.php.
export const SERVICE_OPTIONS = ['Flooring Installation', 'Bathroom Remodel', 'Kitchen Updates', 'Enclosed Patio', 'Roofing', 'Handyman Services', 'Other']

export const sendInquiry = (fields) => postApi(INQUIRY_URL, fields)
export const adminApi = (fields) => postApi(ADMIN_URL, fields)
