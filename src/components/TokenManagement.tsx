import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Plus,
  Edit3,
  Trash2,
  Star,
  StarOff,
  Check,
  X,
  AlertCircle,
  Save,
  RotateCcw,
  Copy,
  Download,
  Upload,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import { cloudGalleryService, TokenProfile } from '../services/cloudGalleryService';
import { ALL_TOKENS, computeAllTokens, validateToken } from '../types/tokens';
import { DESIGN_SYSTEM, getGridClasses, getButtonClasses, getAlertClasses, commonStyles } from './ui/design-system';

interface TokenManagementProps {
  currentTokens: Record<string, string>;
  onTokensChange: (tokens: Record<string, string>) => void;
}

const TokenManagement: React.FC<TokenManagementProps> = ({ currentTokens, onTokensChange }) => {
  const [profiles, setProfiles] = useState<TokenProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateProfile, setShowCreateProfile] = useState(false);
  const [editingProfile, setEditingProfile] = useState<TokenProfile | null>(null);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileDescription, setNewProfileDescription] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<TokenProfile | null>(null);
  const [showTokenEditor, setShowTokenEditor] = useState(false);
  const [editedTokens, setEditedTokens] = useState<Record<string, string>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Token categories for organization
  const tokenCategories = {
    personal: ['FIRSTNAME', 'LASTNAME', 'FULLNAME', 'NICKNAME', 'MIDDLENAME', 'SUFFIX', 'SALUTATION', 'GENDER'],
    professional: ['TITLE', 'DEPARTMENT', 'ROLE', 'LEVEL', 'MANAGER', 'TEAM', 'EMPLOYEEID', 'STARTDATE', 'YEARS_OF_SERVICE'],
    contact: ['EMAIL', 'PERSONAL_EMAIL', 'PHONE', 'MOBILE', 'OFFICE_PHONE', 'WEBSITE', 'LINKEDIN'],
    location: ['STREET', 'CITY', 'STATE', 'ZIP', 'COUNTRY', 'OFFICE_LOCATION', 'FLOOR', 'DESK'],
    company: ['COMPANY', 'INDUSTRY', 'CEO', 'BRAND_COLOR', 'LOGO_URL', 'MISSION', 'VALUES'],
    temporal: ['DATE', 'YEAR', 'MONTH', 'QUARTER', 'WEEK', 'TIME', 'DATETIME', 'TOMORROW', 'YESTERDAY']
  };

  useEffect(() => {
    loadProfiles();
    setEditedTokens({ ...currentTokens });
  }, []);

  const loadProfiles = async () => {
    setLoading(true);
    try {
      const profileData = await cloudGalleryService.getTokenProfiles();
      setProfiles(profileData);

      // Set default profile if available
      const defaultProfile = profileData.find(p => p.is_default);
      if (defaultProfile) {
        setSelectedProfile(defaultProfile);
      }
    } catch (error) {
      console.error('Error loading token profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProfile = async () => {
    if (!newProfileName.trim()) return;

    try {
      const newProfile = await cloudGalleryService.saveTokenProfile({
        name: newProfileName,
        description: newProfileDescription,
        tokens: { ...currentTokens }
      });

      if (newProfile) {
        setProfiles(prev => [...prev, newProfile]);
      }
      setNewProfileName('');
      setNewProfileDescription('');
      setShowCreateProfile(false);
    } catch (error) {
      console.error('Error creating profile:', error);
    }
  };

  const handleUpdateProfile = async (profile: TokenProfile, updates: Partial<TokenProfile>) => {
    try {
      const updatedProfile = await cloudGalleryService.updateTokenProfile(profile.id, updates);
      if (updatedProfile) {
        setProfiles(prev => prev.map(p => p.id === profile.id ? updatedProfile : p));
      }
      setEditingProfile(null);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleDeleteProfile = async (profileId: string) => {
    if (!confirm('Are you sure you want to delete this token profile?')) return;

    try {
      await cloudGalleryService.deleteTokenProfile(profileId);
      setProfiles(prev => prev.filter(p => p.id !== profileId));
      if (selectedProfile?.id === profileId) {
        setSelectedProfile(null);
      }
    } catch (error) {
      console.error('Error deleting profile:', error);
    }
  };

  const handleSetDefaultProfile = async (profile: TokenProfile) => {
    try {
      await cloudGalleryService.setDefaultTokenProfile(profile.id);
      setProfiles(prev => prev.map(p => ({ ...p, is_default: p.id === profile.id })));
    } catch (error) {
      console.error('Error setting default profile:', error);
    }
  };

  const handleLoadProfile = (profile: TokenProfile) => {
    setSelectedProfile(profile);
    onTokensChange(profile.tokens);
    setEditedTokens(profile.tokens);
  };

  const handleSaveCurrentAsProfile = async () => {
    const profileName = prompt('Enter a name for this token profile:');
    if (!profileName?.trim()) return;

    try {
      const newProfile = await cloudGalleryService.saveTokenProfile({
        name: profileName,
        tokens: { ...currentTokens }
      });

      if (newProfile) {
        setProfiles(prev => [...prev, newProfile]);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const validateTokens = (tokens: Record<string, string>) => {
    const errors: Record<string, string> = {};

    Object.entries(tokens).forEach(([key, value]) => {
      const validation = validateToken(key, value);
      if (!validation) {
        errors[key] = 'Invalid value';
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveTokens = () => {
    if (validateTokens(editedTokens)) {
      onTokensChange(editedTokens);
      setShowTokenEditor(false);
    }
  };

  const handleTokenChange = (key: string, value: string) => {
    setEditedTokens(prev => ({ ...prev, [key]: value }));
  };

  const handleExportTokens = () => {
    const dataStr = JSON.stringify(currentTokens, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = `token-profile-${Date.now()}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportTokens = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedTokens = JSON.parse(e.target?.result as string);
        if (typeof importedTokens === 'object' && importedTokens !== null) {
          onTokensChange(importedTokens);
          setEditedTokens(importedTokens);
        } else {
          alert('Invalid token file format');
        }
      } catch (error) {
        alert('Error reading token file');
      }
    };
    reader.readAsText(file);
  };

  const getTokenDisplayName = (key: string) => {
    return key; // Simplified for now
  };

  const getTokenCategory = (key: string) => {
    for (const [category, tokens] of Object.entries(tokenCategories)) {
      if (tokens.includes(key)) return category;
    }
    return 'other';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-2 text-gray-600">Loading token profiles...</span>
      </div>
    );
  }

  return (
    <div className={DESIGN_SYSTEM.components.section}>
      <div className={commonStyles.actionBar}>
        <h3 className={commonStyles.sectionHeader}>
          <User className="w-6 h-6 text-primary-500 mr-2" />
          Token Management
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Profile Management */}
        <div className="space-y-6">
          {/* Current Tokens Summary */}
          <div className={`${DESIGN_SYSTEM.components.panel} ${commonStyles.contentArea}`}>
            <h4 className="font-medium text-sm mb-3">Current Token Profile</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Tokens:</span>
                <span className="font-medium">{Object.keys(currentTokens).length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Filled Tokens:</span>
                <span className="font-medium">
                  {Object.values(currentTokens).filter(v => v.trim()).length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Completion:</span>
                <span className="font-medium">
                  {Math.round((Object.values(currentTokens).filter(v => v.trim()).length / Object.keys(currentTokens).length) * 100)}%
                </span>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowTokenEditor(true)}
                className={`${getButtonClasses('secondary')} flex-1 text-xs`}
              >
                <Edit3 className="w-3 h-3 mr-1" />
                Edit Tokens
              </button>
              <button
                onClick={handleSaveCurrentAsProfile}
                className={`${getButtonClasses('primary')} flex-1 text-xs`}
              >
                <Save className="w-3 h-3 mr-1" />
                Save Profile
              </button>
            </div>
          </div>

          {/* Profile Actions */}
          <div className={`${DESIGN_SYSTEM.components.panel} ${commonStyles.contentArea}`}>
            <h4 className="font-medium text-sm mb-3">Profile Actions</h4>
            <div className="space-y-2">
              <button
                onClick={() => setShowCreateProfile(true)}
                className={`${getButtonClasses('secondary')} w-full text-sm`}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Profile
              </button>

              <button
                onClick={handleExportTokens}
                className={`${getButtonClasses('secondary')} w-full text-sm`}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Tokens
              </button>

              <label className={`${getButtonClasses('secondary')} w-full text-sm cursor-pointer`}>
                <Upload className="w-4 h-4 mr-2" />
                Import Tokens
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportTokens}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Selected Profile Info */}
          {selectedProfile && (
            <div className={`${DESIGN_SYSTEM.components.panel} ${commonStyles.contentArea} border-primary-200 bg-primary-50`}>
              <h4 className="font-medium text-sm mb-2 text-primary-700">Active Profile</h4>
              <div className="space-y-1">
                <p className="font-medium text-primary-900">{selectedProfile.name}</p>
                {selectedProfile.description && (
                  <p className="text-xs text-primary-600">{selectedProfile.description}</p>
                )}
                <p className="text-xs text-primary-600">
                  Last used: {new Date(selectedProfile.last_used_at || selectedProfile.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Center Panel - Token Profiles */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium text-gray-900">Token Profiles</h4>
              <span className="text-sm text-gray-500">{profiles.length} profiles</span>
            </div>

            {profiles.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No token profiles yet</h3>
                <p className="text-gray-600 mb-4">Create your first token profile to save and manage different personalization sets.</p>
                <button
                  onClick={() => setShowCreateProfile(true)}
                  className={getButtonClasses('primary')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Profile
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {profiles.map((profile) => (
                  <motion.div
                    key={profile.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`border rounded-lg p-4 ${
                      selectedProfile?.id === profile.id
                        ? 'border-primary-300 bg-primary-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-medium text-gray-900">{profile.name}</h5>
                          {profile.is_default && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-800">
                              <Star className="w-3 h-3 mr-1" />
                              Default
                            </span>
                          )}
                        </div>

                        {profile.description && (
                          <p className="text-sm text-gray-600 mb-2">{profile.description}</p>
                        )}

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{Object.keys(profile.tokens).length} tokens</span>
                          <span>
                            Created {new Date(profile.created_at).toLocaleDateString()}
                          </span>
                          {profile.last_used_at && (
                            <span>
                              Used {new Date(profile.last_used_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 ml-4">
                        <button
                          onClick={() => handleLoadProfile(profile)}
                          className={`px-3 py-1 rounded text-xs ${
                            selectedProfile?.id === profile.id
                              ? 'bg-primary-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Load
                        </button>

                        {!profile.is_default && (
                          <button
                            onClick={() => handleSetDefaultProfile(profile)}
                            className="p-1 text-gray-400 hover:text-yellow-600"
                            title="Set as default"
                          >
                            <Star className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => setEditingProfile(profile)}
                          className="p-1 text-gray-400 hover:text-blue-600"
                          title="Edit profile"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteProfile(profile.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                          title="Delete profile"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Profile Modal */}
      <AnimatePresence>
        {showCreateProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowCreateProfile(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">Create Token Profile</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Profile Name
                  </label>
                  <input
                    type="text"
                    value={newProfileName}
                    onChange={(e) => setNewProfileName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., Marketing Campaign"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    value={newProfileDescription}
                    onChange={(e) => setNewProfileDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Describe this token profile..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowCreateProfile(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateProfile}
                  disabled={!newProfileName.trim()}
                  className={getButtonClasses('primary')}
                >
                  Create Profile
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {editingProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setEditingProfile(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">Edit Profile</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Profile Name
                  </label>
                  <input
                    type="text"
                    value={editingProfile.name}
                    onChange={(e) => setEditingProfile({ ...editingProfile, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={editingProfile.description || ''}
                    onChange={(e) => setEditingProfile({ ...editingProfile, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setEditingProfile(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdateProfile(editingProfile, {
                    name: editingProfile.name,
                    description: editingProfile.description
                  })}
                  className={getButtonClasses('primary')}
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Token Editor Modal */}
      <AnimatePresence>
        {showTokenEditor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowTokenEditor(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold">Edit Token Values</h3>
                <button
                  onClick={() => setShowTokenEditor(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {Object.entries(tokenCategories).map(([category, tokens]) => (
                  <div key={category} className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3 capitalize">{category} Tokens</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {tokens.map(tokenKey => {
                        const tokenInfo = ALL_TOKENS[tokenKey];
                        if (!tokenInfo) return null;

                        return (
                          <div key={tokenKey} className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">
                              {tokenKey}
                            </label>
                            <input
                              type="text"
                              value={editedTokens[tokenKey] || ''}
                              onChange={(e) => handleTokenChange(tokenKey, e.target.value)}
                              placeholder={`Enter ${tokenKey.toLowerCase()}`}
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                                validationErrors[tokenKey]
                                  ? 'border-red-300 focus:border-red-500'
                                  : 'border-gray-300 focus:border-primary-500'
                              }`}
                            />
                            {validationErrors[tokenKey] && (
                              <p className="text-xs text-red-600 flex items-center">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                {validationErrors[tokenKey]}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={() => setShowTokenEditor(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTokens}
                  className={getButtonClasses('primary')}
                >
                  Save Token Values
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TokenManagement;