import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';

interface DashboardSettingsProps {
  profileData: {
    name: string;
    email: string;
    bio: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  };
  setProfileData: React.Dispatch<React.SetStateAction<any>>;
}

interface PerformanceMetrics {
  overview: {
    total_page_views: number;
    today_views: number;
    this_week_views: number;
    this_month_views: number;
    daily_growth: number;
    weekly_growth: number;
    monthly_growth: number;
  };
  articles: {
    total: number;
    published: number;
    drafts: number;
    top_performing: Array<{ id: number; title: string; views: number; clicks: number }>;
  };
  charts: {
    views_by_day: Array<{ date: string; views: number }>;
    category_performance: Array<{ category: string; count: number; total_views: number }>;
  };
  users: {
    total: number;
    active: number;
  };
}

const DashboardSettings: React.FC<DashboardSettingsProps> = ({ profileData, setProfileData }) => {
  const [settingsTab, setSettingsTab] = useState<'general' | 'appearance' | 'profile' | 'notifications' | 'security' | 'seo' | 'content' | 'performance' | 'data'>('general');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile state
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  const [siteSettings, setSiteSettings] = useState({
    site_name: 'The Bold East Africa',
    site_tagline: 'Bold Stories. Bold Perspectives.',
    site_description: "East Africa's leading news and analysis platform",
    contact_email: 'info@theboldeastafrica.com',
    contact_phone: '+254 700 000 000',
    timezone: 'Africa/Nairobi',
    date_format: 'M d, Y',
    time_format: 'h:i A',
  });

  const [appearanceSettings, setAppearanceSettings] = useState({
    theme_mode: 'light',
    primary_color: '#001733',
    accent_color: '#e5002b',
    sidebar_collapsed: false,
    compact_mode: false,
    show_animations: true,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    push_notifications: false,
    weekly_report: true,
    new_article_alerts: true,
    comment_notifications: true,
    marketing_emails: false,
  });

  const [seoSettings, setSeoSettings] = useState({
    meta_title: 'The Bold East Africa - News & Analysis',
    meta_description: 'Stay informed with the latest news, analysis, and insights from East Africa.',
    meta_keywords: 'news, east africa, kenya, politics, business, sports',
    twitter_handle: '@theboldea',
    facebook_url: '',
    google_analytics_id: '',
  });

  const [contentSettings, setContentSettings] = useState({
    default_article_status: 'Draft',
    auto_save_interval: 30,
    require_featured_image: false,
    enable_comments: true,
    moderate_comments: true,
    articles_per_page: 10,
    excerpt_length: 150,
  });

  const [securitySettings, setSecuritySettings] = useState({
    two_factor_enabled: false,
    session_timeout: 60,
    max_login_attempts: 5,
    password_expiry_days: 90,
    require_strong_password: true,
  });

  const [systemStats, setSystemStats] = useState<any>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Fetch settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.settings.getAll();
        if (res.data) {
          if (res.data.general) setSiteSettings(prev => ({ ...prev, ...res.data.general }));
          if (res.data.appearance) setAppearanceSettings(prev => ({ ...prev, ...res.data.appearance }));
          if (res.data.notifications) setNotificationSettings(prev => ({ ...prev, ...res.data.notifications }));
          if (res.data.seo) setSeoSettings(prev => ({ ...prev, ...res.data.seo }));
          if (res.data.content) setContentSettings(prev => ({ ...prev, ...res.data.content }));
          if (res.data.security) setSecuritySettings(prev => ({ ...prev, ...res.data.security }));
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    };

    const fetchProfile = async () => {
      try {
        const res = await api.settings.getProfile();
        if (res.data) {
          setProfileData((prev: any) => ({
            ...prev,
            name: res.data.name || prev.name,
            email: res.data.email || prev.email,
            bio: res.data.bio || prev.bio,
          }));
          if (res.data.image) {
            setProfileImage(`http://localhost:8000/storage/${res.data.image}`);
          }
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };

    fetchSettings();
    fetchProfile();
  }, [setProfileData]);

  const handleSaveSettings = async (settings: Record<string, any>, message?: string) => {
    setSettingsLoading(true);
    try {
      await api.settings.update(settings);
      setSettingsSaved(true);
      setSaveMessage(message || 'Settings saved successfully!');
      setTimeout(() => {
        setSettingsSaved(false);
        setSaveMessage('');
      }, 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setProfileLoading(true);
    try {
      await api.settings.updateProfile({
        name: profileData.name,
        email: profileData.email,
        bio: profileData.bio,
      });
      setSettingsSaved(true);
      setSaveMessage('Profile updated successfully!');
      setTimeout(() => {
        setSettingsSaved(false);
        setSaveMessage('');
      }, 3000);
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    setImageUploading(true);
    try {
      const res = await api.settings.uploadProfileImage(file);
      if (res.data?.url) {
        setProfileImage(res.data.url);
      } else if (res.data?.image) {
        setProfileImage(`http://localhost:8000/storage/${res.data.image}`);
      }
      setSettingsSaved(true);
      setSaveMessage('Profile image updated!');
      setTimeout(() => {
        setSettingsSaved(false);
        setSaveMessage('');
      }, 3000);
    } catch (error: any) {
      console.error('Failed to upload image:', error);
      alert(error.message || 'Failed to upload image. Please try again.');
    } finally {
      setImageUploading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (profileData.newPassword !== profileData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    if (profileData.newPassword.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }
    setSettingsLoading(true);
    try {
      await api.settings.updatePassword({
        current_password: profileData.currentPassword,
        new_password: profileData.newPassword,
        confirm_password: profileData.confirmPassword,
      });
      setProfileData({ ...profileData, currentPassword: '', newPassword: '', confirmPassword: '' });
      setSettingsSaved(true);
      setSaveMessage('Password updated successfully!');
      setTimeout(() => {
        setSettingsSaved(false);
        setSaveMessage('');
      }, 3000);
    } catch (error) {
      console.error('Failed to update password:', error);
      alert('Failed to update password. Please check your current password.');
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      const res = await api.settings.exportData();
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bold-east-africa-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data:', error);
      alert('Failed to export data');
    }
  };

  const handleClearCache = async () => {
    if (!confirm('Are you sure you want to clear the cache?')) return;
    try {
      await api.settings.clearCache();
      setSettingsSaved(true);
      setSaveMessage('Cache cleared successfully!');
      setTimeout(() => {
        setSettingsSaved(false);
        setSaveMessage('');
      }, 3000);
    } catch (error) {
      console.error('Failed to clear cache:', error);
      alert('Failed to clear cache');
    }
  };

  const fetchSystemStats = async () => {
    try {
      const res = await api.settings.getSystemStats();
      setSystemStats(res.data);
    } catch (error) {
      console.error('Failed to fetch system stats:', error);
    }
  };

  const fetchPerformanceMetrics = async () => {
    try {
      const res = await api.settings.getPerformanceMetrics();
      setPerformanceMetrics(res.data);
    } catch (error) {
      console.error('Failed to fetch performance metrics:', error);
    }
  };

  // Reusable Toggle Component
  const Toggle = ({ value, onChange, label, description }: { value: boolean; onChange: (v: boolean) => void; label: string; description?: string }) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0">
      <div className="flex-1">
        <span className="text-sm font-medium text-gray-700 block">{label}</span>
        {description && <span className="text-xs text-gray-400 mt-0.5 block">{description}</span>}
      </div>
      <button onClick={() => onChange(!value)} className={`w-12 h-6 rounded-full relative transition-all duration-200 ${value ? 'bg-[#e5002b]' : 'bg-gray-200'}`}>
        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200 ${value ? 'left-7' : 'left-1'}`}></span>
      </button>
    </div>
  );

  // Reusable Input Field Component
  const InputField = ({ label, value, onChange, type = 'text', placeholder = '', description }: { label: string; value: string | number; onChange: (v: string) => void; type?: string; placeholder?: string; description?: string }) => (
    <div>
      <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#001733] focus:ring-2 focus:ring-[#001733]/10 rounded-lg transition-all" />
      {description && <p className="text-xs text-gray-400 mt-1.5">{description}</p>}
    </div>
  );

  // Reusable Select Field Component
  const SelectField = ({ label, value, onChange, options, description }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; description?: string }) => (
    <div>
      <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#001733] focus:ring-2 focus:ring-[#001733]/10 rounded-lg bg-white transition-all">
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
      {description && <p className="text-xs text-gray-400 mt-1.5">{description}</p>}
    </div>
  );

  // Section Header Component
  const SectionHeader = ({ title, description }: { title: string; description: string }) => (
    <div className="mb-8">
      <h3 className="text-xl font-bold text-[#001733] mb-1">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );

  // Save Button Component
  const SaveButton = ({ onClick, loading, text = 'Save Changes' }: { onClick: () => void; loading: boolean; text?: string }) => (
    <button onClick={onClick} disabled={loading} className="bg-[#e5002b] text-white px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-[#001733] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-lg shadow-[#e5002b]/20 hover:shadow-[#001733]/20">
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          Saving...
        </span>
      ) : text}
    </button>
  );

  // Metric Card Component
  const MetricCard = ({ label, value, change, trend, icon }: { label: string; value: string | number; change?: string; trend?: 'up' | 'down' | 'neutral'; icon: React.ReactNode }) => (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-gray-50 rounded-lg text-[#001733] group-hover:bg-[#001733] group-hover:text-white transition-colors">
          {icon}
        </div>
        {change && (
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend === 'up' ? 'bg-green-50 text-green-600' : trend === 'down' ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-600'}`}>
            {trend === 'up' && '+'}{change}
          </span>
        )}
      </div>
      <h3 className="text-3xl font-black text-[#001733] mb-1">{typeof value === 'number' ? value.toLocaleString() : value}</h3>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</p>
    </div>
  );

  const settingsTabs = [
    { id: 'general', label: 'General', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
    { id: 'profile', label: 'Profile', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
    { id: 'appearance', label: 'Appearance', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg> },
    { id: 'notifications', label: 'Notifications', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg> },
    { id: 'security', label: 'Security', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg> },
    { id: 'seo', label: 'SEO', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg> },
    { id: 'content', label: 'Content', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
    { id: 'performance', label: 'Performance', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
    { id: 'data', label: 'Data & Backup', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg> },
  ];

  return (
    <div className="flex gap-8 animate-in fade-in duration-300">
      {/* Settings Sidebar */}
      <div className="w-64 flex-shrink-0">
        <div className="bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden sticky top-4">
          <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-[#001733] to-[#002855]">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white">Settings</h3>
            <p className="text-xs text-white/60 mt-1">Manage your preferences</p>
          </div>
          <nav className="p-3">
            {settingsTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setSettingsTab(tab.id as any);
                  if (tab.id === 'data') fetchSystemStats();
                  if (tab.id === 'performance') fetchPerformanceMetrics();
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all mb-1 ${settingsTab === tab.id ? 'bg-[#001733] text-white shadow-lg' : 'text-gray-600 hover:bg-gray-50 hover:text-[#001733]'}`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Settings Content */}
      <div className="flex-1 space-y-6">
        {/* Success Toast */}
        {settingsSaved && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-5 py-4 rounded-xl flex items-center gap-3 shadow-lg shadow-green-100 animate-in slide-in-from-top duration-300">
            <div className="p-1 bg-green-100 rounded-full">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <span className="font-medium">{saveMessage}</span>
          </div>
        )}

        {/* General Settings */}
        {settingsTab === 'general' && (
          <div className="bg-white p-8 border border-gray-100 shadow-sm rounded-xl">
            <SectionHeader title="General Settings" description="Configure your site's basic information and preferences." />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="Site Name" value={siteSettings.site_name} onChange={(v) => setSiteSettings({ ...siteSettings, site_name: v })} />
              <InputField label="Site Tagline" value={siteSettings.site_tagline} onChange={(v) => setSiteSettings({ ...siteSettings, site_tagline: v })} />
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Site Description</label>
                <textarea value={siteSettings.site_description} onChange={(e) => setSiteSettings({ ...siteSettings, site_description: e.target.value })} rows={3} className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#001733] focus:ring-2 focus:ring-[#001733]/10 rounded-lg transition-all" />
              </div>
              <InputField label="Contact Email" value={siteSettings.contact_email} onChange={(v) => setSiteSettings({ ...siteSettings, contact_email: v })} type="email" />
              <InputField label="Contact Phone" value={siteSettings.contact_phone} onChange={(v) => setSiteSettings({ ...siteSettings, contact_phone: v })} />
              <SelectField label="Timezone" value={siteSettings.timezone} onChange={(v) => setSiteSettings({ ...siteSettings, timezone: v })} options={[
                { value: 'Africa/Nairobi', label: 'Africa/Nairobi (EAT)' },
                { value: 'Africa/Lagos', label: 'Africa/Lagos (WAT)' },
                { value: 'Africa/Johannesburg', label: 'Africa/Johannesburg (SAST)' },
                { value: 'UTC', label: 'UTC' },
                { value: 'Europe/London', label: 'Europe/London (GMT)' },
                { value: 'America/New_York', label: 'America/New_York (EST)' },
              ]} />
              <SelectField label="Date Format" value={siteSettings.date_format} onChange={(v) => setSiteSettings({ ...siteSettings, date_format: v })} options={[
                { value: 'M d, Y', label: 'Jan 19, 2026' },
                { value: 'd M Y', label: '19 Jan 2026' },
                { value: 'Y-m-d', label: '2026-01-19' },
                { value: 'd/m/Y', label: '19/01/2026' },
              ]} />
            </div>
            <div className="flex justify-end mt-8 pt-6 border-t border-gray-100">
              <SaveButton onClick={() => handleSaveSettings(siteSettings, 'General settings saved!')} loading={settingsLoading} />
            </div>
          </div>
        )}

        {/* Profile Settings */}
        {settingsTab === 'profile' && (
          <div className="space-y-6">
            {/* Profile Header Card */}
            <div className="bg-gradient-to-r from-[#001733] to-[#002855] p-8 rounded-xl text-white">
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <div className="w-28 h-28 rounded-full bg-white/10 overflow-hidden border-4 border-white/20 shadow-xl">
                    {profileImage ? (
                      <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white/40">
                        {profileData.name?.charAt(0)?.toUpperCase() || 'A'}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={imageUploading}
                    className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                  >
                    {imageUploading ? (
                      <svg className="animate-spin w-6 h-6 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    ) : (
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">{profileData.name || 'Admin User'}</h2>
                  <p className="text-white/60 text-sm">{profileData.email}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-wider">Administrator</span>
                    <span className="text-xs text-white/40">Member since Jan 2024</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <div className="bg-white p-8 border border-gray-100 shadow-sm rounded-xl">
              <SectionHeader title="Profile Information" description="Update your personal details and public profile." />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="Full Name" value={profileData.name} onChange={(v) => setProfileData({ ...profileData, name: v })} />
                <InputField label="Email Address" value={profileData.email} onChange={(v) => setProfileData({ ...profileData, email: v })} type="email" />
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Bio</label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    rows={4}
                    placeholder="Write a short bio about yourself..."
                    className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#001733] focus:ring-2 focus:ring-[#001733]/10 rounded-lg transition-all resize-none"
                  />
                  <p className="text-xs text-gray-400 mt-1.5">{profileData.bio?.length || 0}/1000 characters</p>
                </div>
              </div>
              <div className="flex justify-end mt-8 pt-6 border-t border-gray-100">
                <SaveButton onClick={handleSaveProfile} loading={profileLoading} text="Update Profile" />
              </div>
            </div>
          </div>
        )}

        {/* Appearance Settings */}
        {settingsTab === 'appearance' && (
          <div className="bg-white p-8 border border-gray-100 shadow-sm rounded-xl">
            <SectionHeader title="Appearance Settings" description="Customize the look and feel of your dashboard." />
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SelectField label="Theme Mode" value={appearanceSettings.theme_mode} onChange={(v) => setAppearanceSettings({ ...appearanceSettings, theme_mode: v })} options={[
                  { value: 'light', label: 'Light Mode' },
                  { value: 'dark', label: 'Dark Mode' },
                  { value: 'system', label: 'System Default' },
                ]} />
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Primary Color</label>
                  <div className="flex gap-3">
                    <input type="color" value={appearanceSettings.primary_color} onChange={(e) => setAppearanceSettings({ ...appearanceSettings, primary_color: e.target.value })} className="w-14 h-11 border border-gray-200 rounded-lg cursor-pointer" />
                    <input type="text" value={appearanceSettings.primary_color} onChange={(e) => setAppearanceSettings({ ...appearanceSettings, primary_color: e.target.value })} className="flex-1 border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#001733] rounded-lg" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Accent Color</label>
                  <div className="flex gap-3">
                    <input type="color" value={appearanceSettings.accent_color} onChange={(e) => setAppearanceSettings({ ...appearanceSettings, accent_color: e.target.value })} className="w-14 h-11 border border-gray-200 rounded-lg cursor-pointer" />
                    <input type="text" value={appearanceSettings.accent_color} onChange={(e) => setAppearanceSettings({ ...appearanceSettings, accent_color: e.target.value })} className="flex-1 border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#001733] rounded-lg" />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <h4 className="text-sm font-bold text-[#001733] mb-4">Display Options</h4>
                <Toggle label="Collapse Sidebar by Default" description="Start with a minimized sidebar" value={appearanceSettings.sidebar_collapsed} onChange={(v) => setAppearanceSettings({ ...appearanceSettings, sidebar_collapsed: v })} />
                <Toggle label="Compact Mode" description="Reduce spacing for more content" value={appearanceSettings.compact_mode} onChange={(v) => setAppearanceSettings({ ...appearanceSettings, compact_mode: v })} />
                <Toggle label="Show Animations" description="Enable smooth transitions" value={appearanceSettings.show_animations} onChange={(v) => setAppearanceSettings({ ...appearanceSettings, show_animations: v })} />
              </div>

              <div className="pt-6 border-t border-gray-100">
                <h4 className="text-sm font-bold text-[#001733] mb-4">Color Presets</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {[
                    { primary: '#001733', accent: '#e5002b', name: 'Default' },
                    { primary: '#1a1a2e', accent: '#e94560', name: 'Midnight' },
                    { primary: '#2d3436', accent: '#0984e3', name: 'Ocean' },
                    { primary: '#2c3e50', accent: '#27ae60', name: 'Forest' },
                    { primary: '#4a0e4e', accent: '#f39c12', name: 'Royal' },
                  ].map(preset => (
                    <button
                      key={preset.name}
                      onClick={() => setAppearanceSettings({ ...appearanceSettings, primary_color: preset.primary, accent_color: preset.accent })}
                      className={`flex flex-col items-center gap-2 p-4 border-2 rounded-xl transition-all ${appearanceSettings.primary_color === preset.primary && appearanceSettings.accent_color === preset.accent ? 'border-[#001733] bg-gray-50' : 'border-gray-100 hover:border-gray-200'}`}
                    >
                      <div className="flex gap-1">
                        <div className="w-8 h-8 rounded-lg shadow-inner" style={{ backgroundColor: preset.primary }}></div>
                        <div className="w-8 h-8 rounded-lg shadow-inner" style={{ backgroundColor: preset.accent }}></div>
                      </div>
                      <span className="text-xs font-bold text-gray-600">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-8 pt-6 border-t border-gray-100">
              <SaveButton onClick={() => handleSaveSettings(appearanceSettings, 'Appearance settings saved!')} loading={settingsLoading} />
            </div>
          </div>
        )}

        {/* Notification Settings */}
        {settingsTab === 'notifications' && (
          <div className="bg-white p-8 border border-gray-100 shadow-sm rounded-xl">
            <SectionHeader title="Notification Preferences" description="Control how and when you receive notifications." />
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-[#001733] mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  Email Notifications
                </h4>
                <div className="bg-gray-50 rounded-xl p-4">
                  <Toggle label="Enable Email Notifications" description="Receive updates via email" value={notificationSettings.email_notifications} onChange={(v) => setNotificationSettings({ ...notificationSettings, email_notifications: v })} />
                  <Toggle label="Weekly Report Summary" description="Get a weekly digest of your site's performance" value={notificationSettings.weekly_report} onChange={(v) => setNotificationSettings({ ...notificationSettings, weekly_report: v })} />
                  <Toggle label="Marketing & Promotional Emails" description="Receive news about new features" value={notificationSettings.marketing_emails} onChange={(v) => setNotificationSettings({ ...notificationSettings, marketing_emails: v })} />
                </div>
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#001733] mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                  Push Notifications
                </h4>
                <div className="bg-gray-50 rounded-xl p-4">
                  <Toggle label="Enable Push Notifications" description="Get instant browser notifications" value={notificationSettings.push_notifications} onChange={(v) => setNotificationSettings({ ...notificationSettings, push_notifications: v })} />
                  <Toggle label="New Article Alerts" description="Be notified when articles are published" value={notificationSettings.new_article_alerts} onChange={(v) => setNotificationSettings({ ...notificationSettings, new_article_alerts: v })} />
                  <Toggle label="Comment Notifications" description="Get notified of new comments" value={notificationSettings.comment_notifications} onChange={(v) => setNotificationSettings({ ...notificationSettings, comment_notifications: v })} />
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-8 pt-6 border-t border-gray-100">
              <SaveButton onClick={() => handleSaveSettings(notificationSettings, 'Notification preferences saved!')} loading={settingsLoading} />
            </div>
          </div>
        )}

        {/* Security Settings */}
        {settingsTab === 'security' && (
          <div className="space-y-6">
            <div className="bg-white p-8 border border-gray-100 shadow-sm rounded-xl">
              <SectionHeader title="Change Password" description="Update your password to keep your account secure." />
              <div className="space-y-4 max-w-md">
                <InputField label="Current Password" value={profileData.currentPassword} onChange={(v) => setProfileData({ ...profileData, currentPassword: v })} type="password" placeholder="Enter current password" />
                <InputField label="New Password" value={profileData.newPassword} onChange={(v) => setProfileData({ ...profileData, newPassword: v })} type="password" placeholder="Enter new password" description="Must be at least 8 characters" />
                <InputField label="Confirm New Password" value={profileData.confirmPassword} onChange={(v) => setProfileData({ ...profileData, confirmPassword: v })} type="password" placeholder="Confirm new password" />
              </div>
              <div className="flex justify-start mt-6">
                <button onClick={handleUpdatePassword} disabled={settingsLoading} className="bg-[#001733] text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors disabled:opacity-50 rounded-lg">
                  {settingsLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </div>

            <div className="bg-white p-8 border border-gray-100 shadow-sm rounded-xl">
              <SectionHeader title="Security Settings" description="Configure additional security options for your account." />
              <div className="space-y-4">
                <Toggle label="Enable Two-Factor Authentication" description="Add an extra layer of security" value={securitySettings.two_factor_enabled} onChange={(v) => setSecuritySettings({ ...securitySettings, two_factor_enabled: v })} />
                <Toggle label="Require Strong Passwords" description="Enforce complex password requirements" value={securitySettings.require_strong_password} onChange={(v) => setSecuritySettings({ ...securitySettings, require_strong_password: v })} />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Session Timeout (minutes)</label>
                    <input type="number" value={securitySettings.session_timeout} onChange={(e) => setSecuritySettings({ ...securitySettings, session_timeout: parseInt(e.target.value) || 60 })} className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#001733] rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Max Login Attempts</label>
                    <input type="number" value={securitySettings.max_login_attempts} onChange={(e) => setSecuritySettings({ ...securitySettings, max_login_attempts: parseInt(e.target.value) || 5 })} className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#001733] rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Password Expiry (days)</label>
                    <input type="number" value={securitySettings.password_expiry_days} onChange={(e) => setSecuritySettings({ ...securitySettings, password_expiry_days: parseInt(e.target.value) || 90 })} className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#001733] rounded-lg" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-8 pt-6 border-t border-gray-100">
                <SaveButton onClick={() => handleSaveSettings(securitySettings, 'Security settings saved!')} loading={settingsLoading} />
              </div>
            </div>
          </div>
        )}

        {/* SEO Settings */}
        {settingsTab === 'seo' && (
          <div className="bg-white p-8 border border-gray-100 shadow-sm rounded-xl">
            <SectionHeader title="SEO Settings" description="Optimize your site for search engines and social media." />
            <div className="space-y-6">
              <InputField label="Default Meta Title" value={seoSettings.meta_title} onChange={(v) => setSeoSettings({ ...seoSettings, meta_title: v })} description="This appears in browser tabs and search results" />
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Default Meta Description</label>
                <textarea value={seoSettings.meta_description} onChange={(e) => setSeoSettings({ ...seoSettings, meta_description: e.target.value })} rows={3} className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#001733] rounded-lg" />
                <p className="text-xs text-gray-400 mt-1.5">
                  <span className={seoSettings.meta_description.length > 160 ? 'text-red-500' : ''}>{seoSettings.meta_description.length}</span>/160 characters recommended
                </p>
              </div>
              <InputField label="Meta Keywords" value={seoSettings.meta_keywords} onChange={(v) => setSeoSettings({ ...seoSettings, meta_keywords: v })} placeholder="keyword1, keyword2, keyword3" description="Comma-separated list of keywords" />
              <div className="pt-6 border-t border-gray-100">
                <h4 className="text-sm font-bold text-[#001733] mb-4">Social Media</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField label="Twitter Handle" value={seoSettings.twitter_handle} onChange={(v) => setSeoSettings({ ...seoSettings, twitter_handle: v })} placeholder="@yourhandle" />
                  <InputField label="Facebook Page URL" value={seoSettings.facebook_url} onChange={(v) => setSeoSettings({ ...seoSettings, facebook_url: v })} placeholder="https://facebook.com/yourpage" />
                </div>
              </div>
              <div className="pt-6 border-t border-gray-100">
                <h4 className="text-sm font-bold text-[#001733] mb-4">Analytics</h4>
                <InputField label="Google Analytics ID" value={seoSettings.google_analytics_id} onChange={(v) => setSeoSettings({ ...seoSettings, google_analytics_id: v })} placeholder="G-XXXXXXXXXX" description="Enter your Google Analytics 4 measurement ID" />
              </div>
            </div>
            <div className="flex justify-end mt-8 pt-6 border-t border-gray-100">
              <SaveButton onClick={() => handleSaveSettings(seoSettings, 'SEO settings saved!')} loading={settingsLoading} />
            </div>
          </div>
        )}

        {/* Content Settings */}
        {settingsTab === 'content' && (
          <div className="bg-white p-8 border border-gray-100 shadow-sm rounded-xl">
            <SectionHeader title="Content Settings" description="Configure how content is created and displayed." />
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SelectField label="Default Article Status" value={contentSettings.default_article_status} onChange={(v) => setContentSettings({ ...contentSettings, default_article_status: v })} options={[
                  { value: 'Draft', label: 'Draft' },
                  { value: 'Published', label: 'Published' },
                  { value: 'Scheduled', label: 'Scheduled' },
                ]} description="Initial status for new articles" />
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Auto-Save Interval (seconds)</label>
                  <input type="number" value={contentSettings.auto_save_interval} onChange={(e) => setContentSettings({ ...contentSettings, auto_save_interval: parseInt(e.target.value) || 30 })} className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#001733] rounded-lg" />
                  <p className="text-xs text-gray-400 mt-1.5">How often to save drafts automatically</p>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Articles Per Page</label>
                  <input type="number" value={contentSettings.articles_per_page} onChange={(e) => setContentSettings({ ...contentSettings, articles_per_page: parseInt(e.target.value) || 10 })} className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#001733] rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Excerpt Length (characters)</label>
                  <input type="number" value={contentSettings.excerpt_length} onChange={(e) => setContentSettings({ ...contentSettings, excerpt_length: parseInt(e.target.value) || 150 })} className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#001733] rounded-lg" />
                </div>
              </div>
              <div className="pt-6 border-t border-gray-100">
                <h4 className="text-sm font-bold text-[#001733] mb-4">Content Options</h4>
                <Toggle label="Require Featured Image for Articles" description="Articles must have a featured image to publish" value={contentSettings.require_featured_image} onChange={(v) => setContentSettings({ ...contentSettings, require_featured_image: v })} />
                <Toggle label="Enable Comments on Articles" description="Allow readers to comment on articles" value={contentSettings.enable_comments} onChange={(v) => setContentSettings({ ...contentSettings, enable_comments: v })} />
                <Toggle label="Moderate Comments Before Publishing" description="Review comments before they appear" value={contentSettings.moderate_comments} onChange={(v) => setContentSettings({ ...contentSettings, moderate_comments: v })} />
              </div>
            </div>
            <div className="flex justify-end mt-8 pt-6 border-t border-gray-100">
              <SaveButton onClick={() => handleSaveSettings(contentSettings, 'Content settings saved!')} loading={settingsLoading} />
            </div>
          </div>
        )}

        {/* Performance Metrics */}
        {settingsTab === 'performance' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-[#001733] to-[#002855] p-8 rounded-xl text-white">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold">Performance Metrics</h3>
                  <p className="text-white/60 text-sm mt-1">Monitor your site's performance and growth</p>
                </div>
                <button onClick={fetchPerformanceMetrics} className="px-4 py-2 bg-white/10 rounded-lg text-sm font-medium hover:bg-white/20 transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  Refresh
                </button>
              </div>

              {performanceMetrics ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/10 rounded-xl p-4">
                    <p className="text-3xl font-black">{performanceMetrics.overview.total_page_views.toLocaleString()}</p>
                    <p className="text-xs text-white/60 uppercase tracking-widest mt-1">Total Page Views</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4">
                    <p className="text-3xl font-black">{performanceMetrics.overview.today_views.toLocaleString()}</p>
                    <p className="text-xs text-white/60 uppercase tracking-widest mt-1">Today's Views</p>
                    {performanceMetrics.overview.daily_growth !== 0 && (
                      <span className={`text-xs font-bold ${performanceMetrics.overview.daily_growth > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {performanceMetrics.overview.daily_growth > 0 ? '+' : ''}{performanceMetrics.overview.daily_growth}%
                      </span>
                    )}
                  </div>
                  <div className="bg-white/10 rounded-xl p-4">
                    <p className="text-3xl font-black">{performanceMetrics.overview.this_week_views.toLocaleString()}</p>
                    <p className="text-xs text-white/60 uppercase tracking-widest mt-1">This Week</p>
                    {performanceMetrics.overview.weekly_growth !== 0 && (
                      <span className={`text-xs font-bold ${performanceMetrics.overview.weekly_growth > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {performanceMetrics.overview.weekly_growth > 0 ? '+' : ''}{performanceMetrics.overview.weekly_growth}%
                      </span>
                    )}
                  </div>
                  <div className="bg-white/10 rounded-xl p-4">
                    <p className="text-3xl font-black">{performanceMetrics.overview.this_month_views.toLocaleString()}</p>
                    <p className="text-xs text-white/60 uppercase tracking-widest mt-1">This Month</p>
                    {performanceMetrics.overview.monthly_growth !== 0 && (
                      <span className={`text-xs font-bold ${performanceMetrics.overview.monthly_growth > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {performanceMetrics.overview.monthly_growth > 0 ? '+' : ''}{performanceMetrics.overview.monthly_growth}%
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-white/60">
                  <svg className="animate-spin w-8 h-8 mx-auto mb-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Loading performance data...
                </div>
              )}
            </div>

            {/* Views Chart */}
            {performanceMetrics && (
              <div className="bg-white p-8 border border-gray-100 shadow-sm rounded-xl">
                <h4 className="text-lg font-bold text-[#001733] mb-6">Views - Last 7 Days</h4>
                <div className="h-48 flex items-end gap-2">
                  {performanceMetrics.charts.views_by_day.map((day, index) => {
                    const maxViews = Math.max(...performanceMetrics.charts.views_by_day.map(d => d.views), 1);
                    const height = (day.views / maxViews) * 100;
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full bg-gray-100 rounded-t-lg relative group" style={{ height: '160px' }}>
                          <div
                            className="absolute bottom-0 w-full bg-gradient-to-t from-[#e5002b] to-[#ff4d6d] rounded-t-lg transition-all duration-300 group-hover:from-[#001733] group-hover:to-[#002855]"
                            style={{ height: `${Math.max(height, 5)}%` }}
                          ></div>
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#001733] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {day.views} views
                          </div>
                        </div>
                        <span className="text-xs font-medium text-gray-400">{day.date}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Article Stats & Top Performing */}
            {performanceMetrics && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-8 border border-gray-100 shadow-sm rounded-xl">
                  <h4 className="text-lg font-bold text-[#001733] mb-6">Article Statistics</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-600">Total Articles</span>
                      <span className="text-2xl font-black text-[#001733]">{performanceMetrics.articles.total}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-600">Published</span>
                      <span className="text-2xl font-black text-green-600">{performanceMetrics.articles.published}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-600">Drafts</span>
                      <span className="text-2xl font-black text-yellow-600">{performanceMetrics.articles.drafts}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 border border-gray-100 shadow-sm rounded-xl">
                  <h4 className="text-lg font-bold text-[#001733] mb-6">Top Performing Articles</h4>
                  <div className="space-y-3">
                    {performanceMetrics.articles.top_performing.length > 0 ? (
                      performanceMetrics.articles.top_performing.map((article, index) => (
                        <div key={article.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <span className="text-lg font-black text-gray-300 w-6">#{index + 1}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#001733] truncate">{article.title}</p>
                            <p className="text-xs text-gray-400">{article.views.toLocaleString()} views • {article.clicks} clicks</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400 text-center py-4">No articles yet</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Category Performance */}
            {performanceMetrics && performanceMetrics.charts.category_performance.length > 0 && (
              <div className="bg-white p-8 border border-gray-100 shadow-sm rounded-xl">
                <h4 className="text-lg font-bold text-[#001733] mb-6">Category Performance</h4>
                <div className="space-y-4">
                  {performanceMetrics.charts.category_performance.map((cat, index) => {
                    const maxViews = Math.max(...performanceMetrics.charts.category_performance.map(c => c.total_views || 0), 1);
                    const width = ((cat.total_views || 0) / maxViews) * 100;
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">{cat.category}</span>
                          <span className="text-sm text-gray-400">{cat.count} articles • {(cat.total_views || 0).toLocaleString()} views</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-[#001733] to-[#e5002b] rounded-full transition-all duration-500" style={{ width: `${width}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Data & Backup Settings */}
        {settingsTab === 'data' && (
          <div className="space-y-6">
            {/* System Stats */}
            <div className="bg-white p-8 border border-gray-100 shadow-sm rounded-xl">
              <SectionHeader title="System Information" description="View current system statistics and resource usage." />
              {systemStats ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <MetricCard
                    label="Articles"
                    value={systemStats.database?.articles || 0}
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>}
                  />
                  <MetricCard
                    label="Users"
                    value={systemStats.database?.users || 0}
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
                  />
                  <MetricCard
                    label="Categories"
                    value={systemStats.database?.categories || 0}
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>}
                  />
                  <MetricCard
                    label="Page Views"
                    value={systemStats.database?.page_views || 0}
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
                  />
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <svg className="animate-spin w-8 h-8 mx-auto mb-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Loading system statistics...
                </div>
              )}

              {systemStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <p className="text-lg font-black text-blue-700">{systemStats.storage?.database_size || 'N/A'}</p>
                    <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">Database Size</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-xl">
                    <p className="text-lg font-black text-green-700">PHP {systemStats.system?.php_version?.split('-')[0] || 'N/A'}</p>
                    <p className="text-xs font-bold text-green-400 uppercase tracking-widest">PHP Version</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-xl">
                    <p className="text-lg font-black text-purple-700">Laravel {systemStats.system?.laravel_version || 'N/A'}</p>
                    <p className="text-xs font-bold text-purple-400 uppercase tracking-widest">Framework</p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-xl">
                    <p className="text-lg font-black text-orange-700">{systemStats.system?.timezone || 'N/A'}</p>
                    <p className="text-xs font-bold text-orange-400 uppercase tracking-widest">Timezone</p>
                  </div>
                </div>
              )}
            </div>

            {/* Data Management */}
            <div className="bg-white p-8 border border-gray-100 shadow-sm rounded-xl">
              <SectionHeader title="Data Management" description="Export, backup, and manage your site data." />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button onClick={handleExportData} className="p-6 border-2 border-dashed border-gray-200 rounded-xl hover:border-[#001733] hover:bg-gray-50 transition-all group text-left">
                  <svg className="w-10 h-10 text-gray-300 group-hover:text-[#001733] mb-4 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  <h4 className="font-bold text-[#001733] mb-1">Export Data</h4>
                  <p className="text-sm text-gray-400">Download all your data as JSON</p>
                </button>
                <button onClick={handleClearCache} className="p-6 border-2 border-dashed border-gray-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all group text-left">
                  <svg className="w-10 h-10 text-gray-300 group-hover:text-orange-500 mb-4 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  <h4 className="font-bold text-[#001733] mb-1">Clear Cache</h4>
                  <p className="text-sm text-gray-400">Clear all cached data</p>
                </button>
                <div className="p-6 border-2 border-dashed border-gray-200 rounded-xl opacity-60 text-left">
                  <svg className="w-10 h-10 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                  <h4 className="font-bold text-[#001733] mb-1">Import Data</h4>
                  <p className="text-sm text-gray-400">Coming soon</p>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white p-8 border border-red-100 shadow-sm rounded-xl">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-2 bg-red-100 rounded-lg">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-red-600">Danger Zone</h3>
                  <p className="text-sm text-gray-500">Irreversible actions. Please proceed with caution.</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <button onClick={() => { if (confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) api.settings.resetToDefaults().then(() => window.location.reload()); }} className="px-6 py-3 border-2 border-red-200 text-red-600 text-xs font-bold uppercase tracking-widest hover:bg-red-50 transition-colors rounded-lg">
                  Reset All Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardSettings;
