import type { Prescription } from '@/lib/queries';

const now = Date.now();
const hoursAgo = (h: number) => new Date(now - h * 3600_000).toISOString();
const daysAgo = (d: number) => new Date(now - d * 86_400_000).toISOString();

export const demoPrescriptions: Prescription[] = [
  {
    id: 'demo-rx-1',
    user_id: 'demo-customer-1',
    file_url: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=800',
    file_name: 'john_doe_prescription.jpg',
    status: 'pending',
    pharmacist_notes: null,
    reviewed_by: null,
    created_at: hoursAgo(2),
    updated_at: hoursAgo(2),
    profile: { full_name: 'John Doe', phone: '+254 712 345 678', area: 'Kilimani' },
  },
  {
    id: 'demo-rx-2',
    user_id: 'demo-customer-2',
    file_url: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800',
    file_name: 'sarah_connor_script.jpg',
    status: 'pending',
    pharmacist_notes: null,
    reviewed_by: null,
    created_at: hoursAgo(5),
    updated_at: hoursAgo(5),
    profile: { full_name: 'Sarah Connor', phone: '+254 722 987 654', area: 'Westlands' },
  },
  {
    id: 'demo-rx-3',
    user_id: 'demo-customer-3',
    file_url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800',
    file_name: 'mike_omamo_rx.pdf',
    status: 'pending',
    pharmacist_notes: null,
    reviewed_by: null,
    created_at: hoursAgo(8),
    updated_at: hoursAgo(8),
    profile: { full_name: 'Mike Omamo', phone: '+254 733 456 123', area: 'Lavington' },
  },
  {
    id: 'demo-rx-4',
    user_id: 'demo-customer-4',
    file_url: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800',
    file_name: 'grace_wanjiru_prescription.jpg',
    status: 'pending',
    pharmacist_notes: null,
    reviewed_by: null,
    created_at: daysAgo(1),
    updated_at: daysAgo(1),
    profile: { full_name: 'Grace Wanjiru', phone: '+254 700 111 222', area: 'Karen' },
  },
  {
    id: 'demo-rx-5',
    user_id: 'demo-customer-5',
    file_url: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=800',
    file_name: 'david_kiprono_script.jpg',
    status: 'approved',
    pharmacist_notes: 'Approved — Amoxicillin 500mg, 1 capsule three times daily for 7 days. Dosage verified.',
    reviewed_by: 'demo-pharmacist',
    created_at: daysAgo(2),
    updated_at: daysAgo(2),
    profile: { full_name: 'David Kiprono', phone: '+254 720 333 444', area: 'Ngong' },
  },
  {
    id: 'demo-rx-6',
    user_id: 'demo-customer-6',
    file_url: 'https://images.unsplash.com/photo-1584308662277-3d251b58e538?w=800',
    file_name: 'lucy_chemutai_rx.jpg',
    status: 'rejected',
    pharmacist_notes: 'Rejected — prescription is illegible. Please upload a clearer photo of the script.',
    reviewed_by: 'demo-pharmacist',
    created_at: daysAgo(3),
    updated_at: daysAgo(3),
    profile: { full_name: 'Lucy Chemutai', phone: '+254 711 555 666', area: 'Runda' },
  },
];

export function getDemoPendingPrescriptions(): Prescription[] {
  return demoPrescriptions.filter((rx) => rx.status === 'pending');
}

export function getDemoReviewedPrescriptions(): Prescription[] {
  return demoPrescriptions.filter((rx) => rx.status !== 'pending');
}
