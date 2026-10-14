'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Mail,
  User,
  KeyRound,
  CheckCircle2,
  XCircle,
  Pencil,
  Trash2,
  Check,
  RefreshCw,
  LayoutDashboard,
  ShoppingBag,
  Package,
  Tags,
  AlertCircle,
  Eye,
  Edit3,
} from 'lucide-react';
import { toast } from 'sonner';

interface AdminPermissions {
  dashboard: boolean;
  orders: boolean;
  orders_edit?: boolean;
  products: boolean;
  products_edit?: boolean;
  categories: boolean;
  categories_edit?: boolean;
}

interface TeamMember {
  id: string;
  email: string;
  name: string;
  role: string;
  isSuperAdmin: boolean;
  permissions: AdminPermissions;
  createdAt?: string;
  updatedAt?: string;
}

const defaultPermissions: AdminPermissions = {
  dashboard: true,
  orders: true,
  orders_edit: true,
  products: true,
  products_edit: true,
  categories: true,
  categories_edit: true,
};

const permissionConfig = [
  {
    key: 'dashboard' as const,
    label: 'Dashboard Overview',
    description: 'View sales analytics, revenue charts, and store statistics',
    icon: LayoutDashboard,
    color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    hasEditOption: false,
  },
  {
    key: 'orders' as const,
    editKey: 'orders_edit' as const,
    label: 'Customer Orders',
    description: 'View customer orders, delivery addresses, and order items',
    icon: ShoppingBag,
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    hasEditOption: true,
    editLabel: 'Update Status & Process Orders',
    readOnlyLabel: 'View Orders Only (No Status Changes)',
  },
  {
    key: 'products' as const,
    editKey: 'products_edit' as const,
    label: 'Products Catalog',
    description: 'Browse product listings, pricing, and stock levels',
    icon: Package,
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    hasEditOption: true,
    editLabel: 'Add, Edit & Delete Products',
    readOnlyLabel: 'View Products Only (No Editing/Adding)',
  },
  {
    key: 'categories' as const,
    editKey: 'categories_edit' as const,
    label: 'Categories Management',
    description: 'Browse product categories and classifications',
    icon: Tags,
    color: 'text-purple-600 bg-purple-50 border-purple-200',
    hasEditOption: true,
    editLabel: 'Add, Edit & Delete Categories',
    readOnlyLabel: 'View Categories Only (No Modifications)',
  },
];

export default function AdminTeamPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formEmail, setFormEmail] = useState('');
  const [formName, setFormName] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formPermissions, setFormPermissions] = useState<AdminPermissions>(defaultPermissions);

  const fetchTeam = async () => {
    try {
      const res = await fetch('/api/admin/team');
      const data = await res.json();
      if (data.success && data.users) {
        setTeamMembers(data.users);
      } else {
        toast.error(data.message || 'Failed to load team members');
      }
    } catch {
      toast.error('Network error loading team');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/admin/auth/me');
      const data = await res.json();
      if (data.success && data.user) {
        setCurrentUserEmail(data.user.email);
      }
    } catch {
      // Ignored
    }
  };

  useEffect(() => {
    fetchTeam();
    fetchCurrentUser();
  }, []);

  const openAddModal = () => {
    setEditingMember(null);
    setFormEmail('');
    setFormName('');
    setFormPassword('');
    setFormPermissions({
      dashboard: true,
      orders: true,
      orders_edit: true,
      products: true,
      products_edit: true,
      categories: false,
      categories_edit: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (member: TeamMember) => {
    setEditingMember(member);
    setFormEmail(member.email);
    setFormName(member.name || '');
    setFormPassword('');
    setFormPermissions({
      dashboard: Boolean(member.permissions?.dashboard),
      orders: Boolean(member.permissions?.orders),
      orders_edit: member.permissions?.orders_edit !== undefined ? Boolean(member.permissions?.orders_edit) : true,
      products: Boolean(member.permissions?.products),
      products_edit: member.permissions?.products_edit !== undefined ? Boolean(member.permissions?.products_edit) : true,
      categories: Boolean(member.permissions?.categories),
      categories_edit: member.permissions?.categories_edit !== undefined ? Boolean(member.permissions?.categories_edit) : true,
    });
    setIsModalOpen(true);
  };

  const handleTogglePermission = (key: keyof AdminPermissions) => {
    setFormPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSetPermissionMode = (key: 'orders_edit' | 'products_edit' | 'categories_edit', canEdit: boolean) => {
    setFormPermissions((prev) => ({
      ...prev,
      [key]: canEdit,
    }));
  };

  const handleSelectAll = () => {
    setFormPermissions({
      dashboard: true,
      orders: true,
      orders_edit: true,
      products: true,
      products_edit: true,
      categories: true,
      categories_edit: true,
    });
  };

  const handleDeselectAll = () => {
    setFormPermissions({
      dashboard: false,
      orders: false,
      orders_edit: false,
      products: false,
      products_edit: false,
      categories: false,
      categories_edit: false,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingMember && (!formEmail || !formEmail.includes('@'))) {
      toast.error('Please enter a valid email address.');
      return;
    }

    if (!editingMember && (!formPassword || formPassword.length < 6)) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    if (editingMember && formPassword && formPassword.length < 6) {
      toast.error('New password must be at least 6 characters.');
      return;
    }

    const hasAnyPermission = Object.values(formPermissions).some(Boolean);
    if (!hasAnyPermission && (!editingMember || !editingMember.isSuperAdmin)) {
      toast.error('Please toggle ON at least one permission.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingMember) {
        // Update existing member
        const res = await fetch(`/api/admin/team/${editingMember.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formName,
            password: formPassword || undefined,
            permissions: formPermissions,
          }),
        });

        const data = await res.json();
        if (data.success) {
          toast.success('Permissions updated successfully!');
          setIsModalOpen(false);
          fetchTeam();
        } else {
          toast.error(data.message || 'Failed to update member.');
        }
      } else {
        // Create new member
        const res = await fetch('/api/admin/team', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formEmail,
            name: formName,
            password: formPassword,
            permissions: formPermissions,
          }),
        });

        const data = await res.json();
        if (data.success) {
          toast.success(`Staff member ${data.user.email} added!`);
          setIsModalOpen(false);
          fetchTeam();
        } else {
          toast.error(data.message || 'Failed to add member.');
        }
      }
    } catch {
      toast.error('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMember = async (member: TeamMember) => {
    if (member.isSuperAdmin || member.id === 'admin_root') {
      toast.error('Primary administrator cannot be removed.');
      return;
    }

    if (!confirm(`Are you sure you want to revoke access and remove ${member.email}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/team/${member.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Removed access for ${member.email}`);
        setTeamMembers((prev) => prev.filter((m) => m.id !== member.id));
      } else {
        toast.error(data.message || 'Failed to remove member.');
      }
    } catch {
      toast.error('Error removing staff member.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Header */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Team & Permissions</h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Add staff accounts with specific email & password and toggle what they can access.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setRefreshing(true);
              fetchTeam();
            }}
            disabled={refreshing}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 active:scale-98 transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Staff Member</span>
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Administrators</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{teamMembers.length}</div>
          <div className="text-xs text-slate-500 mt-0.5">Active accounts with panel access</div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Primary Admin</div>
          <div className="text-2xl font-black text-blue-600 mt-1">
            {teamMembers.filter((m) => m.isSuperAdmin).length}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">Full unrestricted privileges</div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Restricted Staff</div>
          <div className="text-2xl font-black text-slate-700 mt-1">
            {teamMembers.filter((m) => !m.isSuperAdmin).length}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">Custom toggle-based access</div>
        </div>
      </div>

      {/* Team Table / Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-extrabold text-base text-slate-900">Admin Staff Accounts</h2>
          <span className="text-xs text-slate-500 font-medium">{teamMembers.length} Accounts Registered</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
            <p className="text-sm font-medium">Loading team members...</p>
          </div>
        ) : teamMembers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-800">No staff accounts found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Add someone with their email and password and grant them access to orders, products, or other sections.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 transition"
              >
                {/* User Info */}
                <div className="flex items-start sm:items-center gap-3.5">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-base shrink-0 shadow-2xs ${
                      member.isSuperAdmin
                        ? 'bg-blue-600 text-white shadow-blue-500/20'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {member.name ? member.name.charAt(0).toUpperCase() : 'A'}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-slate-900 text-sm sm:text-base">{member.name}</span>
                      {member.isSuperAdmin ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Primary Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          Staff Member
                        </span>
                      )}
                      {member.email === currentUserEmail && (
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2 py-0.5 rounded-md">
                          You
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{member.email}</span>
                    </div>
                  </div>
                </div>

                {/* Permissions Badges */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {member.isSuperAdmin ? (
                      <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-xl flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                        Full Access (All Sections)
                      </span>
                    ) : (
                      <>
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-xl border flex items-center gap-1 transition ${
                            member.permissions?.dashboard
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-50 text-slate-400 border-slate-200 opacity-60'
                          }`}
                        >
                          <LayoutDashboard className="w-3 h-3" />
                          Dashboard
                        </span>

                        {member.permissions?.orders ? (
                          <span
                            className={`text-xs font-bold px-2.5 py-1 rounded-xl border flex items-center gap-1.5 transition ${
                              member.permissions.orders_edit !== false
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            <ShoppingBag className="w-3 h-3" />
                            <span>Orders</span>
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider ${
                                member.permissions.orders_edit !== false
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {member.permissions.orders_edit !== false ? 'Edit' : 'View'}
                            </span>
                          </span>
                        ) : (
                          <span className="text-xs font-bold px-2.5 py-1 rounded-xl border flex items-center gap-1 bg-slate-50 text-slate-400 border-slate-200 opacity-60">
                            <ShoppingBag className="w-3 h-3" />
                            Orders
                          </span>
                        )}

                        {member.permissions?.products ? (
                          <span
                            className={`text-xs font-bold px-2.5 py-1 rounded-xl border flex items-center gap-1.5 transition ${
                              member.permissions.products_edit !== false
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            <Package className="w-3 h-3" />
                            <span>Products</span>
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider ${
                                member.permissions.products_edit !== false
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {member.permissions.products_edit !== false ? 'Edit' : 'View'}
                            </span>
                          </span>
                        ) : (
                          <span className="text-xs font-bold px-2.5 py-1 rounded-xl border flex items-center gap-1 bg-slate-50 text-slate-400 border-slate-200 opacity-60">
                            <Package className="w-3 h-3" />
                            Products
                          </span>
                        )}

                        {member.permissions?.categories ? (
                          <span
                            className={`text-xs font-bold px-2.5 py-1 rounded-xl border flex items-center gap-1.5 transition ${
                              member.permissions.categories_edit !== false
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            <Tags className="w-3 h-3" />
                            <span>Categories</span>
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider ${
                                member.permissions.categories_edit !== false
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {member.permissions.categories_edit !== false ? 'Edit' : 'View'}
                            </span>
                          </span>
                        ) : (
                          <span className="text-xs font-bold px-2.5 py-1 rounded-xl border flex items-center gap-1 bg-slate-50 text-slate-400 border-slate-200 opacity-60">
                            <Tags className="w-3 h-3" />
                            Categories
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-auto pt-2 sm:pt-0">
                    <button
                      onClick={() => openEditModal(member)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition shadow-2xs"
                      title="Edit Permissions & Details"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>{member.isSuperAdmin ? 'Edit Profile' : 'Edit Access'}</span>
                    </button>

                    {!member.isSuperAdmin && member.id !== 'admin_root' && (
                      <button
                        onClick={() => handleDeleteMember(member)}
                        className="p-1.5 rounded-xl border border-red-200 bg-white hover:bg-red-50 text-red-600 text-xs font-bold transition shadow-2xs"
                        title="Remove Staff Account"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity"
            onClick={() => !submitting && setIsModalOpen(false)}
          />

          {/* Modal Card */}
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                  {editingMember ? <Pencil className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base sm:text-lg">
                    {editingMember ? `Edit ${editingMember.name || 'Member'}` : 'Add New Staff Member'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editingMember
                      ? 'Update credentials and toggle section permissions.'
                      : 'Provide login credentials and toggle accessible sections.'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                disabled={submitting}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address {editingMember && <span className="text-slate-400 lowercase">(Cannot be changed)</span>}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    disabled={Boolean(editingMember) || submitting}
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="staff@specengineer.in"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Staff Member Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={formName}
                    disabled={submitting}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. John Doe / Order Manager"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    {editingMember ? 'New Password (Optional)' : 'Login Password'}
                  </label>
                  {editingMember && (
                    <span className="text-[11px] text-slate-400">Leave blank to keep current password</span>
                  )}
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required={!editingMember}
                    disabled={submitting}
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder={editingMember ? '•••••••• (unchanged)' : 'Enter strong password (min 6 chars)'}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* SECTION PERMISSIONS (TOGGLE BUTTONS) */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Accessible Sections
                    </span>
                    <p className="text-[11px] text-slate-500">Toggle ON the pages this user is permitted to use.</p>
                  </div>

                  {!editingMember?.isSuperAdmin && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSelectAll}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-800"
                      >
                        All
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={handleDeselectAll}
                        className="text-[11px] font-bold text-slate-500 hover:text-slate-700"
                      >
                        None
                      </button>
                    </div>
                  )}
                </div>

                {editingMember?.isSuperAdmin ? (
                  <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
                    <p className="text-xs text-blue-800 font-semibold leading-relaxed">
                      This is the primary system administrator and retains permanent access to all sections.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {permissionConfig.map((item) => {
                      const Icon = item.icon;
                      const isEnabled = formPermissions[item.key];
                      const editKey = item.editKey;
                      const canEdit = editKey ? formPermissions[editKey] !== false : true;

                      return (
                        <div
                          key={item.key}
                          className={`p-3.5 rounded-2xl border transition-all ${
                            isEnabled
                              ? 'bg-blue-50/40 border-blue-200 shadow-2xs'
                              : 'bg-white border-slate-200 hover:bg-slate-50/80 opacity-75'
                          }`}
                        >
                          {/* Main Row: Icon, Title & Enable/Disable Switch */}
                          <div className="flex items-center justify-between gap-3">
                            <div
                              onClick={() => handleTogglePermission(item.key)}
                              className="flex items-center gap-3 cursor-pointer select-none flex-1"
                            >
                              <div
                                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                                  isEnabled ? item.color : 'bg-slate-100 text-slate-400 border-slate-200'
                                }`}
                              >
                                <Icon className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="text-xs font-bold text-slate-900">{item.label}</div>
                                <div className="text-[11px] text-slate-500">{item.description}</div>
                              </div>
                            </div>

                            {/* TOGGLE SWITCH BUTTON */}
                            <div
                              onClick={() => handleTogglePermission(item.key)}
                              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                                isEnabled ? 'bg-blue-600' : 'bg-slate-300'
                              }`}
                            >
                              <span
                                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                                  isEnabled ? 'translate-x-5' : 'translate-x-0.5'
                                }`}
                              />
                            </div>
                          </div>

                          {/* READ ONLY VS CAN EDIT ACCESS LEVEL CONTROLS */}
                          {isEnabled && item.hasEditOption && editKey && (
                            <div className="mt-3 pt-2.5 border-t border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                                <span className="text-slate-400">Permission:</span>
                                <span className={canEdit ? 'text-emerald-700 font-extrabold' : 'text-amber-700 font-extrabold'}>
                                  {canEdit ? item.editLabel : item.readOnlyLabel}
                                </span>
                              </span>

                              <div className="inline-flex p-0.5 rounded-xl bg-slate-100 border border-slate-200 shrink-0 self-start sm:self-auto">
                                <button
                                  type="button"
                                  onClick={() => handleSetPermissionMode(editKey, false)}
                                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition ${
                                    !canEdit
                                      ? 'bg-amber-500 text-white shadow-2xs'
                                      : 'text-slate-600 hover:text-slate-900'
                                  }`}
                                  title="Staff can view but not edit or delete"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Read Only</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleSetPermissionMode(editKey, true)}
                                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition ${
                                    canEdit
                                      ? 'bg-blue-600 text-white shadow-2xs'
                                      : 'text-slate-600 hover:text-slate-900'
                                  }`}
                                  title="Staff can add, modify and delete"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                  <span>Can Edit</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-98 transition flex items-center gap-2"
                >
                  {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingMember ? 'Save Changes' : 'Create Staff User'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
