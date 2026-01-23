'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getProfile, Profile } from '@/lib/services/profiles';
import { getToolsByOwner, Tool } from '@/lib/services/tools';
import Link from 'next/link';

export default function UserProfilePage() {
  const { id } = useParams();
  const userId = Array.isArray(id) ? id[0] : id;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      Promise.all([
        getProfile(userId),
        getToolsByOwner(userId)
      ])
        .then(([profileData, toolsData]) => {
          setProfile(profileData);
          setTools(toolsData);
        })
        .catch((err) => {
          console.error(err);
          setError('Failed to load profile');
        })
        .finally(() => setLoading(false));
    }
  }, [userId]);

  if (loading) return <div className="p-4 text-center">Loading profile...</div>;
  if (!profile) return <div className="p-4 text-center">User not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        <header className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{profile.full_name || 'Unnamed User'}</h1>
            <p className="text-gray-600">{profile.email}</p>
          </div>
          <Link href="/" className="text-sm text-blue-600 hover:underline">
            Back
          </Link>
        </header>

        <div>
          <h2 className="text-xl font-bold mb-4 text-gray-800">Tools by {profile.full_name || 'this user'}</h2>
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
                    <h3 className="font-semibold text-lg text-gray-800">{tool.name}</h3>
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
