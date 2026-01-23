'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getGroupDetails, getGroupMembers, inviteUserByEmail, updateGroup, Group, GroupMember } from '@/lib/services/groups';
import Link from 'next/link';

export default function GroupDetailsPage() {
  const { id } = useParams();
  const groupId = Array.isArray(id) ? id[0] : id;
  const { user } = useAuth();
  const router = useRouter();

  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user && groupId) {
      loadGroupData();
    }
  }, [user, groupId]);

  const loadGroupData = async () => {
    if (!groupId) return;
    try {
      const groupData = await getGroupDetails(groupId);
      setGroup(groupData);
      setEditedName(groupData.name);
      setEditedDescription(groupData.description || '');
      const membersData = await getGroupMembers(groupId);
      setMembers(membersData);
    } catch (err) {
      console.error(err);
      setError('Failed to load group data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGroup = async () => {
    if (!groupId) return;
    setSaveLoading(true);
    setError(null);
    try {
      const updated = await updateGroup(groupId, {
        name: editedName,
        description: editedDescription,
      });
      setGroup(updated);
      setIsEditing(false);
      setMessage('Group updated successfully!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupId) return;
    
    setInviteLoading(true);
    setError(null);
    setMessage(null);

    try {
      await inviteUserByEmail(groupId, inviteEmail);
      setMessage('User added successfully!');
      setInviteEmail('');
      loadGroupData(); // Refresh list
    } catch (err: any) {
      setError(err.message);
    } finally {
      setInviteLoading(false);
    }
  };

  if (loading) return <div className="p-4 text-center">Loading group...</div>;
  if (!group) return <div className="p-4 text-center">Group not found.</div>;

  const isAdmin = user?.id === group.admin_id;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-3 mb-4">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="w-full text-2xl font-bold p-1 border rounded"
                />
                <textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  placeholder="Group description..."
                  className="w-full p-2 border rounded text-gray-600"
                  rows={3}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveGroup}
                    disabled={saveLoading}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                  >
                    {saveLoading ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditedName(group.name);
                      setEditedDescription(group.description || '');
                    }}
                    className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-800">{group.name}</h1>
                  {isAdmin && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Edit Details
                    </button>
                  )}
                </div>
                {group.description && (
                  <p className="text-gray-600 mt-2 whitespace-pre-wrap">{group.description}</p>
                )}
              </>
            )}
          </div>
          <Link href="/" className="text-sm text-blue-600 hover:underline ml-4">
            Back
          </Link>
        </div>

        {isAdmin && (
          <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h2 className="font-semibold text-lg mb-2 text-gray-800">Invite Members</h2>
            <form onSubmit={handleInvite} className="flex gap-2">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Enter user email"
                className="flex-1 p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                required
              />
              <button
                type="submit"
                disabled={inviteLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
              >
                {inviteLoading ? 'Adding...' : 'Add'}
              </button>
            </form>
            {message && <p className="text-green-600 text-sm mt-2">{message}</p>}
            {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
          </div>
        )}

        <div>
          <h2 className="font-semibold text-lg mb-4 text-gray-800">Members ({members.length})</h2>
          <div className="space-y-2">
            {members.map((member) => (
              <div key={member.user_id} className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-100">
                <div>
                  <p className="font-medium text-gray-900">{member.profiles.full_name || 'Unnamed User'}</p>
                  <p className="text-sm text-gray-500">{member.profiles.email}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${member.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-200 text-gray-700'}`}>
                  {member.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
