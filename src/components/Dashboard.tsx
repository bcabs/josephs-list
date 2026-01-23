'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getAllUserTools, Tool } from '@/lib/services/tools';
import { getUserGroups, Group } from '@/lib/services/groups';
import Link from 'next/link';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [tools, setTools] = useState<Tool[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      Promise.all([
        getAllUserTools(user.id),
        getUserGroups(user.id)
      ])
        .then(([toolsData, groupsData]) => {
          setTools(toolsData);
          setGroups(groupsData);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (loading) return <div className="p-4 text-center">Loading community tools...</div>;

  return (
    <div className="p-4 max-w-md mx-auto">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Community Tools</h1>
          <button onClick={() => signOut()} className="text-xs text-red-500 hover:underline">
            Sign Out
          </button>
        </div>
        <div className="flex gap-2">
           <Link 
            href="/tools/create" 
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 h-8 flex items-center"
          >
            + List Tool
          </Link>
        </div>
      </header>

      {/* Groups Quick Access */}
      <div className="mb-8 overflow-x-auto whitespace-nowrap pb-2 no-scrollbar">
        <div className="inline-flex gap-2">
          <Link 
             href="/groups/create"
             className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 font-bold flex-shrink-0"
             title="Create Group"
          >
            +
          </Link>
          {groups.map(group => (
            <Link
              key={group.id}
              href={`/groups/${group.id}`}
              className="inline-block px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:border-blue-400 hover:text-blue-600 transition flex-shrink-0"
            >
              {group.name}
            </Link>
          ))}
        </div>
      </div>

      {tools.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-100">
          <p className="text-gray-500 mb-4">No tools listed yet.</p>
          <p className="text-sm text-gray-400">Join a group or list your first tool!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tools.map((tool) => (
            <div key={tool.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {tool.image_url && (
                <div className="aspect-video w-full relative bg-gray-100">
                  <img 
                    src={tool.image_url} 
                    alt={tool.name}
                    className="object-cover w-full h-full"
                  />
                </div>
              )}
              <div className="p-4">
                <h3 className="font-semibold text-lg text-gray-800">{tool.name}</h3>
                <p className="text-gray-600 text-sm mt-1">{tool.description}</p>
                <div className="mt-2 text-xs text-gray-400">
                  Listed in {groups.find(g => g.id === tool.group_id)?.name || 'Unknown Group'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
