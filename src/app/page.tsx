'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Globe,
  Sliders,
  DollarSign,
  TrendingUp,
  ShieldAlert,
  Calendar,
  Plus,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  FileText,
  Settings,
  Layers,
  Save,
  Check,
  Search,
  Building2,
  Users,
  CreditCard,
  Lock,
  ArrowRight,
  Sparkles,
  Info,
  Clock,
  Filter,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Send,
  MessageSquare,
  ShieldCheck,
  AlertCircle,
  Megaphone,
  Radio,
  ChevronRight,
  UserCheck,
  X,
  Eye,
  Edit,
  Trash2,
  MapPin,
  Phone,
  Mail,
  Building,
  GraduationCap,
  User
} from 'lucide-react';
import {
  SchoolTenant,
  PlanTier,
  CommunicationMessage,
  PlatformInvoice,
  subscribeToSchools,
  subscribeToPlans,
  subscribeToCommunications,
  subscribeToInvoices,
  approveSchoolRegistration,
  rejectSchoolRegistration,
  updateSchoolSubscription,
  extendSchoolValidity,
  deleteSchoolTenant,
  updateSchoolDetails,
  createSchoolTenant,
  sendSchoolCommunication,
  updatePlanSettings,
  createPlatformInvoice,
  seedInitialSuperAdminData
} from '@/lib/superAdminFirebase';

export default function SuperAdminPortalPage() {
  const [schools, setSchools] = useState<SchoolTenant[]>([]);
  const [plans, setPlans] = useState<PlanTier[]>([]);
  const [comms, setComms] = useState<CommunicationMessage[]>([]);
  const [invoices, setInvoices] = useState<PlatformInvoice[]>([]);
  const [loading, setLoading] = useState(true);

  // Tab navigation
  const [activeTab, setActiveTab] = useState<'schools' | 'approvals' | 'comms' | 'plans' | 'invoices' | 'settings'>('schools');

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal states
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<SchoolTenant | null>(null);
  const [adjustPlan, setAdjustPlan] = useState<'TRIAL' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE'>('BASIC');
  const [adjustExpiry, setAdjustExpiry] = useState('');
  const [adjustStatus, setAdjustStatus] = useState<any>('ACTIVE');
  const [adjustStudentCount, setAdjustStudentCount] = useState<number>(500);
  const [modalSubmitting, setModalSubmitting] = useState(false);

  // School Details Modal state
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailedSchool, setDetailedSchool] = useState<SchoolTenant | null>(null);

  // Edit School Modal state
  const [showEditSchoolModal, setShowEditSchoolModal] = useState(false);
  const [editSchoolForm, setEditSchoolForm] = useState({
    id: '',
    name: '',
    subDomain: '',
    contactEmail: '',
    contactPhone: '',
    adminName: '',
    schoolType: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    studentCount: 500,
    staffCount: 30,
    status: 'ACTIVE' as 'ACTIVE' | 'PENDING_APPROVAL' | 'PAST_DUE' | 'EXPIRED' | 'REJECTED' | 'SUSPENDED',
    planName: 'BASIC' as 'TRIAL' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE',
    planPrice: 24999,
    expiryDate: ''
  });
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Delete School Modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingSchool, setDeletingSchool] = useState<SchoolTenant | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // Create School Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createSchoolForm, setCreateSchoolForm] = useState({
    name: '',
    subDomain: '',
    contactEmail: '',
    contactPhone: '',
    adminName: '',
    schoolType: 'K-12 Private School',
    address: '',
    city: '',
    state: '',
    pincode: '',
    studentCount: 400,
    staffCount: 25,
    planName: 'BASIC' as 'TRIAL' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE',
    status: 'ACTIVE' as 'ACTIVE' | 'PENDING_APPROVAL' | 'PAST_DUE' | 'EXPIRED' | 'REJECTED' | 'SUSPENDED'
  });
  const [createSubmitting, setCreateSubmitting] = useState(false);

  // Approval review modal
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvingSchool, setApprovingSchool] = useState<SchoolTenant | null>(null);
  const [approvalPlan, setApprovalPlan] = useState<'TRIAL' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE'>('BASIC');
  const [approvalDuration, setApprovalDuration] = useState<number>(12);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectBox, setShowRejectBox] = useState(false);

  // Communication Composer state
  const [showCommModal, setShowCommModal] = useState(false);
  const [commTitle, setCommTitle] = useState('');
  const [commMessage, setCommMessage] = useState('');
  const [commTargetSchoolId, setCommTargetSchoolId] = useState('ALL');
  const [commPriority, setCommPriority] = useState<'NORMAL' | 'HIGH' | 'URGENT'>('NORMAL');
  const [commSubmitting, setCommSubmitting] = useState(false);

  // Manual Invoice Modal state
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invSchoolId, setInvSchoolId] = useState('');
  const [invPlan, setInvPlan] = useState('BASIC');
  const [invAmount, setInvAmount] = useState('24999');
  const [invDueDate, setInvDueDate] = useState('');
  const [invSubmitting, setInvSubmitting] = useState(false);

  // Plan Edit State
  const [selectedPlan, setSelectedPlan] = useState<PlanTier | null>(null);
  const [editPlanPrice, setEditPlanPrice] = useState<string>('');
  const [editPlanFeatures, setEditPlanFeatures] = useState<string[]>([]);
  const [editPlanActive, setEditPlanActive] = useState<boolean>(true);
  const [planSubmitting, setPlanSubmitting] = useState(false);

  // Toast / Feedback
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const availableModules = [
    { key: 'admissions', label: 'Admissions & Promotions' },
    { key: 'attendance', label: 'Attendance Management (RFID / Manual)' },
    { key: 'timetable', label: 'Timetable Scheduling' },
    { key: 'exams', label: 'Exam & GPA Management' },
    { key: 'billing', label: 'Fee Management & Invoices' },
    { key: 'library', label: 'Library Management' },
    { key: 'expenses', label: 'Expense Tracking' },
    { key: 'academics', label: 'Grades & Academics' },
    { key: 'transport', label: 'GPS Transport Tracker' },
    { key: 'hostel', label: 'Hostel Allocation' },
    { key: 'payroll', label: 'Staff Payroll Ledger' },
    { key: 'teacher_portal', label: 'Teacher Portal Access' },
    { key: 'parent_portal', label: 'Parent Portal Access' }
  ];

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 4500);
  };

  useEffect(() => {
    setLoading(true);
    const unsubSchools = subscribeToSchools((list) => {
      setSchools(list);
      setLoading(false);
    });

    const unsubPlans = subscribeToPlans((list) => {
      setPlans(list);
    });

    const unsubComms = subscribeToCommunications((list) => {
      setComms(list);
    });

    const unsubInvoices = subscribeToInvoices((list) => {
      setInvoices(list);
    });

    return () => {
      unsubSchools();
      unsubPlans();
      unsubComms();
      unsubInvoices();
    };
  }, []);

  // Compute live platform statistics
  const totalSchoolsCount = schools.length;
  const pendingApprovals = schools.filter((s) => s.status === 'PENDING_APPROVAL');
  const activePaidCount = schools.filter(
    (s) => s.status === 'ACTIVE' && s.subscription?.plan?.name !== 'TRIAL'
  ).length;
  const activeTrialsCount = schools.filter(
    (s) => s.status === 'ACTIVE' && s.subscription?.plan?.name === 'TRIAL'
  ).length;
  const expiredCount = schools.filter(
    (s) =>
      s.status === 'EXPIRED' ||
      s.status === 'PAST_DUE' ||
      (s.subscription?.expiryDate && new Date(s.subscription.expiryDate).getTime() < Date.now())
  ).length;
  const totalRevenue = schools.reduce((acc, s) => {
    if (s.status === 'ACTIVE' && s.subscription?.plan?.price) {
      return acc + s.subscription.plan.price;
    }
    return acc;
  }, 0);

  // Filtered schools based on search and status
  const filteredSchools = schools.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.subDomain.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.contactEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.adminName && s.adminName.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'PENDING_APPROVAL') return s.status === 'PENDING_APPROVAL';
    if (statusFilter === 'ACTIVE') return s.status === 'ACTIVE';
    if (statusFilter === 'TRIAL') return s.subscription?.plan?.name === 'TRIAL' && s.status === 'ACTIVE';
    if (statusFilter === 'EXPIRED') {
      return (
        s.status === 'EXPIRED' ||
        s.status === 'PAST_DUE' ||
        (s.subscription?.expiryDate && new Date(s.subscription.expiryDate).getTime() < Date.now())
      );
    }
    return true;
  });

  const openApprovalModal = (school: SchoolTenant) => {
    setApprovingSchool(school);
    setApprovalPlan(school.subscription?.plan?.name || 'BASIC');
    setApprovalDuration(12);
    setShowRejectBox(false);
    setRejectReason('');
    setShowApprovalModal(true);
  };

  const handleApprove = async () => {
    if (!approvingSchool) return;
    try {
      await approveSchoolRegistration(approvingSchool.id, approvalPlan, approvalDuration);
      showToast(`School "${approvingSchool.name}" approved and activated in Firebase Firestore!`);
      setShowApprovalModal(false);
      setApprovingSchool(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to approve school registration', 'error');
    }
  };

  const handleReject = async () => {
    if (!approvingSchool) return;
    try {
      await rejectSchoolRegistration(approvingSchool.id, rejectReason);
      showToast(`School "${approvingSchool.name}" registration marked as rejected.`, 'info');
      setShowApprovalModal(false);
      setApprovingSchool(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to reject registration', 'error');
    }
  };

  const openAdjustModal = (school: SchoolTenant) => {
    setSelectedSchool(school);
    setAdjustPlan(school.subscription?.plan?.name || 'BASIC');
    if (school.subscription?.expiryDate) {
      const d = new Date(school.subscription.expiryDate).toISOString().split('T')[0];
      setAdjustExpiry(d);
    } else {
      setAdjustExpiry(new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0]);
    }
    setAdjustStatus(school.status);
    setAdjustStudentCount(school.studentCount || 500);
    setShowAdjustModal(true);
  };

  const handleSaveAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchool) return;
    setModalSubmitting(true);
    try {
      await updateSchoolSubscription(selectedSchool.id, {
        planName: adjustPlan,
        expiryDate: adjustExpiry ? new Date(adjustExpiry).toISOString() : undefined,
        status: adjustStatus,
        studentCount: adjustStudentCount
      });
      showToast(`Updated subscription for "${selectedSchool.name}" in Firestore.`);
      setShowAdjustModal(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to update school in Firebase', 'error');
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleQuickExtend = async (school: SchoolTenant) => {
    try {
      await extendSchoolValidity(school.id, 14);
      showToast(`Extended validity for "${school.name}" by +14 days.`);
    } catch (err: any) {
      showToast(err.message || 'Failed to extend validity', 'error');
    }
  };

  const handleOpenDetails = (school: SchoolTenant) => {
    setDetailedSchool(school);
    setShowDetailsModal(true);
  };

  const handleOpenEdit = (school: SchoolTenant) => {
    setEditSchoolForm({
      id: school.id,
      name: school.name,
      subDomain: school.subDomain,
      contactEmail: school.contactEmail,
      contactPhone: school.contactPhone || '',
      adminName: school.adminName || '',
      schoolType: school.schoolType || 'General Academy',
      address: school.address || '',
      city: school.city || '',
      state: school.state || '',
      pincode: school.pincode || '',
      studentCount: school.studentCount || 0,
      staffCount: school.staffCount || 0,
      status: school.status,
      planName: school.subscription?.plan?.name || 'BASIC',
      planPrice: school.subscription?.plan?.price || 24999,
      expiryDate: school.subscription?.expiryDate 
        ? new Date(school.subscription.expiryDate).toISOString().split('T')[0] 
        : new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0]
    });
    setShowEditSchoolModal(true);
  };

  const handleSaveEditSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editSchoolForm.id) return;
    setEditSubmitting(true);
    try {
      await updateSchoolDetails(editSchoolForm.id, {
        name: editSchoolForm.name,
        subDomain: editSchoolForm.subDomain,
        contactEmail: editSchoolForm.contactEmail,
        contactPhone: editSchoolForm.contactPhone,
        adminName: editSchoolForm.adminName,
        schoolType: editSchoolForm.schoolType,
        address: editSchoolForm.address,
        city: editSchoolForm.city,
        state: editSchoolForm.state,
        pincode: editSchoolForm.pincode,
        studentCount: editSchoolForm.studentCount,
        staffCount: editSchoolForm.staffCount,
        status: editSchoolForm.status,
        subscription: {
          status: editSchoolForm.status === 'PENDING_APPROVAL' ? 'PENDING_APPROVAL' : (editSchoolForm.status === 'SUSPENDED' ? 'SUSPENDED' : 'ACTIVE'),
          expiryDate: editSchoolForm.expiryDate ? new Date(editSchoolForm.expiryDate).toISOString() : new Date(Date.now() + 365 * 86400000).toISOString(),
          billingCycle: editSchoolForm.planName === 'TRIAL' ? '14_DAYS' : 'ANNUAL',
          plan: {
            name: editSchoolForm.planName,
            price: Number(editSchoolForm.planPrice)
          }
        }
      });
      showToast(`Updated details for "${editSchoolForm.name}" in real-time Firestore.`);
      setShowEditSchoolModal(false);
      if (detailedSchool && detailedSchool.id === editSchoolForm.id) {
        setDetailedSchool((prev) => prev ? {
          ...prev,
          name: editSchoolForm.name,
          subDomain: editSchoolForm.subDomain,
          contactEmail: editSchoolForm.contactEmail,
          contactPhone: editSchoolForm.contactPhone,
          adminName: editSchoolForm.adminName,
          schoolType: editSchoolForm.schoolType,
          address: editSchoolForm.address,
          city: editSchoolForm.city,
          state: editSchoolForm.state,
          pincode: editSchoolForm.pincode,
          studentCount: editSchoolForm.studentCount,
          staffCount: editSchoolForm.staffCount,
          status: editSchoolForm.status,
          subscription: {
            ...prev.subscription,
            status: editSchoolForm.status,
            expiryDate: editSchoolForm.expiryDate ? new Date(editSchoolForm.expiryDate).toISOString() : prev.subscription.expiryDate,
            billingCycle: editSchoolForm.planName === 'TRIAL' ? '14_DAYS' : (prev.subscription.billingCycle || 'ANNUAL'),
            plan: {
              name: editSchoolForm.planName,
              price: Number(editSchoolForm.planPrice)
            }
          }
        } : null);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update school in Firebase', 'error');
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleOpenDelete = (school: SchoolTenant) => {
    setDeletingSchool(school);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingSchool) return;
    setDeleteSubmitting(true);
    try {
      await deleteSchoolTenant(deletingSchool.id);
      showToast(`School tenant "${deletingSchool.name}" permanently deleted from Firestore.`, 'info');
      setShowDeleteModal(false);
      setShowDetailsModal(false);
      setDeletingSchool(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete school from Firebase', 'error');
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const handleCreateSchoolSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createSchoolForm.name || !createSchoolForm.subDomain || !createSchoolForm.contactEmail) {
      showToast('School Name, Subdomain, and Contact Email are required', 'error');
      return;
    }
    setCreateSubmitting(true);
    try {
      const priceMap: Record<string, number> = { TRIAL: 0, BASIC: 24999, PREMIUM: 49999, ENTERPRISE: 74999 };
      await createSchoolTenant({
        name: createSchoolForm.name,
        subDomain: createSchoolForm.subDomain,
        contactEmail: createSchoolForm.contactEmail,
        contactPhone: createSchoolForm.contactPhone,
        adminName: createSchoolForm.adminName,
        schoolType: createSchoolForm.schoolType,
        address: createSchoolForm.address,
        city: createSchoolForm.city,
        state: createSchoolForm.state,
        pincode: createSchoolForm.pincode,
        studentCount: Number(createSchoolForm.studentCount || 0),
        staffCount: Number(createSchoolForm.staffCount || 0),
        status: createSchoolForm.status,
        subscription: {
          status: createSchoolForm.status,
          expiryDate: new Date(Date.now() + (createSchoolForm.planName === 'TRIAL' ? 14 : 365) * 86400000).toISOString(),
          billingCycle: createSchoolForm.planName === 'TRIAL' ? '14_DAYS' : 'ANNUAL',
          plan: {
            name: createSchoolForm.planName,
            price: priceMap[createSchoolForm.planName] || 24999
          }
        }
      });
      showToast(`New school tenant "${createSchoolForm.name}" created and synced in Firestore!`);
      setShowCreateModal(false);
      setCreateSchoolForm({
        name: '',
        subDomain: '',
        contactEmail: '',
        contactPhone: '',
        adminName: '',
        schoolType: 'K-12 Private School',
        address: '',
        city: '',
        state: '',
        pincode: '',
        studentCount: 400,
        staffCount: 25,
        planName: 'BASIC',
        status: 'ACTIVE'
      });
    } catch (err: any) {
      showToast(err.message || 'Failed to create school', 'error');
    } finally {
      setCreateSubmitting(false);
    }
  };

  const handleSendComm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commTitle.trim() || !commMessage.trim()) {
      showToast('Please provide both title and announcement text.', 'error');
      return;
    }
    setCommSubmitting(true);
    try {
      const targetSchool = schools.find((s) => s.id === commTargetSchoolId);
      await sendSchoolCommunication({
        title: commTitle,
        message: commMessage,
        targetSchoolId: commTargetSchoolId,
        targetSchoolName: commTargetSchoolId === 'ALL' ? 'All Registered Schools' : (targetSchool?.name || 'School'),
        priority: commPriority,
        channel: 'IN_APP'
      });
      showToast('Announcement dispatched to Firebase Firestore!');
      setShowCommModal(false);
      setCommTitle('');
      setCommMessage('');
    } catch (err: any) {
      showToast(err.message || 'Failed to dispatch communication', 'error');
    } finally {
      setCommSubmitting(false);
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invSchoolId) {
      showToast('Please select a school for this invoice.', 'error');
      return;
    }
    setInvSubmitting(true);
    try {
      const targetSchool = schools.find((s) => s.id === invSchoolId);
      await createPlatformInvoice({
        schoolId: invSchoolId,
        schoolName: targetSchool?.name || 'Selected Institution',
        plan: invPlan,
        amount: Number(invAmount),
        dueDate: invDueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
      });
      showToast('Manual subscription invoice recorded in Firebase Firestore!');
      setShowInvoiceModal(false);
      setInvSchoolId('');
    } catch (err: any) {
      showToast(err.message || 'Failed to create invoice', 'error');
    } finally {
      setInvSubmitting(false);
    }
  };

  const startEditPlan = (plan: PlanTier) => {
    setSelectedPlan(plan);
    setEditPlanPrice(String(plan.price));
    setEditPlanFeatures(plan.features || []);
    setEditPlanActive(plan.isActive);
  };

  const toggleFeature = (featureKey: string) => {
    if (editPlanFeatures.includes(featureKey)) {
      setEditPlanFeatures((prev) => prev.filter((f) => f !== featureKey));
    } else {
      setEditPlanFeatures((prev) => [...prev, featureKey]);
    }
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;
    setPlanSubmitting(true);
    try {
      await updatePlanSettings(selectedPlan.id, Number(editPlanPrice), editPlanFeatures, editPlanActive);
      showToast(`Plan tier "${selectedPlan.name}" updated successfully in Firestore.`);
      setSelectedPlan(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to update plan settings', 'error');
    } finally {
      setPlanSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
      {/* Toast Notification */}
      {toastMsg && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border backdrop-blur-xl animate-in slide-in-from-bottom-5 duration-300 ${
            toastMsg.type === 'error'
              ? 'bg-rose-950/80 border-rose-500/30 text-rose-200'
              : toastMsg.type === 'info'
              ? 'bg-amber-950/80 border-amber-500/30 text-amber-200'
              : 'bg-emerald-950/80 border-emerald-500/30 text-emerald-200'
          }`}
        >
          {toastMsg.type === 'error' ? (
            <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
          ) : toastMsg.type === 'info' ? (
            <Info className="w-5 h-5 text-amber-400 shrink-0" />
          ) : (
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          )}
          <span className="text-sm font-medium">{toastMsg.text}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="border-b border-slate-900 bg-slate-950/70 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white tracking-tight">EduTrack SaaS Master Super Admin</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20 uppercase tracking-wider">
                  Live Cloud Firestore
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Multi-Tenant School Tracking, Registration Approvals & Subscription Management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowCommModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition-all shadow-sm"
            >
              <Megaphone className="w-3.5 h-3.5 text-indigo-400" />
              <span>Broadcast Notice</span>
            </button>

            <button
              onClick={() => seedInitialSuperAdminData().then(() => showToast('Refreshed / Seeded benchmark schools into Firestore!'))}
              title="Seed or verify sample schools in Firebase"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Firestore Live Status Ribbon */}
        <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900/40 to-slate-950 border border-emerald-500/20 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </div>
            <div>
              <p className="text-xs font-semibold text-emerald-300">Firebase Firestore Real-time Sync Active</p>
              <p className="text-[11px] text-slate-400">
                Connected to project: <code className="text-slate-300 font-mono">edutrack-52e6c</code> • Collections: <code className="text-slate-300 font-mono">schools</code>, <code className="text-slate-300 font-mono">plans</code>, <code className="text-slate-300 font-mono">communications</code>, <code className="text-slate-300 font-mono">invoices</code>
              </p>
            </div>
          </div>
          {pendingApprovals.length > 0 && (
            <div
              onClick={() => {
                setActiveTab('schools');
                setStatusFilter('PENDING_APPROVAL');
              }}
              className="cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-all text-xs font-medium"
            >
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>{pendingApprovals.length} School Registration{pendingApprovals.length > 1 ? 's' : ''} Awaiting Approval</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          )}
        </div>

        {/* Real-time Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Total Schools */}
          <div className="glass-card p-4 rounded-2xl border border-slate-900/60 bg-slate-900/30 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Total Registered</span>
              <Building2 className="w-4 h-4 text-brand-400" />
            </div>
            <div>
              <div className="text-2xl font-black text-white">{totalSchoolsCount}</div>
              <p className="text-[11px] text-slate-500 mt-0.5">School Tenants</p>
            </div>
          </div>

          {/* Pending Approvals */}
          <div
            onClick={() => {
              setActiveTab('schools');
              setStatusFilter('PENDING_APPROVAL');
            }}
            className={`cursor-pointer glass-card p-4 rounded-2xl border transition-all ${
              pendingApprovals.length > 0
                ? 'border-amber-500/40 bg-amber-950/20 hover:border-amber-500/60'
                : 'border-slate-900/60 bg-slate-900/30'
            } flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium text-amber-400">Pending Approvals</span>
              <UserCheck className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="text-2xl font-black text-amber-400">{pendingApprovals.length}</div>
              <p className="text-[11px] text-amber-400/70 mt-0.5">Click to review queue</p>
            </div>
          </div>

          {/* Active Paid */}
          <div className="glass-card p-4 rounded-2xl border border-slate-900/60 bg-slate-900/30 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Active Paid</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="text-2xl font-black text-emerald-400">{activePaidCount}</div>
              <p className="text-[11px] text-slate-500 mt-0.5">Annual / Monthly</p>
            </div>
          </div>

          {/* Active Trials */}
          <div className="glass-card p-4 rounded-2xl border border-slate-900/60 bg-slate-900/30 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">14-Day Trials</span>
              <Clock className="w-4 h-4 text-sky-400" />
            </div>
            <div>
              <div className="text-2xl font-black text-sky-400">{activeTrialsCount}</div>
              <p className="text-[11px] text-slate-500 mt-0.5">Evaluating SaaS</p>
            </div>
          </div>

          {/* Expired / Past Due */}
          <div
            onClick={() => {
              setActiveTab('schools');
              setStatusFilter('EXPIRED');
            }}
            className={`cursor-pointer glass-card p-4 rounded-2xl border transition-all ${
              expiredCount > 0
                ? 'border-rose-500/30 bg-rose-950/20 hover:border-rose-500/50'
                : 'border-slate-900/60 bg-slate-900/30'
            } flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium text-rose-400">Expired / Grace</span>
              <ShieldAlert className="w-4 h-4 text-rose-400" />
            </div>
            <div>
              <div className="text-2xl font-black text-rose-400">{expiredCount}</div>
              <p className="text-[11px] text-rose-400/70 mt-0.5">Needs renewal</p>
            </div>
          </div>

          {/* Platform Revenue */}
          <div className="glass-card p-4 rounded-2xl border border-slate-900/60 bg-slate-900/30 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Annual Revenue</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="text-2xl font-black text-white">₹{(totalRevenue / 100000).toFixed(1)}L</div>
              <p className="text-[11px] text-slate-500 mt-0.5">Recurring SaaS</p>
            </div>
          </div>
        </div>

        {/* Dedicated Pending Registrations Banner if any pending */}
        {pendingApprovals.length > 0 && (
          <div className="glass-card rounded-3xl border border-amber-500/30 bg-amber-950/15 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">School Registration Approvals Required</h2>
                  <p className="text-xs text-amber-300/80">
                    Schools that registered through the portal must be approved before their administration staff can start using the portal.
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                {pendingApprovals.length} Pending
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingApprovals.map((school) => (
                <div
                  key={school.id}
                  className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between gap-3 hover:border-amber-500/40 transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-bold text-white">{school.name}</h3>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        PENDING
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      <span className="text-slate-500">Subdomain:</span> <code className="text-indigo-400 font-mono">{school.subDomain}</code> •{' '}
                      <span className="text-slate-500">Contact:</span> {school.adminName || 'Admin'} ({school.contactPhone || school.contactEmail})
                    </p>
                    {school.address && (
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{school.address}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-900">
                    <button
                      onClick={() => openApprovalModal(school)}
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-md shadow-emerald-500/10 flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Review & Approve</span>
                    </button>
                    <button
                      onClick={() => {
                        setApprovingSchool(school);
                        setShowRejectBox(true);
                        setShowApprovalModal(true);
                      }}
                      className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-rose-950/50 hover:text-rose-400 text-slate-400 text-xs font-medium border border-slate-800 transition-all"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-900 pb-4">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('schools')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'schools'
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Schools & Tenants ({schools.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('comms')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'comms'
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Megaphone className="w-4 h-4" />
              <span>Broadcast Communications ({comms.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('plans')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'plans'
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Plans & Feature ACLs</span>
            </button>

            <button
              onClick={() => setActiveTab('invoices')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'invoices'
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Invoices & Billing</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'settings'
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Gateways & Platform</span>
            </button>
          </div>
        </div>

        {/* TAB 1: SCHOOLS & TENANTS */}
        {activeTab === 'schools' && (
          <div className="space-y-6">
            {/* Search, Filter, and Action Controls */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search by school name, subdomain, admin contact..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 bg-slate-900/60 p-1 rounded-xl border border-slate-800 text-xs">
                  <Filter className="w-3.5 h-3.5 text-slate-500 ml-1.5" />
                  {['ALL', 'PENDING_APPROVAL', 'ACTIVE', 'TRIAL', 'EXPIRED'].map((filterKey) => (
                    <button
                      key={filterKey}
                      onClick={() => setStatusFilter(filterKey)}
                      className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                        statusFilter === filterKey
                          ? 'bg-brand-600 text-white shadow'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {filterKey.replace('_', ' ')}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add School Tenant</span>
                </button>
              </div>
            </div>

            {/* School Tenants Table */}
            <div className="glass-card rounded-2xl border border-slate-900 bg-slate-900/30 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800/80 bg-slate-900/60 text-slate-400 font-semibold uppercase tracking-wider">
                      <th className="py-3.5 px-4">School Institution</th>
                      <th className="py-3.5 px-4">Subdomain & Routing</th>
                      <th className="py-3.5 px-4">Plan & Tier</th>
                      <th className="py-3.5 px-4">Subscription Status</th>
                      <th className="py-3.5 px-4">Expiry Date</th>
                      <th className="py-3.5 px-4 text-right">Actions & Overrides</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900 text-slate-300">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-500">
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-6 h-6 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
                            <span>Connecting to Firebase Firestore live stream...</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredSchools.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-500">
                          No school tenants found matching your filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredSchools.map((school) => {
                        const isExpired =
                          school.status === 'EXPIRED' ||
                          school.status === 'PAST_DUE' ||
                          (school.subscription?.expiryDate &&
                            new Date(school.subscription.expiryDate).getTime() < Date.now());

                        return (
                          <tr key={school.id} className="hover:bg-slate-900/40 transition-colors">
                            <td 
                              className="py-3.5 px-4 cursor-pointer group"
                              onClick={() => handleOpenDetails(school)}
                            >
                              <div className="font-bold text-white text-sm group-hover:text-brand-400 flex items-center gap-1.5 transition-colors">
                                <span>{school.name}</span>
                                <Eye className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-brand-400 transition-opacity" />
                              </div>
                              <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                                <span>{school.contactEmail}</span>
                                {school.studentCount ? (
                                  <>
                                    <span>•</span>
                                    <span>{school.studentCount} Students</span>
                                  </>
                                ) : null}
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              <span className="font-mono text-indigo-400 bg-indigo-950/40 border border-indigo-500/20 px-2 py-0.5 rounded">
                                {school.subDomain}.edutrack.com
                              </span>
                            </td>

                            <td className="py-3.5 px-4">
                              <span className="font-bold text-slate-200">
                                {school.subscription?.plan?.name || 'BASIC'}
                              </span>
                              <div className="text-[10px] text-slate-500">
                                ₹{school.subscription?.plan?.price?.toLocaleString('en-IN') || 0} / yr
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              {school.status === 'PENDING_APPROVAL' ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                                  <Clock className="w-3 h-3" />
                                  PENDING APPROVAL
                                </span>
                              ) : isExpired ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                                  <AlertTriangle className="w-3 h-3" />
                                  {school.status}
                                </span>
                              ) : school.subscription?.plan?.name === 'TRIAL' ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/30">
                                  <Clock className="w-3 h-3" />
                                  TRIAL EVALUATION
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                  <CheckCircle className="w-3 h-3" />
                                  ACTIVE
                                </span>
                              )}
                            </td>

                            <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                              {school.subscription?.expiryDate
                                ? new Date(school.subscription.expiryDate).toLocaleDateString('en-IN', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })
                                : 'Permanent'}
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {school.status === 'PENDING_APPROVAL' ? (
                                  <button
                                    onClick={() => openApprovalModal(school)}
                                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-sm shadow-emerald-500/20 transition-all flex items-center gap-1"
                                  >
                                    <Check className="w-3 h-3" />
                                    <span>Approve</span>
                                  </button>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => handleOpenDetails(school)}
                                      title="View comprehensive school tenant details"
                                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs transition-colors"
                                    >
                                      <Eye className="w-3.5 h-3.5 text-sky-400" />
                                    </button>
                                    <button
                                      onClick={() => handleOpenEdit(school)}
                                      title="Edit school details and subscription"
                                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs transition-colors"
                                    >
                                      <Edit className="w-3.5 h-3.5 text-amber-400" />
                                    </button>
                                    <button
                                      onClick={() => handleQuickExtend(school)}
                                      title="Add 14 days grace validity to this school"
                                      className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs transition-colors font-mono"
                                    >
                                      +14d
                                    </button>
                                    <button
                                      onClick={() => openAdjustModal(school)}
                                      title="Adjust Plan"
                                      className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition-colors"
                                    >
                                      Plan
                                    </button>
                                    <button
                                      onClick={() => handleOpenDelete(school)}
                                      title="Delete school tenant permanently from Firestore"
                                      className="p-1.5 rounded-lg bg-rose-950/30 hover:bg-rose-900/50 text-rose-400 border border-rose-500/20 text-xs transition-colors"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BROADCAST COMMUNICATIONS */}
        {activeTab === 'comms' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">School Announcement Broadcast Hub</h2>
                <p className="text-xs text-slate-400">
                  Send high-priority notifications, system maintenance alerts, or policy updates directly to school principals and administrators.
                </p>
              </div>
              <button
                onClick={() => setShowCommModal(true)}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg shadow-brand-500/20 flex items-center gap-2 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>New Announcement</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {comms.map((comm) => (
                <div
                  key={comm.id}
                  className="glass-card rounded-2xl border border-slate-900 bg-slate-900/30 p-5 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white">{comm.title}</h3>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            comm.priority === 'URGENT'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                              : comm.priority === 'HIGH'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {comm.priority}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        To: <span className="text-indigo-400">{comm.targetSchoolName || comm.targetSchoolId}</span> • Channel: {comm.channel}
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-500 shrink-0 font-mono">
                      {new Date(comm.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-900">
                    {comm.message}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: PLANS & FEATURE ACLS */}
        {activeTab === 'plans' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-white">Subscription Plan Tiers & Feature ACLs</h2>
              <p className="text-xs text-slate-400">
                Configure module entitlements and pricing for each tier. Updates apply automatically to all schools subscribed to that tier.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="glass-card rounded-2xl border border-slate-900 bg-slate-900/30 p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-base font-black text-white">{plan.name}</h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20">
                        {plan.billingCycle}
                      </span>
                    </div>

                    <div className="mb-4">
                      <span className="text-2xl font-black text-white">₹{plan.price.toLocaleString('en-IN')}</span>
                      <span className="text-xs text-slate-500"> / year</span>
                    </div>

                    <div className="space-y-1.5 pt-3 border-t border-slate-800/80">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                        Enabled Modules ({plan.features.length})
                      </span>
                      {availableModules.map((mod) => {
                        const isEnabled = plan.features.includes(mod.key);
                        return (
                          <div
                            key={mod.key}
                            className={`flex items-center gap-2 text-xs ${
                              isEnabled ? 'text-slate-200' : 'text-slate-600 line-through'
                            }`}
                          >
                            {isEnabled ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            ) : (
                              <X className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                            )}
                            <span className="truncate">{mod.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    onClick={() => startEditPlan(plan)}
                    className="mt-6 w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Edit Tier ACL & Pricing</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: INVOICES & BILLING */}
        {activeTab === 'invoices' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Platform SaaS Invoices & Payment Ledger</h2>
                <p className="text-xs text-slate-400">
                  Track recurring platform revenue, manually issue institutional invoices, or audit online Razorpay/Stripe charges.
                </p>
              </div>
              <button
                onClick={() => setShowInvoiceModal(true)}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg shadow-brand-500/20 flex items-center gap-2 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Create Manual Invoice</span>
              </button>
            </div>

            <div className="glass-card rounded-2xl border border-slate-900 bg-slate-900/30 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800/80 bg-slate-900/60 text-slate-400 font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4">Invoice #</th>
                      <th className="py-3 px-4">School Institution</th>
                      <th className="py-3 px-4">Plan</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Due Date</th>
                      <th className="py-3 px-4">Gateway</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900 text-slate-300">
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-indigo-400">{inv.invoiceNumber}</td>
                        <td className="py-3 px-4 font-semibold text-white">{inv.schoolName}</td>
                        <td className="py-3 px-4 text-slate-400">{inv.plan}</td>
                        <td className="py-3 px-4 font-bold text-white">₹{inv.amount.toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              inv.status === 'PAID'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : inv.status === 'OVERDUE'
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-400">{inv.dueDate}</td>
                        <td className="py-3 px-4 font-mono text-slate-500">{inv.gateway}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: GATEWAYS & SETTINGS */}
        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-4xl">
            <div>
              <h2 className="text-base font-bold text-white">Platform Settings & Payment Gateways</h2>
              <p className="text-xs text-slate-400">
                Configure primary collection gateways, company invoicing GST, and platform credentials.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Razorpay Gateway */}
              <div className="glass-card rounded-2xl border border-slate-900 bg-slate-900/30 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CreditCard className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-sm font-bold text-white">Razorpay (India UPI / Cards)</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    ACTIVE
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Key ID</label>
                    <input
                      type="text"
                      readOnly
                      value="rzp_live_99a8x001EduKey"
                      className="w-full font-mono bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-slate-300"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Key Secret</label>
                    <input
                      type="password"
                      readOnly
                      value="••••••••••••••••"
                      className="w-full font-mono bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-slate-300"
                    />
                  </div>
                </div>
              </div>

              {/* Stripe Gateway */}
              <div className="glass-card rounded-2xl border border-slate-900 bg-slate-900/30 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Globe className="w-5 h-5 text-brand-400" />
                    <h3 className="text-sm font-bold text-white">Stripe (International Cards)</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    ACTIVE
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Publishable Key</label>
                    <input
                      type="text"
                      readOnly
                      value="pk_live_51M001EduTrackStripe"
                      className="w-full font-mono bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-slate-300"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Secret Key</label>
                    <input
                      type="password"
                      readOnly
                      value="••••••••••••••••"
                      className="w-full font-mono bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-slate-300"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: APPROVAL REVIEW MODAL */}
      {showApprovalModal && approvingSchool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Review School Registration</h3>
                <p className="text-xs text-slate-400">Institution: {approvingSchool.name}</p>
              </div>
              <button
                onClick={() => setShowApprovalModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2 text-slate-300">
                <div>
                  <span className="text-slate-500 block">Subdomain:</span>
                  <span className="font-mono text-indigo-400">{approvingSchool.subDomain}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Admin Name:</span>
                  <span className="font-semibold">{approvingSchool.adminName || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Contact Phone:</span>
                  <span>{approvingSchool.contactPhone || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Email:</span>
                  <span>{approvingSchool.contactEmail}</span>
                </div>
              </div>
              {approvingSchool.address && (
                <div className="pt-2 border-t border-slate-900">
                  <span className="text-slate-500 block">Address:</span>
                  <span className="text-slate-300">{approvingSchool.address}</span>
                </div>
              )}
            </div>

            {!showRejectBox ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                    Assign Subscription Plan Tier
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['TRIAL', 'BASIC', 'PREMIUM', 'ENTERPRISE'] as const).map((plan) => (
                      <button
                        key={plan}
                        type="button"
                        onClick={() => setApprovalPlan(plan)}
                        className={`p-3 rounded-xl border text-xs font-semibold transition-all text-left ${
                          approvalPlan === plan
                            ? 'bg-brand-600/20 border-brand-500 text-brand-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="font-bold">{plan}</div>
                        <div className="text-[10px] text-slate-500">
                          {plan === 'TRIAL' ? '14 Days Free' : 'Annual License'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-3">
                  <button
                    onClick={handleApprove}
                    className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve & Activate School</span>
                  </button>
                  <button
                    onClick={() => setShowRejectBox(true)}
                    className="px-4 py-3 rounded-xl bg-slate-950 hover:bg-rose-950/50 hover:text-rose-400 text-slate-400 font-medium text-sm border border-slate-800 transition-all"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-rose-400 uppercase tracking-wider block mb-2">
                    Reason for Rejection
                  </label>
                  <textarea
                    rows={3}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="e.g. Incomplete accreditation documents or unverified contact information..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleReject}
                    className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm shadow-lg shadow-rose-500/20 transition-all"
                  >
                    Confirm Rejection
                  </button>
                  <button
                    onClick={() => setShowRejectBox(false)}
                    className="px-4 py-3 rounded-xl bg-slate-950 text-slate-400 text-sm border border-slate-800"
                  >
                    Back
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: ADJUST PLAN MODAL */}
      {showAdjustModal && selectedSchool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Adjust Subscription & Validity</h3>
                <p className="text-xs text-slate-400">{selectedSchool.name}</p>
              </div>
              <button
                onClick={() => setShowAdjustModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjust} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Subscription Plan</label>
                <select
                  value={adjustPlan}
                  onChange={(e) => setAdjustPlan(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-brand-500"
                >
                  <option value="TRIAL">TRIAL (14-Day Free Evaluation)</option>
                  <option value="BASIC">BASIC (Standard Academic)</option>
                  <option value="PREMIUM">PREMIUM (Full Featured)</option>
                  <option value="ENTERPRISE">ENTERPRISE (All Modules + Hostel + Payroll)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Status Override</label>
                <select
                  value={adjustStatus}
                  onChange={(e) => setAdjustStatus(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-brand-500"
                >
                  <option value="ACTIVE">ACTIVE (Full Access)</option>
                  <option value="PAST_DUE">PAST_DUE (Grace Warning Banner)</option>
                  <option value="EXPIRED">EXPIRED (Lockout Screen)</option>
                  <option value="SUSPENDED">SUSPENDED (Disabled by Admin)</option>
                  <option value="PENDING_APPROVAL">PENDING_APPROVAL</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Expiration Date</label>
                <input
                  type="date"
                  value={adjustExpiry}
                  onChange={(e) => setAdjustExpiry(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-brand-500 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Max Student Capacity</label>
                <input
                  type="number"
                  value={adjustStudentCount}
                  onChange={(e) => setAdjustStudentCount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="pt-3 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
                >
                  {modalSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save to Firebase</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-950 text-slate-400 border border-slate-800"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: BROADCAST COMMUNICATION MODAL */}
      {showCommModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Broadcast Announcement</h3>
                <p className="text-xs text-slate-400">Dispatch message to school administration panels</p>
              </div>
              <button
                onClick={() => setShowCommModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendComm} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Recipient Target</label>
                <select
                  value={commTargetSchoolId}
                  onChange={(e) => setCommTargetSchoolId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-brand-500"
                >
                  <option value="ALL">All Registered Schools (Platform Broadcast)</option>
                  {schools.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.subDomain})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Priority Level</label>
                <select
                  value={commPriority}
                  onChange={(e) => setCommPriority(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-brand-500"
                >
                  <option value="NORMAL">NORMAL (Informational)</option>
                  <option value="HIGH">HIGH (Important System Update)</option>
                  <option value="URGENT">URGENT (Action Required Immediately)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Announcement Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scheduled System Upgrade on Sunday"
                  value={commTitle}
                  onChange={(e) => setCommTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Notice Message</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Type message content here..."
                  value={commMessage}
                  onChange={(e) => setCommMessage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={commSubmitting}
                  className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
                >
                  {commSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send via Firebase Live Feed</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCommModal(false)}
                  className="px-4 py-3 rounded-xl bg-slate-950 text-slate-400 border border-slate-800"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: MANUAL INVOICE MODAL */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Issue Manual Platform Invoice</h3>
                <p className="text-xs text-slate-400">Generate billable subscription record in Firestore</p>
              </div>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Select School Institution</label>
                <select
                  required
                  value={invSchoolId}
                  onChange={(e) => setInvSchoolId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-brand-500"
                >
                  <option value="">-- Choose a School --</option>
                  {schools.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.subDomain})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Plan</label>
                <select
                  value={invPlan}
                  onChange={(e) => setInvPlan(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-brand-500"
                >
                  <option value="BASIC">BASIC (₹24,999)</option>
                  <option value="PREMIUM">PREMIUM (₹49,999)</option>
                  <option value="ENTERPRISE">ENTERPRISE (₹74,999)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Amount (INR)</label>
                <input
                  type="number"
                  required
                  value={invAmount}
                  onChange={(e) => setInvAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Due Date</label>
                <input
                  type="date"
                  value={invDueDate}
                  onChange={(e) => setInvDueDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-brand-500 font-mono"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={invSubmitting}
                  className="flex-1 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
                >
                  {invSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Create Invoice Record</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowInvoiceModal(false)}
                  className="px-4 py-3 rounded-xl bg-slate-950 text-slate-400 border border-slate-800"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT PLAN MODAL */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Edit Plan Tier: {selectedPlan.name}</h3>
                <p className="text-xs text-slate-400">Configure pricing and toggle feature module access</p>
              </div>
              <button
                onClick={() => setSelectedPlan(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Annual Price (INR)</label>
                <input
                  type="number"
                  required
                  value={editPlanPrice}
                  onChange={(e) => setEditPlanPrice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-2 font-semibold">
                  Module Feature Flags (ACL)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                  {availableModules.map((mod) => {
                    const checked = editPlanFeatures.includes(mod.key);
                    return (
                      <button
                        key={mod.key}
                        type="button"
                        onClick={() => toggleFeature(mod.key)}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                          checked
                            ? 'bg-brand-600/20 border-brand-500/40 text-brand-300'
                            : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                            checked ? 'bg-brand-500 border-brand-500 text-white' : 'border-slate-700'
                          }`}
                        >
                          {checked && <Check className="w-3 h-3" />}
                        </div>
                        <span className="truncate">{mod.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={planSubmitting}
                  className="flex-1 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
                >
                  {planSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save to Firebase</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPlan(null)}
                  className="px-4 py-3 rounded-xl bg-slate-950 text-slate-400 border border-slate-800"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: COMPREHENSIVE SCHOOL DETAILS MODAL */}
      {showDetailsModal && detailedSchool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 my-8">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-white tracking-tight">{detailedSchool.name}</h3>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${
                      detailedSchool.status === 'ACTIVE'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : detailedSchool.status === 'PENDING_APPROVAL'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : detailedSchool.subscription?.plan?.name === 'TRIAL'
                        ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                        : detailedSchool.status === 'SUSPENDED'
                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                    {detailedSchool.status}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                  <span className="font-mono text-indigo-400 bg-indigo-950/40 border border-indigo-500/20 px-2 py-0.5 rounded">
                    {detailedSchool.subDomain}.edutrack.com
                  </span>
                  <span>•</span>
                  <span className="font-mono text-slate-500">ID: {detailedSchool.id}</span>
                </div>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 rounded-xl bg-slate-950 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-2xl">
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Enrolled Students</div>
                <div className="text-xl font-bold text-white mt-1 flex items-baseline gap-1.5">
                  <Users className="w-4 h-4 text-brand-400" />
                  <span>{detailedSchool.studentCount?.toLocaleString('en-IN') || 0}</span>
                </div>
              </div>

              <div className="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-2xl">
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Faculty & Staff</div>
                <div className="text-xl font-bold text-white mt-1 flex items-baseline gap-1.5">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <span>{detailedSchool.staffCount?.toLocaleString('en-IN') || 0}</span>
                </div>
              </div>

              <div className="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-2xl">
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Current Plan</div>
                <div className="text-base font-bold text-indigo-400 mt-1 truncate">
                  {detailedSchool.subscription?.plan?.name || 'BASIC'}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  ₹{detailedSchool.subscription?.plan?.price?.toLocaleString('en-IN') || 0}/yr
                </div>
              </div>

              <div className="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-2xl">
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Plan Expiry</div>
                <div className="text-sm font-bold text-slate-200 mt-1 font-mono">
                  {detailedSchool.subscription?.expiryDate
                    ? new Date(detailedSchool.subscription.expiryDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })
                    : 'Permanent'}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {detailedSchool.subscription?.expiryDate &&
                  new Date(detailedSchool.subscription.expiryDate).getTime() < Date.now() ? (
                    <span className="text-rose-400 font-bold">Past Due / Expired</span>
                  ) : (
                    <span className="text-emerald-400">Valid</span>
                  )}
                </div>
              </div>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Box 1: Administration & Contact */}
              <div className="bg-slate-950/40 border border-slate-800/70 p-4 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-slate-300 font-bold pb-1 border-b border-slate-800/60">
                  <Building2 className="w-4 h-4 text-brand-400" />
                  <span>Administration & Contact</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Principal / Admin:</span>
                    <span className="text-slate-200 font-medium">{detailedSchool.adminName || 'Not designated'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Contact Email:</span>
                    <a href={`mailto:${detailedSchool.contactEmail}`} className="text-brand-400 hover:underline">
                      {detailedSchool.contactEmail}
                    </a>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Contact Phone:</span>
                    <span className="text-slate-200 font-mono">{detailedSchool.contactPhone || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Affiliation / Board:</span>
                    <span className="text-slate-200 font-medium">{detailedSchool.schoolType || 'General'}</span>
                  </div>
                </div>
              </div>

              {/* Box 2: Location & Address */}
              <div className="bg-slate-950/40 border border-slate-800/70 p-4 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-slate-300 font-bold pb-1 border-b border-slate-800/60">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>Campus Location & Address</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-slate-500 block mb-0.5">Street Address:</span>
                    <span className="text-slate-200 font-medium block">
                      {detailedSchool.address || 'Address not registered'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <span className="text-slate-500">City / District:</span>
                      <p className="text-slate-200 font-medium">{detailedSchool.city || '—'}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">State / Pincode:</span>
                      <p className="text-slate-200 font-medium">
                        {detailedSchool.state || '—'} {detailedSchool.pincode ? `(${detailedSchool.pincode})` : ''}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Box 3: Subscription & Billing */}
              <div className="bg-slate-950/40 border border-slate-800/70 p-4 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-slate-300 font-bold pb-1 border-b border-slate-800/60">
                  <CreditCard className="w-4 h-4 text-indigo-400" />
                  <span>Subscription & Billing</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Subscription Status:</span>
                    <span className="font-bold text-slate-200">{detailedSchool.subscription?.status || 'ACTIVE'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Billing Interval:</span>
                    <span className="text-slate-200">{detailedSchool.subscription?.billingCycle || 'ANNUAL'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Annual Tier Price:</span>
                    <span className="text-emerald-400 font-bold">
                      ₹{detailedSchool.subscription?.plan?.price?.toLocaleString('en-IN') || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Box 4: Registration & Lifecycle */}
              <div className="bg-slate-950/40 border border-slate-800/70 p-4 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-slate-300 font-bold pb-1 border-b border-slate-800/60">
                  <Calendar className="w-4 h-4 text-sky-400" />
                  <span>Registration & Audit</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Registration Source:</span>
                    <span className="font-mono text-slate-300">{detailedSchool.registrationSource || 'PORTAL'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Registered On:</span>
                    <span className="text-slate-300 font-mono">
                      {detailedSchool.createdAt
                        ? new Date(detailedSchool.createdAt).toLocaleDateString('en-IN')
                        : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Approved On:</span>
                    <span className="text-slate-300 font-mono">
                      {detailedSchool.approvedAt
                        ? new Date(detailedSchool.approvedAt).toLocaleDateString('en-IN')
                        : 'Pre-provisioned'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleOpenEdit(detailedSchool);
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Full Details</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    openAdjustModal(detailedSchool);
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Adjust Plan</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickExtend(detailedSchool)}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold transition-colors"
                >
                  +14 Days
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenDelete(detailedSchool)}
                  className="px-4 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete School</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-950 text-slate-400 hover:text-white border border-slate-800 text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT SCHOOL DETAILS MODAL */}
      {showEditSchoolModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-5 my-8">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white">Edit School Tenant</h3>
                <p className="text-xs text-slate-400">Update school metadata, capacity, and subscription status</p>
              </div>
              <button
                onClick={() => setShowEditSchoolModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditSchool} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">School Name</label>
                  <input
                    type="text"
                    required
                    value={editSchoolForm.name}
                    onChange={(e) => setEditSchoolForm({ ...editSchoolForm, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Subdomain Prefix</label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      required
                      value={editSchoolForm.subDomain}
                      onChange={(e) => setEditSchoolForm({ ...editSchoolForm, subDomain: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-l-xl p-2.5 text-slate-200 focus:outline-none focus:border-brand-500 font-mono"
                    />
                    <span className="bg-slate-800 border border-l-0 border-slate-800 px-3 py-2.5 rounded-r-xl text-slate-400 font-mono">
                      .edutrack.com
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Principal / Admin Name</label>
                  <input
                    type="text"
                    value={editSchoolForm.adminName}
                    onChange={(e) => setEditSchoolForm({ ...editSchoolForm, adminName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Contact Email</label>
                  <input
                    type="email"
                    required
                    value={editSchoolForm.contactEmail}
                    onChange={(e) => setEditSchoolForm({ ...editSchoolForm, contactEmail: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Contact Phone</label>
                  <input
                    type="text"
                    value={editSchoolForm.contactPhone}
                    onChange={(e) => setEditSchoolForm({ ...editSchoolForm, contactPhone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-brand-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">School Affiliation / Type</label>
                  <input
                    type="text"
                    value={editSchoolForm.schoolType}
                    onChange={(e) => setEditSchoolForm({ ...editSchoolForm, schoolType: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-slate-400 block mb-1 font-semibold">Street Address</label>
                  <input
                    type="text"
                    value={editSchoolForm.address}
                    onChange={(e) => setEditSchoolForm({ ...editSchoolForm, address: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">City</label>
                  <input
                    type="text"
                    value={editSchoolForm.city}
                    onChange={(e) => setEditSchoolForm({ ...editSchoolForm, city: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">State & Pincode</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="State"
                      value={editSchoolForm.state}
                      onChange={(e) => setEditSchoolForm({ ...editSchoolForm, state: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-brand-500"
                    />
                    <input
                      type="text"
                      placeholder="Pincode"
                      value={editSchoolForm.pincode}
                      onChange={(e) => setEditSchoolForm({ ...editSchoolForm, pincode: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-brand-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Student Headcount</label>
                  <input
                    type="number"
                    value={editSchoolForm.studentCount}
                    onChange={(e) => setEditSchoolForm({ ...editSchoolForm, studentCount: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Staff / Faculty Count</label>
                  <input
                    type="number"
                    value={editSchoolForm.staffCount}
                    onChange={(e) => setEditSchoolForm({ ...editSchoolForm, staffCount: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Subscription Plan</label>
                  <select
                    value={editSchoolForm.planName}
                    onChange={(e) => {
                      const newPlan = e.target.value as any;
                      const priceMap: Record<string, number> = { TRIAL: 0, BASIC: 24999, PREMIUM: 49999, ENTERPRISE: 74999 };
                      setEditSchoolForm({
                        ...editSchoolForm,
                        planName: newPlan,
                        planPrice: priceMap[newPlan] ?? editSchoolForm.planPrice
                      });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-brand-500"
                  >
                    <option value="TRIAL">TRIAL (14 Days Evaluation)</option>
                    <option value="BASIC">BASIC (Standard Academic)</option>
                    <option value="PREMIUM">PREMIUM (Full Featured)</option>
                    <option value="ENTERPRISE">ENTERPRISE (All Modules)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Plan Fee (INR / yr)</label>
                  <input
                    type="number"
                    value={editSchoolForm.planPrice}
                    onChange={(e) => setEditSchoolForm({ ...editSchoolForm, planPrice: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Account Status</label>
                  <select
                    value={editSchoolForm.status}
                    onChange={(e) => setEditSchoolForm({ ...editSchoolForm, status: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-brand-500"
                  >
                    <option value="ACTIVE">ACTIVE (Full Access)</option>
                    <option value="PENDING_APPROVAL">PENDING_APPROVAL (Under Review)</option>
                    <option value="PAST_DUE">PAST_DUE (Grace Warning Banner)</option>
                    <option value="EXPIRED">EXPIRED (Lockout Screen)</option>
                    <option value="SUSPENDED">SUSPENDED (Disabled by Super Admin)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Expiration Date</label>
                  <input
                    type="date"
                    value={editSchoolForm.expiryDate}
                    onChange={(e) => setEditSchoolForm({ ...editSchoolForm, expiryDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-brand-500 font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditSchoolModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold shadow-lg shadow-brand-500/20 transition-all flex items-center gap-2"
                >
                  {editSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Changes to Firebase</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE SCHOOL CONFIRMATION */}
      {showDeleteModal && deletingSchool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-rose-500/30 rounded-3xl p-6 shadow-2xl space-y-5 text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/10">
              <Trash2 className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-white">Permanently Delete School Tenant?</h3>
              <p className="text-xs text-slate-400">
                You are about to delete <strong className="text-white">{deletingSchool.name}</strong> (<span className="font-mono text-indigo-400">{deletingSchool.subDomain}.edutrack.com</span>).
              </p>
              <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/20 text-[11px] text-rose-300 text-left mt-3">
                ⚠️ Warning: This will permanently purge this school tenant from the live Firebase Firestore database. This action cannot be reversed.
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteSubmitting}
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow-lg shadow-rose-500/20 transition-all flex items-center justify-center gap-2"
              >
                {deleteSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Yes, Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW SCHOOL TENANT */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-5 my-8">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white">Add New School Tenant</h3>
                <p className="text-xs text-slate-400">Directly provision a new school institution into Firebase Firestore</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSchoolSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">School Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Oxford Cambridge International"
                    value={createSchoolForm.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      const autoSub = name.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 20);
                      setCreateSchoolForm({ ...createSchoolForm, name, subDomain: createSchoolForm.subDomain || autoSub });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Custom Subdomain *</label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      required
                      placeholder="oxford-intl"
                      value={createSchoolForm.subDomain}
                      onChange={(e) => setCreateSchoolForm({ ...createSchoolForm, subDomain: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-l-xl p-2.5 text-slate-200 focus:outline-none focus:border-brand-500 font-mono"
                    />
                    <span className="bg-slate-800 border border-l-0 border-slate-800 px-3 py-2.5 rounded-r-xl text-slate-400 font-mono">
                      .edutrack.com
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Principal / Admin Name</label>
                  <input
                    type="text"
                    placeholder="Dr. Rajesh Varma"
                    value={createSchoolForm.adminName}
                    onChange={(e) => setCreateSchoolForm({ ...createSchoolForm, adminName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Contact Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="admin@oxfordinternational.edu"
                    value={createSchoolForm.contactEmail}
                    onChange={(e) => setCreateSchoolForm({ ...createSchoolForm, contactEmail: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Contact Phone</label>
                  <input
                    type="text"
                    placeholder="+91 98765 12345"
                    value={createSchoolForm.contactPhone}
                    onChange={(e) => setCreateSchoolForm({ ...createSchoolForm, contactPhone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-brand-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">School Affiliation / Board</label>
                  <input
                    type="text"
                    placeholder="e.g. CBSE Senior Secondary"
                    value={createSchoolForm.schoolType}
                    onChange={(e) => setCreateSchoolForm({ ...createSchoolForm, schoolType: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-slate-400 block mb-1 font-semibold">Campus Address</label>
                  <input
                    type="text"
                    placeholder="Sector 62, Electronic City"
                    value={createSchoolForm.address}
                    onChange={(e) => setCreateSchoolForm({ ...createSchoolForm, address: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">City</label>
                  <input
                    type="text"
                    placeholder="Bangalore"
                    value={createSchoolForm.city}
                    onChange={(e) => setCreateSchoolForm({ ...createSchoolForm, city: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">State</label>
                  <input
                    type="text"
                    placeholder="Karnataka"
                    value={createSchoolForm.state}
                    onChange={(e) => setCreateSchoolForm({ ...createSchoolForm, state: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Initial Student Capacity</label>
                  <input
                    type="number"
                    value={createSchoolForm.studentCount}
                    onChange={(e) => setCreateSchoolForm({ ...createSchoolForm, studentCount: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Subscription Plan</label>
                  <select
                    value={createSchoolForm.planName}
                    onChange={(e) => setCreateSchoolForm({ ...createSchoolForm, planName: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-brand-500"
                  >
                    <option value="TRIAL">TRIAL (14 Days Evaluation)</option>
                    <option value="BASIC">BASIC (Standard Academic)</option>
                    <option value="PREMIUM">PREMIUM (Full Featured)</option>
                    <option value="ENTERPRISE">ENTERPRISE (All Modules)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
                >
                  {createSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Provision in Firestore</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
