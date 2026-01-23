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
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredTools = tools.filter(tool => 
    tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="p-4 text-center">Loading community tools...</div>;

  return (
    <div className="p-4 max-w-md mx-auto">
      <header className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Community Tools</h1>
            <button onClick={() => signOut()} className="text-xs text-red-500 hover:underline">
              Sign Out
            </button>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
           <Link 
            href="/tools/create" 
            className="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 flex-1 text-center font-medium"
          >
            + List Tool
          </Link>
          <Link 
            href="/groups" 
            className="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 flex-1 text-center font-medium"
          >
            Manage Groups
          </Link>
          <Link 
            href={`/users/${user?.id}`} 
            className="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 flex-1 text-center font-medium"
          >
            Manage Profile
          </Link>
        </div>
      </header>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search tools..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900"
        />
      </div>

      {filteredTools.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-100">
          <p className="text-gray-500 mb-4">No tools found.</p>
          <p className="text-sm text-gray-400">Try a different search term or list your first tool!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTools.map((tool) => (
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
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-800">{tool.name}</h3>
                    <p className="text-xs text-gray-500 mb-2">
                      by{' '}
                      <Link href={`/users/${tool.owner_id}`} className="text-blue-600 hover:underline font-medium">
                        {tool.profiles?.full_name || 'Unnamed User'}
                      </Link>
                    </p>
                  </div>
                  {user?.id === tool.owner_id && (
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
  );
}
