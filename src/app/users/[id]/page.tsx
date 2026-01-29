'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getProfile, updateProfile, Profile } from '@/lib/services/profiles';
import { getToolsByOwner, Tool } from '@/lib/services/tools';
import Link from 'next/link';

export default function UserProfilePage() {
  const { id } = useParams();
  const userId = Array.isArray(id) ? id[0] : id;
  const { user } = useAuth();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedBio, setEditedBio] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      loadData();
    }
  }, [userId]);

  const loadData = () => {
    if (!userId) return;
    
    Promise.all([
      getProfile(userId),
      getToolsByOwner(userId)
    ])
      .then(([profileData, toolsData]) => {
        setProfile(profileData);
        setEditedName(profileData.full_name || '');
        setEditedBio(profileData.bio || '');
        setTools(toolsData);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load profile');
      })
      .finally(() => setLoading(false));
  };

  const handleSaveProfile = async () => {
    if (!userId) return;
    setSaveLoading(true);
    setError(null);
    try {
      await updateProfile(userId, {
        full_name: editedName,
        bio: editedBio,
      });
      // Update local state
      setProfile(prev => prev ? { ...prev, full_name: editedName, bio: editedBio } : null);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) return <div className="p-4 text-center">Loading profile...</div>;
  if (!profile) return <div className="p-4 text-center">User not found.</div>;

  const isOwner = user?.id === profile.id;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        <header className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-xl font-bold text-gray-800">Profile</h1>
            <Link href="/" className="text-sm text-blue-600 hover:underline">
              Back
            </Link>
          </div>

          {isEditing ? (
             <div className="space-y-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                 <input
                   type="text"
                   value={editedName}
                   onChange={(e) => setEditedName(e.target.value)}
                   className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                 <textarea
                   value={editedBio}
                   onChange={(e) => setEditedBio(e.target.value)}
                   placeholder="Tell us a bit about yourself..."
                   className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                   rows={3}
                 />
               </div>
               {error && <p className="text-red-600 text-sm">{error}</p>}
               <div className="flex gap-2 pt-2">
                 <button
                   onClick={handleSaveProfile}
                   disabled={saveLoading}
                   className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                 >
                   {saveLoading ? 'Saving...' : 'Save Profile'}
                 </button>
                 <button
                   onClick={() => {
                     setIsEditing(false);
                     setEditedName(profile.full_name || '');
                     setEditedBio(profile.bio || '');
                     setError(null);
                   }}
                   className="bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-300"
                 >
                   Cancel
                 </button>
               </div>
             </div>
          ) : (
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{profile.full_name || 'Unnamed User'}</h2>
                  <p className="text-gray-600 mb-2">{profile.email}</p>
                </div>
                {isOwner && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-sm text-blue-600 hover:underline bg-blue-50 px-3 py-1 rounded"
                  >
                    Edit
                  </button>
                )}
              </div>
              
              {profile.bio ? (
                <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-100 text-gray-700 whitespace-pre-wrap">
                  {profile.bio}
                </div>
              ) : (
                <p className="mt-4 text-gray-400 italic text-sm">No bio provided.</p>
              )}
            </div>
          )}
        </header>

        <div>
          <h2 className="text-xl font-bold mb-4 text-gray-800">Tools by {isOwner ? 'You' : (profile.full_name || 'this user')}</h2>
          {tools.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg border border-gray-100">
              <p className="text-gray-500">No tools listed yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tools.map((tool) => (
                <div key={tool.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  {tool.image_url && (
                    <div className="aspect-video w-full relative bg-gray-100">
                      <img src={tool.image_url} alt={tool.name} className="object-cover w-full h-full" />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-lg text-gray-800">{tool.name}</h3>
                      {isOwner && (
                        <Link 
                          href={`/tools/${tool.id}/edit`}
                          className="text-xs text-blue-600 hover:underline bg-blue-50 px-2 py-1 rounded"
                        >
                          Edit
                        </Link>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mt-1">{tool.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
