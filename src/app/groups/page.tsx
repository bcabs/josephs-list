'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserGroups, Group } from '@/lib/services/groups';
import Link from 'next/link';

export default function GroupsPage() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getUserGroups(user.id)
        .then(setGroups)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (loading) return <div className="p-4 text-center">Loading groups...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">My Groups</h1>
          <Link href="/" className="text-sm text-blue-600 hover:underline">
            Back
          </Link>
        </header>

        <div className="mb-6">
          <Link
            href="/groups/create"
            className="block w-full text-center bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            + Create New Group
          </Link>
        </div>

        {groups.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-100 shadow-sm">
            <p className="text-gray-500 mb-2">You haven't joined any groups yet.</p>
            <p className="text-sm text-gray-400">Create one to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {groups.map((group) => (
              <Link
                key={group.id}
                href={`/groups/${group.id}`}
                className="block bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-lg text-gray-800">{group.name}</h3>
                  <span className="text-gray-400 text-xl">›</span>
                </div>
                {group.description && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-1">{group.description}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
