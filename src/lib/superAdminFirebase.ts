import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';

export interface SchoolTenant {
  id: string;
  name: string;
  subDomain: string;
  contactEmail: string;
  contactPhone?: string;
  adminName?: string;
  principalName?: string;
  studentCount?: number;
  staffCount?: number;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  district?: string;
  country?: string;
  schoolType?: string;
  status: 'PENDING_APPROVAL' | 'ACTIVE' | 'PAST_DUE' | 'EXPIRED' | 'REJECTED' | 'SUSPENDED';
  registrationSource?: 'PORTAL' | 'MANUAL' | 'INVITE';
  createdAt: string;
  approvedAt?: string;
  rejectionReason?: string;
  subscription: {
    status: 'ACTIVE' | 'PAST_DUE' | 'EXPIRED' | 'CANCELLED' | 'PENDING_APPROVAL' | 'SUSPENDED' | 'REJECTED';
    expiryDate: string;
    billingCycle?: string;
    plan: {
      name: 'TRIAL' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE';
      price: number;
    };
  };
}

export interface PlanTier {
  id: string;
  name: 'TRIAL' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE';
  price: number;
  billingCycle: '14_DAYS' | 'ANNUAL' | 'MONTHLY';
  isActive: boolean;
  features: string[];
}

export interface CommunicationMessage {
  id: string;
  title: string;
  message: string;
  targetSchoolId: string;
  targetSchoolName?: string;
  priority: 'NORMAL' | 'HIGH' | 'URGENT';
  channel: 'IN_APP' | 'EMAIL' | 'SMS';
  createdAt: string;
  author: string;
}

export interface PlatformInvoice {
  id: string;
  invoiceNumber: string;
  schoolId: string;
  schoolName: string;
  plan: string;
  amount: number;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  dueDate: string;
  createdAt: string;
  gateway: 'RAZORPAY' | 'STRIPE' | 'MANUAL';
  notes?: string;
}

// Strictly 0 mock schools - real schools fetched live from Firestore & database
export const INITIAL_FIRESTORE_SCHOOLS: SchoolTenant[] = [];

export const INITIAL_FIRESTORE_PLANS: PlanTier[] = [
  {
    id: 'plan-trial',
    name: 'TRIAL',
    price: 0,
    billingCycle: '14_DAYS',
    isActive: true,
    features: ['admissions', 'attendance', 'academics', 'grades']
  },
  {
    id: 'plan-basic',
    name: 'BASIC',
    price: 24999,
    billingCycle: 'ANNUAL',
    isActive: true,
    features: ['admissions', 'attendance', 'timetable', 'exams', 'billing', 'academics', 'teacher_portal']
  },
  {
    id: 'plan-premium',
    name: 'PREMIUM',
    price: 49999,
    billingCycle: 'ANNUAL',
    isActive: true,
    features: [
      'admissions',
      'attendance',
      'timetable',
      'exams',
      'billing',
      'library',
      'expenses',
      'academics',
      'transport',
      'teacher_portal',
      'parent_portal'
    ]
  },
  {
    id: 'plan-enterprise',
    name: 'ENTERPRISE',
    price: 74999,
    billingCycle: 'ANNUAL',
    isActive: true,
    features: [
      'admissions',
      'attendance',
      'timetable',
      'exams',
      'billing',
      'library',
      'expenses',
      'academics',
      'transport',
      'hostel',
      'payroll',
      'teacher_portal',
      'parent_portal'
    ]
  }
];

export const INITIAL_FIRESTORE_COMMS: CommunicationMessage[] = [
  {
    id: 'comm-101',
    title: 'Platform Maintenance & Upgrade Notice',
    message: 'Scheduled cloud database index optimization will occur this Sunday from 02:00 AM to 03:30 AM IST. All school services will remain fully functional.',
    targetSchoolId: 'ALL',
    targetSchoolName: 'All Registered Schools',
    priority: 'NORMAL',
    channel: 'IN_APP',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    author: 'Super Admin'
  },
  {
    id: 'comm-102',
    title: 'New Feature Rollout: Real-time Parent UPI Fee Receipts',
    message: 'We have enabled automated instant WhatsApp/Email PDF receipts for all parents paying via Razorpay gateway. Ensure school bank accounts are verified.',
    targetSchoolId: 'ALL',
    targetSchoolName: 'All Registered Schools',
    priority: 'HIGH',
    channel: 'IN_APP',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    author: 'Super Admin'
  }
];

export const INITIAL_FIRESTORE_INVOICES: PlatformInvoice[] = [
  {
    id: 'inv-101',
    invoiceNumber: 'INV-2026-0081',
    schoolId: 'sch-vikas-001',
    schoolName: 'Vikas International Academy',
    plan: 'PREMIUM',
    amount: 49999,
    status: 'PAID',
    dueDate: '2026-10-31',
    createdAt: '2026-10-24T10:30:00Z',
    gateway: 'RAZORPAY'
  },
  {
    id: 'inv-102',
    invoiceNumber: 'INV-2026-0082',
    schoolId: 'sch-dhp-002',
    schoolName: 'Delhi Heritage Public School',
    plan: 'BASIC',
    amount: 24999,
    status: 'PAID',
    dueDate: '2026-10-28',
    createdAt: '2026-10-22T14:15:00Z',
    gateway: 'RAZORPAY'
  }
];

export async function seedInitialSuperAdminData(): Promise<void> {
  try {
    const plansSnap = await getDocs(collection(db, 'plans'));
    if (plansSnap.empty) {
      const batch = writeBatch(db);
      for (const p of INITIAL_FIRESTORE_PLANS) {
        batch.set(doc(db, 'plans', p.id), p);
      }
      await batch.commit();
    }

    const commsSnap = await getDocs(collection(db, 'communications'));
    if (commsSnap.empty) {
      const batch = writeBatch(db);
      for (const c of INITIAL_FIRESTORE_COMMS) {
        batch.set(doc(db, 'communications', c.id), c);
      }
      await batch.commit();
    }

    const invSnap = await getDocs(collection(db, 'invoices'));
    if (invSnap.empty) {
      const batch = writeBatch(db);
      for (const inv of INITIAL_FIRESTORE_INVOICES) {
        batch.set(doc(db, 'invoices', inv.id), inv);
      }
      await batch.commit();
    }
  } catch (err) {
    console.warn('[Firebase SuperAdmin] Auto-seed check note:', err);
  }
}

let globalSchoolsCache: SchoolTenant[] = [];

export function subscribeToSchools(
  onData: (schools: SchoolTenant[]) => void,
  onError?: (err: Error) => void
): () => void {
  let isMounted = true;

  const fetchFromApi = async () => {
    try {
      const res = await fetch('/api/schools', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.schools)) {
        globalSchoolsCache = data.schools;
        if (isMounted) onData(data.schools);
      }
    } catch (err: any) {
      if (onError) onError(err);
      if (globalSchoolsCache.length > 0 && isMounted) {
        onData(globalSchoolsCache);
      }
    }
  };

  fetchFromApi();

  // Poll every 3 seconds for continuous real-time sync across all clients
  const interval = setInterval(fetchFromApi, 3000);

  const handleLocalUpdate = () => {
    fetchFromApi();
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('edutrack-school-updated', handleLocalUpdate);
  }

  return () => {
    isMounted = false;
    clearInterval(interval);
    if (typeof window !== 'undefined') {
      window.removeEventListener('edutrack-school-updated', handleLocalUpdate);
    }
  };
}

export async function approveSchoolRegistration(
  schoolId: string,
  planName: 'TRIAL' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE' = 'BASIC',
  durationMonths: number = 12
): Promise<void> {
  const now = new Date();
  const expiry = new Date(now.getTime() + (planName === 'TRIAL' ? 14 : durationMonths * 30) * 86400000);

  const priceMap: Record<string, number> = {
    TRIAL: 0,
    BASIC: 24999,
    PREMIUM: 49999,
    ENTERPRISE: 74999
  };

  const payload = {
    id: schoolId,
    status: 'ACTIVE',
    approvedAt: now.toISOString(),
    approvedBy: 'Super Admin',
    subscription: {
      status: 'ACTIVE',
      expiryDate: expiry.toISOString(),
      billingCycle: planName === 'TRIAL' ? '14_DAYS' : 'ANNUAL',
      plan: {
        name: planName,
        price: priceMap[planName] || 0
      }
    }
  };

  await fetch('/api/schools', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('edutrack-school-updated'));
  }

  try {
    await sendSchoolCommunication({
      title: 'Registration Approved & Instance Provisioned',
      message: `Your school instance (${schoolId}) has been officially verified and activated with the ${planName} plan tier.`,
      targetSchoolId: schoolId,
      priority: 'HIGH',
      channel: 'IN_APP'
    });
  } catch (err) {
    console.warn('Communication log note:', err);
  }
}

export async function rejectSchoolRegistration(
  schoolId: string,
  reason: string
): Promise<void> {
  const payload = {
    id: schoolId,
    status: 'REJECTED',
    rejectionReason: reason || 'Application details could not be verified by compliance.',
    rejectedAt: new Date().toISOString(),
    subscription: {
      status: 'CANCELLED',
      expiryDate: new Date().toISOString(),
      plan: {
        name: 'TRIAL',
        price: 0
      }
    }
  };

  await fetch('/api/schools', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('edutrack-school-updated'));
  }
}

export async function updateSchoolSubscription(
  schoolId: string,
  updates: {
    planName?: 'TRIAL' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE';
    expiryDate?: string;
    status?: 'ACTIVE' | 'PAST_DUE' | 'EXPIRED' | 'PENDING_APPROVAL' | 'SUSPENDED';
    studentCount?: number;
  }
): Promise<void> {
  const priceMap: Record<string, number> = {
    TRIAL: 0,
    BASIC: 24999,
    PREMIUM: 49999,
    ENTERPRISE: 74999
  };

  const payload: any = {
    id: schoolId
  };

  if (updates.status) {
    payload.status = updates.status;
  }
  if (updates.studentCount !== undefined) {
    payload.studentCount = updates.studentCount;
  }

  if (updates.planName || updates.expiryDate || updates.status) {
    payload.subscription = {
      status: updates.status || 'ACTIVE',
      expiryDate: updates.expiryDate || new Date(Date.now() + 365 * 86400000).toISOString(),
      billingCycle: updates.planName === 'TRIAL' ? '14_DAYS' : 'ANNUAL',
      plan: {
        name: updates.planName || 'BASIC',
        price: priceMap[updates.planName || 'BASIC'] || 24999
      }
    };
  }

  await fetch('/api/schools', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('edutrack-school-updated'));
  }
}

export async function extendSchoolValidity(
  schoolId: string,
  additionalDays: number = 14
): Promise<void> {
  const newExpiry = new Date(Date.now() + additionalDays * 86400000).toISOString();
  const payload = {
    id: schoolId,
    status: 'ACTIVE',
    subscription: {
      status: 'ACTIVE',
      expiryDate: newExpiry
    }
  };

  await fetch('/api/schools', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('edutrack-school-updated'));
  }
}

export async function deleteSchoolTenant(schoolId: string): Promise<void> {
  await fetch(`/api/schools?id=${encodeURIComponent(schoolId)}`, {
    method: 'DELETE'
  });

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('edutrack-school-updated'));
  }
}

export async function updateSchoolDetails(
  schoolId: string,
  updates: Partial<SchoolTenant>
): Promise<void> {
  const payload: any = {
    id: schoolId,
    ...updates,
    updatedAt: new Date().toISOString()
  };

  if (updates.subDomain) {
    payload.subDomain = updates.subDomain.toLowerCase().replace(/[^a-z0-9]/g, '-');
  }

  await fetch('/api/schools', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('edutrack-school-updated'));
  }
}

export async function createSchoolTenant(
  newSchool: Partial<SchoolTenant> & { name: string; subDomain: string; contactEmail: string }
): Promise<string> {
  const cleanSubdomain = newSchool.subDomain.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const schoolId = newSchool.id || ('sch-' + cleanSubdomain + '-' + Math.floor(100 + Math.random() * 900));
  
  const priceMap: Record<string, number> = {
    TRIAL: 0,
    BASIC: 24999,
    PREMIUM: 49999,
    ENTERPRISE: 74999
  };
  const planName = newSchool.subscription?.plan?.name || 'BASIC';
  const planPrice = newSchool.subscription?.plan?.price !== undefined 
    ? Number(newSchool.subscription.plan.price) 
    : (priceMap[planName] || 24999);

  const schoolDoc: SchoolTenant = {
    id: schoolId,
    name: newSchool.name,
    subDomain: cleanSubdomain,
    contactEmail: newSchool.contactEmail,
    contactPhone: newSchool.contactPhone || '',
    adminName: newSchool.adminName || 'Principal',
    studentCount: Number(newSchool.studentCount || 0),
    staffCount: Number(newSchool.staffCount || 0),
    address: newSchool.address || '',
    city: newSchool.city || '',
    state: newSchool.state || '',
    pincode: newSchool.pincode || '',
    schoolType: newSchool.schoolType || 'General Academy',
    status: newSchool.status || 'ACTIVE',
    registrationSource: newSchool.registrationSource || 'MANUAL',
    createdAt: new Date().toISOString(),
    subscription: {
      status: newSchool.subscription?.status || newSchool.status || 'ACTIVE',
      expiryDate: newSchool.subscription?.expiryDate || new Date(Date.now() + (planName === 'TRIAL' ? 14 : 365) * 86400000).toISOString(),
      billingCycle: newSchool.subscription?.billingCycle || (planName === 'TRIAL' ? '14_DAYS' : 'ANNUAL'),
      plan: {
        name: planName,
        price: planPrice
      }
    }
  };

  await fetch('/api/schools', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(schoolDoc)
  });

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('edutrack-school-updated'));
  }

  return schoolId;
}

export function subscribeToPlans(
  onData: (plans: PlanTier[]) => void
): () => void {
  const q = collection(db, 'plans');
  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        onData(INITIAL_FIRESTORE_PLANS);
        return;
      }
      const list: PlanTier[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        list.push({
          id: docSnap.id,
          name: d.name || 'BASIC',
          price: Number(d.price || 0),
          billingCycle: d.billingCycle || 'ANNUAL',
          isActive: d.isActive ?? true,
          features: Array.isArray(d.features) ? d.features : []
        });
      });
      onData(list);
    },
    () => {
      onData(INITIAL_FIRESTORE_PLANS);
    }
  );
}

export async function updatePlanSettings(
  planId: string,
  price: number,
  features: string[],
  isActive: boolean
): Promise<void> {
  const planRef = doc(db, 'plans', planId);
  await updateDoc(planRef, {
    price,
    features,
    isActive,
    updatedAt: new Date().toISOString()
  });
}

export function subscribeToCommunications(
  onData: (comms: CommunicationMessage[]) => void
): () => void {
  const q = collection(db, 'communications');
  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        onData(INITIAL_FIRESTORE_COMMS);
        return;
      }
      const list: CommunicationMessage[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        list.push({
          id: docSnap.id,
          title: d.title || 'Platform Notice',
          message: d.message || '',
          targetSchoolId: d.targetSchoolId || 'ALL',
          targetSchoolName: d.targetSchoolName || 'All Registered Schools',
          priority: d.priority || 'NORMAL',
          channel: d.channel || 'IN_APP',
          createdAt: d.createdAt || new Date().toISOString(),
          author: d.author || 'Super Admin'
        });
      });
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onData(list);
    },
    () => {
      onData(INITIAL_FIRESTORE_COMMS);
    }
  );
}

export async function sendSchoolCommunication(payload: {
  title: string;
  message: string;
  targetSchoolId?: string;
  targetSchoolName?: string;
  priority?: 'NORMAL' | 'HIGH' | 'URGENT';
  channel?: 'IN_APP' | 'EMAIL' | 'SMS';
}): Promise<void> {
  const commId = 'comm-' + Date.now();
  const commDoc: CommunicationMessage = {
    id: commId,
    title: payload.title,
    message: payload.message,
    targetSchoolId: payload.targetSchoolId || 'ALL',
    targetSchoolName: payload.targetSchoolName || (payload.targetSchoolId === 'ALL' ? 'All Registered Schools' : 'Designated School'),
    priority: payload.priority || 'NORMAL',
    channel: payload.channel || 'IN_APP',
    createdAt: new Date().toISOString(),
    author: 'Super Admin'
  };

  await setDoc(doc(db, 'communications', commId), commDoc);
}

export function subscribeToInvoices(
  onData: (invoices: PlatformInvoice[]) => void
): () => void {
  const q = collection(db, 'invoices');
  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        onData(INITIAL_FIRESTORE_INVOICES);
        return;
      }
      const list: PlatformInvoice[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        list.push({
          id: docSnap.id,
          invoiceNumber: d.invoiceNumber || `INV-${docSnap.id.slice(-4)}`,
          schoolId: d.schoolId || '',
          schoolName: d.schoolName || 'Unknown School',
          plan: d.plan || 'BASIC',
          amount: Number(d.amount || 0),
          status: d.status || 'PENDING',
          dueDate: d.dueDate || '',
          createdAt: d.createdAt || new Date().toISOString(),
          gateway: d.gateway || 'RAZORPAY',
          notes: d.notes
        });
      });
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onData(list);
    },
    () => {
      onData(INITIAL_FIRESTORE_INVOICES);
    }
  );
}

export async function createPlatformInvoice(invoice: {
  schoolId: string;
  schoolName: string;
  plan: string;
  amount: number;
  dueDate: string;
  notes?: string;
}): Promise<void> {
  const id = 'inv-' + Date.now();
  const invNumber = 'INV-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
  const newInvoice: PlatformInvoice = {
    id,
    invoiceNumber: invNumber,
    schoolId: invoice.schoolId,
    schoolName: invoice.schoolName,
    plan: invoice.plan,
    amount: invoice.amount,
    status: 'PENDING',
    dueDate: invoice.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    gateway: 'MANUAL',
    notes: invoice.notes
  };

  await setDoc(doc(db, 'invoices', id), newInvoice);
}
