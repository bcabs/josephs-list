import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-sm">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-[family-name:var(--font-medieval-sharp)] font-bold text-gray-800">About St. Joseph's List</h1>
          <Link href="/" className="text-sm text-blue-600 hover:underline">
            Back
          </Link>
        </header>
        
        <div className="text-gray-700 space-y-4 leading-relaxed">
          <p>
            This was built by Bruno Cabral using AI. The backend is Vercel and Supabase.
          </p>
          <p>
            "All the believers were together and had everything in common". There is nothing more pleasing to the male Midwestern soul than lending a tool to a friend. This site was created with this intention in mind.
          </p>
          <p>
            The key "innovation" here is to center everything around groups that you are a part of in real-life. The tool listings that you create are visible to all the members of the groups that you are a part of.
          </p>
          <p>
            For now - I just want to deliver on the core "tool sharing" functionality, but I would love to expand this to cover things like "work wanted", "work offered", "giveaway items", etc. What I don't want to do is turn this into a social-network. All 1-1 communication should occur directly, outside of the app.
          </p>
          <p className="font-semibold text-red-600 bg-red-50 p-2 rounded">
            Use this site with zero expectations of privacy and security. Assume that everything you post will be published in the Northwest Herald tomorrow.
          </p>
          <p>
            Feedback and suggestions are very much welcome.
          </p>
        </div>
      </div>
    </div>
  );
}
