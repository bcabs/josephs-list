'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getToolDetails, updateTool, deleteTool, uploadToolImage, Tool } from '@/lib/services/tools';
import Link from 'next/link';

export default function EditToolPage() {
  const { id } = useParams();
  const toolId = Array.isArray(id) ? id[0] : id;
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (toolId) {
      getToolDetails(toolId)
        .then((tool) => {
          if (user && tool.owner_id !== user.id) {
            router.push('/');
            return;
          }
          setName(tool.name);
          setDescription(tool.description || '');
          setImageUrl(tool.image_url || '');
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setError('Failed to load tool details');
          setLoading(false);
        });
    }
  }, [toolId, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !toolId) return;

    setSaving(true);
    setError(null);

    try {
      let finalImageUrl = imageUrl;
      if (image) {
        finalImageUrl = await uploadToolImage(image);
      }

      await updateTool(toolId, {
        name,
        description,
        image_url: finalImageUrl,
      });

      router.push('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!toolId || !confirm('Are you sure you want to delete this tool?')) return;

    setDeleting(true);
    setError(null);

    try {
      await deleteTool(toolId);
      router.push('/');
    } catch (err: any) {
      setError(err.message);
      setDeleting(false);
    }
  };

  if (loading) return <div className="p-4 text-center">Loading tool details...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-sm">
        <h1 className="text-xl font-bold mb-4 text-gray-800">Edit Tool</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tool Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
            {imageUrl && !image && (
              <div className="mb-2 relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100">
                <img src={imageUrl} alt="Current photo" className="object-cover w-full h-full" />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <div className="flex gap-3">
              <Link
                href="/"
                className="flex-1 text-center py-2 px-4 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving || deleting}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
            
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving || deleting}
              className="w-full bg-red-50 text-red-600 py-2 px-4 rounded border border-red-200 hover:bg-red-100 transition disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Delete Tool'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
