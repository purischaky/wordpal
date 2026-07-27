'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { PlatformSettings, ExerciseType } from '@/types/admin';

// ─── Default Settings ────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: PlatformSettings = {
  brand: {
    logoUrl: null,
    themeColors: { primary: '#6366f1', secondary: '#8b5cf6', accent: '#06b6d4' },
    language: 'en',
  },
  aiModel: 'bedrock-claude-3',
  scoring: {
    xpPerExercise: 10,
    xpPerLesson: 100,
    weightByExerciseType: {
      'drag-and-drop': 20,
      'multiple-choice': 15,
      'sentence-ordering': 20,
      'fill-in-blank': 15,
      'rewrite-sentence': 15,
      'free-writing': 15,
    },
    passingThreshold: 70,
  },
  notifications: {
    emailEnabled: true,
    pushEnabled: true,
    digestFrequency: 'daily',
  },
};

const AI_MODELS = [
  { value: 'bedrock-claude-3', label: 'Claude 3 (AWS Bedrock)' },
  { value: 'bedrock-claude-3-haiku', label: 'Claude 3 Haiku (AWS Bedrock)' },
  { value: 'bedrock-claude-3-sonnet', label: 'Claude 3 Sonnet (AWS Bedrock)' },
  { value: 'bedrock-titan', label: 'Amazon Titan' },
];

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'pt', label: 'Portuguese' },
];

const EXERCISE_TYPE_LABELS: Record<ExerciseType, string> = {
  'drag-and-drop': 'Drag & Drop',
  'multiple-choice': 'Multiple Choice',
  'sentence-ordering': 'Sentence Ordering',
  'fill-in-blank': 'Fill in Blank',
  'rewrite-sentence': 'Rewrite Sentence',
  'free-writing': 'Free Writing',
};

type SettingsTab = 'brand' | 'ai-model' | 'cefr' | 'scoring' | 'roles' | 'notifications';

// ─── Validation Types ────────────────────────────────────────────────────────

interface ValidationErrors {
  [key: string]: string;
}

// ─── Settings Page Component ─────────────────────────────────────────────────

export default function SettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings>(DEFAULT_SETTINGS);
  const [savedSettings, setSavedSettings] = useState<PlatformSettings>(DEFAULT_SETTINGS);
  const [activeTab, setActiveTab] = useState<SettingsTab>('brand');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [saving, setSaving] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [pendingNavTab, setPendingNavTab] = useState<SettingsTab | null>(null);

  // ─── Fetch Settings on Load ──────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    async function fetchSettings() {
      try {
        const res = await fetch('/api/admin/settings');
        const json = await res.json();

        if (!cancelled) {
          if (json.error) {
            setNotification({ type: 'error', message: 'Failed to load settings.' });
            setLoadingSettings(false);
            return;
          }

          const data: PlatformSettings = json.data;
          setSettings(data);
          setSavedSettings(data);
          setLoadingSettings(false);
        }
      } catch {
        if (!cancelled) {
          setNotification({ type: 'error', message: 'Failed to load settings.' });
          setLoadingSettings(false);
        }
      }
    }

    fetchSettings();
    return () => { cancelled = true; };
  }, []);

  // ─── Unsaved Changes Detection ───────────────────────────────────────────

  const hasUnsavedChanges = useMemo(() => {
    return JSON.stringify(settings) !== JSON.stringify(savedSettings);
  }, [settings, savedSettings]);

  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (hasUnsavedChanges) {
        e.preventDefault();
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // ─── Auto-dismiss Notification ───────────────────────────────────────────

  useEffect(() => {
    if (notification?.type === 'success') {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // ─── Validation ──────────────────────────────────────────────────────────

  const validate = useCallback((): ValidationErrors => {
    const errs: ValidationErrors = {};

    // Scoring validation
    const { xpPerExercise, xpPerLesson, passingThreshold, weightByExerciseType } = settings.scoring;

    if (xpPerExercise < 1 || xpPerExercise > 1000) {
      errs['scoring.xpPerExercise'] = 'XP per exercise must be between 1 and 1000';
    }
    if (xpPerLesson < 1 || xpPerLesson > 10000) {
      errs['scoring.xpPerLesson'] = 'XP per lesson must be between 1 and 10000';
    }
    if (passingThreshold < 50 || passingThreshold > 100) {
      errs['scoring.passingThreshold'] = 'Passing threshold must be between 50 and 100';
    }

    const weightsSum = Object.values(weightByExerciseType).reduce((sum, w) => sum + w, 0);
    if (weightsSum !== 100) {
      errs['scoring.weights'] = `Exercise type weights must sum to 100 (currently ${weightsSum})`;
    }

    // Brand validation
    if (!settings.brand.themeColors.primary) {
      errs['brand.primary'] = 'Primary color is required';
    }
    if (!settings.brand.themeColors.secondary) {
      errs['brand.secondary'] = 'Secondary color is required';
    }
    if (!settings.brand.themeColors.accent) {
      errs['brand.accent'] = 'Accent color is required';
    }

    return errs;
  }, [settings]);

  // ─── Save Handler ────────────────────────────────────────────────────────

  async function handleSave() {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setNotification({ type: 'error', message: 'Please fix validation errors before saving.' });
      return;
    }

    setErrors({});
    setSaving(true);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const json = await res.json();

      if (json.error) {
        setNotification({ type: 'error', message: json.error });
      } else {
        setSavedSettings({ ...settings });
        setNotification({ type: 'success', message: 'Settings saved successfully.' });
      }
    } catch {
      setNotification({ type: 'error', message: 'Failed to save settings. Please try again.' });
    } finally {
      setSaving(false);
    }
  }

  // ─── Tab Navigation with Unsaved Warning ─────────────────────────────────

  function handleTabChange(tab: SettingsTab) {
    if (hasUnsavedChanges && tab !== activeTab) {
      setPendingNavTab(tab);
      setShowUnsavedWarning(true);
    } else {
      setActiveTab(tab);
    }
  }

  function confirmNavigation() {
    if (pendingNavTab) {
      setSettings({ ...savedSettings });
      setActiveTab(pendingNavTab);
      setErrors({});
    }
    setShowUnsavedWarning(false);
    setPendingNavTab(null);
  }

  function cancelNavigation() {
    setShowUnsavedWarning(false);
    setPendingNavTab(null);
  }

  function saveAndNavigate() {
    handleSave().then(() => {
      if (pendingNavTab) {
        setActiveTab(pendingNavTab);
      }
      setShowUnsavedWarning(false);
      setPendingNavTab(null);
    });
  }

  // ─── Render ──────────────────────────────────────────────────────────────

  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'brand', label: 'Brand', icon: <PaintIcon /> },
    { id: 'ai-model', label: 'AI Model', icon: <BrainIcon /> },
    { id: 'cefr', label: 'CEFR Config', icon: <BookIcon /> },
    { id: 'scoring', label: 'Scoring Rules', icon: <StarIcon /> },
    { id: 'roles', label: 'Roles', icon: <ShieldIcon /> },
    { id: 'notifications', label: 'Notifications', icon: <BellIcon /> },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Platform Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure branding, AI behavior, scoring rules, and notification preferences.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {hasUnsavedChanges && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" aria-hidden="true" />
              Unsaved changes
            </span>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !hasUnsavedChanges || loadingSettings}
            className="inline-flex items-center gap-2 rounded-[12px] bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors duration-200 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Save settings"
          >
            {saving ? (
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            )}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          role="alert"
          aria-live="polite"
          className={`flex items-center gap-3 rounded-xl border p-4 shadow-sm transition-all duration-200 ${
            notification.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200'
              : 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200'
          }`}
        >
          {notification.type === 'success' ? (
            <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9.303 3.376c-.866 1.5.217 3.374 1.948 3.374H2.697c-1.73 0-2.813-1.874-1.948-3.374L10.053 3.378c.866-1.5 3.032-1.5 3.898 0l8.352 14.498zM12 15.75h.008v.008H12v-.008z" />
            </svg>
          )}
          <span className="text-sm font-medium">{notification.message}</span>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="ml-auto rounded-md p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Dismiss notification"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-border">
        <nav className="flex flex-wrap gap-1" role="tablist" aria-label="Settings sections">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              onClick={() => handleTabChange(tab.id)}
              className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-inset ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
              }`}
            >
              <span className="h-4 w-4" aria-hidden="true">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Panels */}
      <div role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={activeTab}>
        {activeTab === 'brand' && (
          <BrandPanel settings={settings} errors={errors} onChange={setSettings} />
        )}
        {activeTab === 'ai-model' && (
          <AIModelPanel settings={settings} onChange={setSettings} />
        )}
        {activeTab === 'cefr' && (
          <CEFRPanel />
        )}
        {activeTab === 'scoring' && (
          <ScoringPanel settings={settings} errors={errors} onChange={setSettings} />
        )}
        {activeTab === 'roles' && (
          <RolesPanel />
        )}
        {activeTab === 'notifications' && (
          <NotificationsPanel settings={settings} onChange={setSettings} />
        )}
      </div>

      {/* Unsaved Changes Warning Dialog */}
      {showUnsavedWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="unsaved-dialog-title">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                <svg className="h-5 w-5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 id="unsaved-dialog-title" className="text-base font-semibold text-foreground">Unsaved Changes</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  You have unsaved changes that will be lost if you navigate away. What would you like to do?
                </p>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={cancelNavigation}
                className="rounded-[12px] border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmNavigation}
                className="rounded-[12px] border border-input bg-background px-4 py-2 text-sm font-medium text-destructive transition-colors duration-200 hover:bg-destructive/10 focus:outline-none focus:ring-2 focus:ring-destructive"
              >
                Discard Changes
              </button>
              <button
                type="button"
                onClick={saveAndNavigate}
                className="rounded-[12px] bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors duration-200 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring"
              >
                Save & Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// ─── Brand Panel ─────────────────────────────────────────────────────────────

interface PanelProps {
  settings: PlatformSettings;
  errors: ValidationErrors;
  onChange: (settings: PlatformSettings) => void;
}

function BrandPanel({ settings, errors, onChange }: PanelProps) {
  const { brand } = settings;

  function updateBrand(updates: Partial<PlatformSettings['brand']>) {
    onChange({ ...settings, brand: { ...brand, ...updates } });
  }

  function updateColor(key: 'primary' | 'secondary' | 'accent', value: string) {
    onChange({
      ...settings,
      brand: {
        ...brand,
        themeColors: { ...brand.themeColors, [key]: value },
      },
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Brand Form */}
      <div className="lg:col-span-2 space-y-6">
        <div className="rounded-xl border border-border bg-card p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
          <h3 className="text-lg font-semibold text-foreground">Brand Settings</h3>
          <p className="mt-1 text-sm text-muted-foreground">Customize your platform&apos;s visual identity.</p>

          <div className="mt-6 space-y-5">
            {/* Logo */}
            <div>
              <label className="block text-sm font-medium text-foreground" htmlFor="brand-logo">
                Logo
              </label>
              <p className="mt-0.5 text-xs text-muted-foreground">PNG or SVG, max 2 MB</p>
              <div className="mt-2 flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted">
                  {brand.logoUrl ? (
                    <span className="text-xs text-muted-foreground">Logo</span>
                  ) : (
                    <svg className="h-6 w-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                    </svg>
                  )}
                </div>
                <input
                  id="brand-logo"
                  type="file"
                  accept=".png,.svg"
                  className="text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary hover:file:bg-primary/20 focus:outline-none"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && file.size <= 2 * 1024 * 1024) {
                      updateBrand({ logoUrl: URL.createObjectURL(file) });
                    }
                  }}
                  aria-describedby="logo-help"
                />
              </div>
              <p id="logo-help" className="sr-only">Upload a PNG or SVG file, maximum 2 megabytes</p>
            </div>

            {/* Theme Colors */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-foreground">Theme Colors</h4>
              <div className="grid gap-4 sm:grid-cols-3">
                <ColorInput
                  label="Primary"
                  value={brand.themeColors.primary}
                  onChange={(v) => updateColor('primary', v)}
                  error={errors['brand.primary']}
                  id="color-primary"
                />
                <ColorInput
                  label="Secondary"
                  value={brand.themeColors.secondary}
                  onChange={(v) => updateColor('secondary', v)}
                  error={errors['brand.secondary']}
                  id="color-secondary"
                />
                <ColorInput
                  label="Accent"
                  value={brand.themeColors.accent}
                  onChange={(v) => updateColor('accent', v)}
                  error={errors['brand.accent']}
                  id="color-accent"
                />
              </div>
            </div>

            {/* Language */}
            <div>
              <label htmlFor="brand-language" className="block text-sm font-medium text-foreground">
                Language
              </label>
              <select
                id="brand-language"
                value={brand.language}
                onChange={(e) => updateBrand({ language: e.target.value })}
                className="mt-1.5 w-full rounded-[12px] border border-input bg-background px-3 py-2.5 text-sm text-foreground shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.value} value={lang.value}>{lang.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Live Preview */}
      <div className="lg:col-span-1">
        <div className="sticky top-6 rounded-xl border border-border bg-card p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
          <h3 className="text-sm font-semibold text-foreground">Live Preview</h3>
          <p className="mt-1 text-xs text-muted-foreground">Preview your brand changes in real-time.</p>

          <div className="mt-4 space-y-4">
            {/* Preview Card */}
            <div className="rounded-xl border border-border overflow-hidden">
              {/* Header with gradient */}
              <div
                className="h-16 flex items-center px-4"
                style={{
                  background: `linear-gradient(135deg, ${brand.themeColors.primary}, ${brand.themeColors.secondary})`,
                }}
              >
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">W</span>
                  </div>
                  <span className="text-sm font-semibold text-white">WordPal</span>
                </div>
              </div>
              {/* Body */}
              <div className="p-4 space-y-3 bg-background">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: brand.themeColors.primary }}
                  />
                  <span className="text-xs text-muted-foreground">Primary</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: brand.themeColors.secondary }}
                  />
                  <span className="text-xs text-muted-foreground">Secondary</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: brand.themeColors.accent }}
                  />
                  <span className="text-xs text-muted-foreground">Accent</span>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    className="w-full rounded-lg px-3 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: brand.themeColors.primary }}
                    aria-label="Preview button with primary color"
                  >
                    Primary Button
                  </button>
                </div>
                <div>
                  <button
                    type="button"
                    className="w-full rounded-lg px-3 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: brand.themeColors.accent }}
                    aria-label="Preview button with accent color"
                  >
                    Accent Button
                  </button>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Language: {LANGUAGES.find((l) => l.value === brand.language)?.label}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Color Input Component ───────────────────────────────────────────────────

function ColorInput({ label, value, onChange, error, id }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  id: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <div className="mt-1.5 flex items-center gap-2">
        <input
          type="color"
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-9 cursor-pointer rounded-lg border border-input"
          aria-label={`${label} color picker`}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs font-mono text-foreground shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label={`${label} hex value`}
          aria-describedby={error ? `${id}-error` : undefined}
        />
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

// ─── AI Model Panel ──────────────────────────────────────────────────────────

function AIModelPanel({ settings, onChange }: Omit<PanelProps, 'errors'>) {
  return (
    <div className="max-w-2xl">
      <div className="rounded-xl border border-border bg-card p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
        <h3 className="text-lg font-semibold text-foreground">AI Model Configuration</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Select the AI model used for content generation and student assessments.
        </p>

        <div className="mt-6">
          <label htmlFor="ai-model-select" className="block text-sm font-medium text-foreground">
            Active Model
          </label>
          <select
            id="ai-model-select"
            value={settings.aiModel}
            onChange={(e) => onChange({ ...settings, aiModel: e.target.value })}
            className="mt-1.5 w-full rounded-[12px] border border-input bg-background px-3 py-2.5 text-sm text-foreground shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {AI_MODELS.map((model) => (
              <option key={model.value} value={model.value}>{model.label}</option>
            ))}
          </select>
          <p className="mt-2 text-xs text-muted-foreground">
            This model will be used for AI Content Studio generation and AI-powered insights.
          </p>
        </div>

        <div className="mt-6 rounded-lg border border-border bg-muted/50 p-4">
          <h4 className="text-sm font-medium text-foreground">Model Details</h4>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Provider</dt>
              <dd className="font-medium text-foreground">AWS Bedrock</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Max Tokens</dt>
              <dd className="font-medium text-foreground">4,096</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Timeout</dt>
              <dd className="font-medium text-foreground">30 seconds</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}

// ─── CEFR Configuration Panel ────────────────────────────────────────────────

function CEFRPanel() {
  const levels = [
    { level: 'A1', label: 'Beginner', description: 'Can understand and use familiar everyday expressions' },
    { level: 'A2', label: 'Elementary', description: 'Can communicate in simple and routine tasks' },
    { level: 'B1', label: 'Intermediate', description: 'Can deal with most situations likely to arise' },
    { level: 'B2', label: 'Upper Intermediate', description: 'Can interact with a degree of fluency' },
    { level: 'C1', label: 'Advanced', description: 'Can produce clear, well-structured, detailed text' },
    { level: 'C2', label: 'Proficiency', description: 'Can understand virtually everything heard or read' },
  ];

  return (
    <div className="max-w-2xl">
      <div className="rounded-xl border border-border bg-card p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
        <h3 className="text-lg font-semibold text-foreground">CEFR Level Configuration</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure Common European Framework of Reference levels for the platform.
        </p>

        <div className="mt-6 space-y-3">
          {levels.map((item) => (
            <div key={item.level} className="flex items-center justify-between rounded-lg border border-border bg-background p-4 transition-colors hover:bg-muted/50">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                  {item.level}
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </div>
              <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                Active
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


// ─── Scoring Rules Panel ─────────────────────────────────────────────────────

function ScoringPanel({ settings, errors, onChange }: PanelProps) {
  const { scoring } = settings;

  function updateScoring(updates: Partial<PlatformSettings['scoring']>) {
    onChange({ ...settings, scoring: { ...scoring, ...updates } });
  }

  function updateWeight(type: ExerciseType, value: number) {
    onChange({
      ...settings,
      scoring: {
        ...scoring,
        weightByExerciseType: { ...scoring.weightByExerciseType, [type]: value },
      },
    });
  }

  const weightsSum = Object.values(scoring.weightByExerciseType).reduce((sum, w) => sum + w, 0);

  return (
    <div className="max-w-2xl space-y-6">
      {/* XP Settings */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
        <h3 className="text-lg font-semibold text-foreground">XP & Scoring Rules</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure experience point rewards and scoring behavior.
        </p>

        <div className="mt-6 space-y-5">
          {/* XP per Exercise */}
          <div>
            <label htmlFor="xp-exercise" className="block text-sm font-medium text-foreground">
              XP per Exercise Completed
            </label>
            <p className="mt-0.5 text-xs text-muted-foreground">Range: 1–1000</p>
            <input
              id="xp-exercise"
              type="number"
              min={1}
              max={1000}
              value={scoring.xpPerExercise}
              onChange={(e) => updateScoring({ xpPerExercise: parseInt(e.target.value) || 0 })}
              className={`mt-1.5 w-full rounded-[12px] border px-3 py-2.5 text-sm text-foreground shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring ${
                errors['scoring.xpPerExercise'] ? 'border-destructive bg-destructive/5' : 'border-input bg-background focus:border-primary'
              }`}
              aria-describedby={errors['scoring.xpPerExercise'] ? 'xp-exercise-error' : undefined}
              aria-invalid={!!errors['scoring.xpPerExercise']}
            />
            {errors['scoring.xpPerExercise'] && (
              <p id="xp-exercise-error" className="mt-1 text-xs text-destructive" role="alert">
                {errors['scoring.xpPerExercise']}
              </p>
            )}
          </div>

          {/* XP per Lesson */}
          <div>
            <label htmlFor="xp-lesson" className="block text-sm font-medium text-foreground">
              XP per Lesson Completed
            </label>
            <p className="mt-0.5 text-xs text-muted-foreground">Range: 1–10000</p>
            <input
              id="xp-lesson"
              type="number"
              min={1}
              max={10000}
              value={scoring.xpPerLesson}
              onChange={(e) => updateScoring({ xpPerLesson: parseInt(e.target.value) || 0 })}
              className={`mt-1.5 w-full rounded-[12px] border px-3 py-2.5 text-sm text-foreground shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring ${
                errors['scoring.xpPerLesson'] ? 'border-destructive bg-destructive/5' : 'border-input bg-background focus:border-primary'
              }`}
              aria-describedby={errors['scoring.xpPerLesson'] ? 'xp-lesson-error' : undefined}
              aria-invalid={!!errors['scoring.xpPerLesson']}
            />
            {errors['scoring.xpPerLesson'] && (
              <p id="xp-lesson-error" className="mt-1 text-xs text-destructive" role="alert">
                {errors['scoring.xpPerLesson']}
              </p>
            )}
          </div>

          {/* Passing Threshold */}
          <div>
            <label htmlFor="passing-threshold" className="block text-sm font-medium text-foreground">
              Passing Threshold
            </label>
            <p className="mt-0.5 text-xs text-muted-foreground">Range: 50–100%</p>
            <div className="mt-1.5 flex items-center gap-3">
              <input
                id="passing-threshold"
                type="range"
                min={50}
                max={100}
                value={scoring.passingThreshold}
                onChange={(e) => updateScoring({ passingThreshold: parseInt(e.target.value) })}
                className="flex-1 accent-primary"
                aria-describedby={errors['scoring.passingThreshold'] ? 'threshold-error' : undefined}
                aria-invalid={!!errors['scoring.passingThreshold']}
                aria-valuemin={50}
                aria-valuemax={100}
                aria-valuenow={scoring.passingThreshold}
              />
              <span className="w-12 text-right text-sm font-medium text-foreground">
                {scoring.passingThreshold}%
              </span>
            </div>
            {errors['scoring.passingThreshold'] && (
              <p id="threshold-error" className="mt-1 text-xs text-destructive" role="alert">
                {errors['scoring.passingThreshold']}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Exercise Type Weights */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Exercise Type Weights</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Weights must sum to exactly 100%.
            </p>
          </div>
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
            weightsSum === 100
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
          }`}>
            Total: {weightsSum}%
          </span>
        </div>

        {errors['scoring.weights'] && (
          <p className="mt-2 text-xs text-destructive" role="alert">
            {errors['scoring.weights']}
          </p>
        )}

        <div className="mt-5 space-y-4">
          {(Object.entries(scoring.weightByExerciseType) as [ExerciseType, number][]).map(([type, weight]) => (
            <div key={type} className="flex items-center gap-4">
              <label htmlFor={`weight-${type}`} className="w-40 text-sm text-foreground">
                {EXERCISE_TYPE_LABELS[type]}
              </label>
              <input
                id={`weight-${type}`}
                type="number"
                min={0}
                max={100}
                value={weight}
                onChange={(e) => updateWeight(type, parseInt(e.target.value) || 0)}
                className="w-20 rounded-lg border border-input bg-background px-2.5 py-1.5 text-sm text-foreground shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label={`Weight for ${EXERCISE_TYPE_LABELS[type]}`}
              />
              <span className="text-xs text-muted-foreground">%</span>
              {/* Visual bar */}
              <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary/70 transition-all duration-200"
                  style={{ width: `${Math.min(weight, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Roles Panel ─────────────────────────────────────────────────────────────

function RolesPanel() {
  const roles = [
    {
      role: 'Administrator',
      description: 'Full platform access including settings, roles, and AI configuration',
      sections: ['Dashboard', 'Students', 'Learning Paths', 'Lessons', 'Exercises', 'AI Studio', 'Challenges', 'Analytics', 'Achievements', 'Settings', 'Profile'],
      color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    },
    {
      role: 'Instructor',
      description: 'Student management, content creation, AI tools, and analytics',
      sections: ['Dashboard', 'Students', 'Learning Paths', 'Lessons', 'Exercises', 'AI Studio', 'Challenges', 'Analytics', 'Achievements', 'Profile'],
      color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    },
    {
      role: 'Content Creator',
      description: 'Content creation for learning paths, lessons, and exercises',
      sections: ['Dashboard', 'Learning Paths', 'Lessons', 'Exercises', 'AI Studio', 'Profile'],
      color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    },
    {
      role: 'Student',
      description: 'Learner role with no admin dashboard access',
      sections: [],
      color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300',
    },
  ];

  return (
    <div className="max-w-3xl">
      <div className="rounded-xl border border-border bg-card p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
        <h3 className="text-lg font-semibold text-foreground">Role Permissions</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          View and manage which sections each role can access.
        </p>

        <div className="mt-6 space-y-4">
          {roles.map((item) => (
            <div key={item.role} className="rounded-lg border border-border bg-background p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${item.color}`}>
                    {item.role}
                  </span>
                  <span className="text-sm text-muted-foreground">{item.description}</span>
                </div>
              </div>
              {item.sections.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {item.sections.map((section) => (
                    <span key={section} className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                      {section}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-xs text-muted-foreground italic">No admin dashboard access</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Notifications Panel ─────────────────────────────────────────────────────

function NotificationsPanel({ settings, onChange }: Omit<PanelProps, 'errors'>) {
  const { notifications } = settings;

  function updateNotifications(updates: Partial<PlatformSettings['notifications']>) {
    onChange({ ...settings, notifications: { ...notifications, ...updates } });
  }

  return (
    <div className="max-w-2xl">
      <div className="rounded-xl border border-border bg-card p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
        <h3 className="text-lg font-semibold text-foreground">Notification Preferences</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure how and when notifications are delivered.
        </p>

        <div className="mt-6 space-y-6">
          {/* Email Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="email-toggle" className="text-sm font-medium text-foreground">
                Email Notifications
              </label>
              <p className="text-xs text-muted-foreground">Receive platform alerts via email</p>
            </div>
            <button
              id="email-toggle"
              type="button"
              role="switch"
              aria-checked={notifications.emailEnabled}
              onClick={() => updateNotifications({ emailEnabled: !notifications.emailEnabled })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                notifications.emailEnabled ? 'bg-primary' : 'bg-muted'
              }`}
              aria-label="Toggle email notifications"
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
                  notifications.emailEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Push Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="push-toggle" className="text-sm font-medium text-foreground">
                Push Notifications
              </label>
              <p className="text-xs text-muted-foreground">Receive real-time browser push notifications</p>
            </div>
            <button
              id="push-toggle"
              type="button"
              role="switch"
              aria-checked={notifications.pushEnabled}
              onClick={() => updateNotifications({ pushEnabled: !notifications.pushEnabled })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                notifications.pushEnabled ? 'bg-primary' : 'bg-muted'
              }`}
              aria-label="Toggle push notifications"
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
                  notifications.pushEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Digest Frequency */}
          <div>
            <label htmlFor="digest-frequency" className="block text-sm font-medium text-foreground">
              Digest Frequency
            </label>
            <p className="mt-0.5 text-xs text-muted-foreground">How often to receive notification summaries</p>
            <select
              id="digest-frequency"
              value={notifications.digestFrequency}
              onChange={(e) => updateNotifications({ digestFrequency: e.target.value as 'daily' | 'weekly' | 'never' })}
              className="mt-1.5 w-full rounded-[12px] border border-input bg-background px-3 py-2.5 text-sm text-foreground shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="never">Never</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Icon Components ─────────────────────────────────────────────────────────

function PaintIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z" />
    </svg>
  );
}

function BrainIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  );
}
