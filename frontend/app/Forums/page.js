'use client'
import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import Navbar from '../components/navbar';


const forumsData = [
    // Store all forums
];

export default function ForumsPage() {
  const { isSignedIn, userId } = useAuth();
  const [search, setSearch] = useState('');
  // Remove duplicate filteredForums declaration

  if (!isSignedIn) {
    return (
      <div>
        <Navbar />
        <div className="pt-32 min-h-screen flex flex-col items-center justify-center bg-gray-100">
          <div className="p-8 border rounded bg-white shadow-md">
            <h2 className="text-2xl font-bold text-black mb-4 text-center">You have to be logged in to view forums.</h2>
            <p className="text-black text-center">Please log in to access and participate in the forums.</p>
          </div>
        </div>
      </div>
    );
  }

  // Forum creation state
  const [forumTitle, setForumTitle] = useState('');
  const [forumContent, setForumContent] = useState('');
  const [forums, setForums] = useState(forumsData);

  // Publish forum handler
  const handlePublishForum = () => {
    if (!forumTitle || !forumContent) return;
    const username = userId || 'anonymous';
    const newForum = {
      id: Date.now(),
      title: `${forumTitle}_${username}`,
      description: forumContent,
    };
    setForums([newForum, ...forums]);
    setForumTitle('');
    setForumContent('');
  };

  const filteredForums = forums.filter(forum =>
    forum.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <Navbar />
      <div className="pt-32">
        <div className="flex flex-col md:flex-row p-4 gap-8 max-w-6xl mx-auto">
          {/* Forum creation UI */}
          <div className="md:w-1/3 w-full p-4 border rounded bg-gray-100 flex flex-col sticky top-36">
          <h2 className="font-bold mb-2 text-black">Create a Forum</h2>
          <input
            type="text"
            placeholder="Forum Title"
            value={forumTitle}
            onChange={e => setForumTitle(e.target.value)}
            className="p-2 border rounded mb-2 text-black placeholder-black"
          />
          <textarea
            placeholder="Forum Content"
            value={forumContent}
            onChange={e => setForumContent(e.target.value)}
            className="p-2 border rounded mb-2 text-black placeholder-black h-24"
          />
          <button
            onClick={handlePublishForum}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Publish
          </button>
        </div>
          {/* Forums list and search */}
          <div className="md:w-2/3 w-full">
          <input
            type="text"
            placeholder="Search forums..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full p-2 border rounded mb-4 text-black placeholder-black"
          />
          <div>
            {filteredForums.length > 0 ? (
              filteredForums.map(forum => (
                <div key={forum.id} className="p-4 mb-2 border rounded text-black bg-white">
                  <h2 className="font-bold text-black">{forum.title}</h2>
                  <p className="text-black">{forum.description}</p>
                </div>
              ))
            ) : (
              <p className="text-black">No forums found.</p>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
