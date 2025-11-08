
import React, { useState, useEffect } from 'react';
import { User, Phone, Heart, Plus, Edit2, Save, X, BookOpen } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { EmergencyContact } from '../../types';
import LearnPage from './LearnPage';

interface UserProfile {
  user_id: string;
  name: string;
  phone: string;
  medical_info: string;
}

export const ProfileTab: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [editingContact, setEditingContact] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLearnPage, setShowLearnPage] = useState(false);
  const { user, signOut } = useAuth();

  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    medical_info: ''
  });

  const [contactForm, setContactForm] = useState({
    name: '',
    phone: '',
    relationship: '',
    is_primary: false
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchEmergencyContacts();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching profile:', error);
    } else if (data) {
      setProfile(data);
      setProfileForm({
        name: data.name,
        phone: data.phone,
        medical_info: data.medical_info
      });
    } else {
      const initialProfile = {
        user_id: user.id,
        name: user.user_metadata?.name || '',
        phone: user.user_metadata?.phone || '',
        medical_info: ''
      };

      const { data: newProfile } = await supabase
        .from('user_profiles')
        .insert(initialProfile)
        .select()
        .single();

      if (newProfile) {
        setProfile(newProfile);
        setProfileForm({
          name: newProfile.name,
          phone: newProfile.phone,
          medical_info: newProfile.medical_info
        });
      }
    }
    setLoading(false);
  };

  const fetchEmergencyContacts = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('emergency_contacts')
      .select('*')
      .eq('user_id', user.id)
      .order('is_primary', { ascending: false });

    setEmergencyContacts(data || []);
  };

  const saveProfile = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: user.id,
        ...profileForm
      });

    if (!error) {
      setProfile(prev => prev ? { ...prev, ...profileForm } : null);
      setIsEditingProfile(false);
    }
  };

  const saveContact = async () => {
    if (!user) return;

    if (editingContact) {
      const { error } = await supabase
        .from('emergency_contacts')
        .update(contactForm)
        .eq('id', editingContact);

      if (!error) {
        setEmergencyContacts(prev =>
          prev.map(contact =>
            contact.id === editingContact
              ? { ...contact, ...contactForm }
              : contact
          )
        );
        setEditingContact(null);
      }
    } else {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .insert({
          user_id: user.id,
          ...contactForm
        })
        .select()
        .single();

      if (!error && data) {
        setEmergencyContacts(prev => [data, ...prev]);
        setIsAddingContact(false);
      }
    }

    setContactForm({ name: '', phone: '', relationship: '', is_primary: false });
  };

  const deleteContact = async (contactId: string) => {
    const { error } = await supabase
      .from('emergency_contacts')
      .delete()
      .eq('id', contactId);

    if (!error) {
      setEmergencyContacts(prev => prev.filter(c => c.id !== contactId));
    }
  };

  const startEditContact = (contact: EmergencyContact) => {
    setContactForm({
      name: contact.name,
      phone: contact.phone,
      relationship: contact.relationship,
      is_primary: contact.is_primary
    });
    setEditingContact(contact.id);
    setIsAddingContact(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  // ✅ THIS IS THE KEY FIX - Conditional rendering at the TOP LEVEL
  if (showLearnPage) {
    return <LearnPage onBack={() => setShowLearnPage(false)} />;
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Profile Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold flex items-center">
            <User className="h-5 w-5 mr-2" />
            Profile Information
          </h2>
          {!isEditingProfile ? (
            <button
              onClick={() => setIsEditingProfile(true)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Edit2 className="h-4 w-4" />
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={saveProfile}
                className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
              >
                <Save className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsEditingProfile(false)}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            {isEditingProfile ? (
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Enter your full name"
              />
            ) : (
              <p className="text-gray-900">{profile?.name || 'Not set'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            {isEditingProfile ? (
              <input
                type="tel"
                value={profileForm.phone}
                onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Enter your phone number"
              />
            ) : (
              <p className="text-gray-900 flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                {profile?.phone || 'Not set'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Medical Information (Optional)
            </label>
            {isEditingProfile ? (
              <textarea
                value={profileForm.medical_info}
                onChange={(e) => setProfileForm(prev => ({ ...prev, medical_info: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 h-24 resize-none"
                placeholder="Allergies, medications, medical conditions..."
              />
            ) : (
              <div className="flex items-start">
                <Heart className="h-4 w-4 mr-2 mt-0.5 text-gray-400" />
                <p className="text-gray-900">
                  {profile?.medical_info || 'None specified'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Learn Button Section */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 shadow-sm border border-red-200">
        <div className="flex items-start space-x-4">
          <div className="bg-red-600 p-3 rounded-full">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              Emergency Learning Center
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Learn how to respond to health emergencies, fires, threats, and natural disasters
            </p>
            <button
              onClick={() => {
                console.log('Learn button clicked!');
                setShowLearnPage(true);
              }}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-full transition-colors shadow-md"
            >
              Start Learning
            </button>
          </div>
        </div>
      </div>

      {/* Emergency Contacts Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Emergency Contacts</h2>
          <button
            onClick={() => setIsAddingContact(true)}
            className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Contact</span>
          </button>
        </div>

        {emergencyContacts.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <Phone className="h-8 w-8 mx-auto" />
            </div>
            <p className="text-gray-500">No emergency contacts added</p>
            <p className="text-sm text-gray-400 mt-1">
              Add contacts who will be notified during emergencies
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {emergencyContacts.map((contact) => (
              <div key={contact.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium">{contact.name}</h3>
                      {contact.is_primary && (
                        <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-medium">
                          Primary
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 flex items-center">
                      <Phone className="h-3 w-3 mr-1" />
                      {contact.phone}
                    </p>
                    <p className="text-sm text-gray-500">{contact.relationship}</p>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => startEditContact(contact)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <Edit2 className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => deleteContact(contact.id)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Contact Modal */}
      {isAddingContact && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold">
                {editingContact ? 'Edit Contact' : 'Add Emergency Contact'}
              </h3>
              <button
                onClick={() => {
                  setIsAddingContact(false);
                  setEditingContact(null);
                  setContactForm({ name: '', phone: '', relationship: '', is_primary: false });
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={contactForm.name}
                  onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Contact name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Relationship
                </label>
                <select
                  value={contactForm.relationship}
                  onChange={(e) => setContactForm(prev => ({ ...prev, relationship: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">Select relationship</option>
                  <option value="Family">Family</option>
                  <option value="Friend">Friend</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Parent">Parent</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Partner">Partner</option>
                  <option value="Doctor">Doctor</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_primary"
                  checked={contactForm.is_primary}
                  onChange={(e) => setContactForm(prev => ({ ...prev, is_primary: e.target.checked }))}
                  className="mr-2 rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <label htmlFor="is_primary" className="text-sm text-gray-700">
                  Make this my primary emergency contact
                </label>
              </div>

              <button
                onClick={saveContact}
                disabled={!contactForm.name || !contactForm.phone || !contactForm.relationship}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                {editingContact ? 'Update Contact' : 'Add Contact'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sign Out Button */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <button
          onClick={signOut}
          className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};
