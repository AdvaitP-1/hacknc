'use client'
import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);


const getCollegeFromEmail = async (email) => {
    try {
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
        })
        const prompt = `Extract the college name from this email address: ${email}. If the email domain is not a college or university, respond with "Unknown".`;
        const result = await model.generateContent(prompt);
        const collegeName = result.response.text().trim(); 
        return collegeName;
    }   catch (error) {
        console.error('Error fetching college name:', error);
        return "Unknown";
    }
}

export default function OnboardingPage() {
    //Getting the current user from Clerk
    const { user } = useUser();
    const router = useRouter();

    //Stating the variables for the form data
    const [college, setCollege] = useState('');
    const [major, setMajor] = useState('');
    const [minor, setMinor] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchCollege = async() => {
            if (user) {
                setLoading(true);
                const email = user?.emailAddresses?.[0]?.emailAddress;
                if (!email) {
                    setLoading(false);
                    return;
                }
                const fetchedCollege = await getCollegeFromEmail(email);
                setCollege(fetchedCollege);
                setLoading(false);
            }
        };
        fetchCollege();
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            await user.update({
                unsafeMetadata: { college, major, minor },
            });

            console.log('Saved user data:', {
              university: college,
              major: major,
              minor: minor
          });
            router.push('/dashboard');
        } catch (error) {
            console.error('Error updating user metadata:', error);
        }
    }

    return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">Complete Your Profile</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* College Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">College</label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700">
              {loading ? 'Detecting your college…' : college || 'Unknown'}
            </div>
          </div>

          {/* Major Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Major</label>
            <input
              type="text"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter your major"
            />
          </div>

          {/* Minor (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minor (Optional)
            </label>
            <input
              type="text"
              value={minor}
              onChange={(e) => setMinor(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter your minor (if any)"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Complete Setup
          </button>
        </form>
      </div>
    </div>
  );


}