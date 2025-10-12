'use client'
import Navbar from '../../components/navbar';

const LoadingSpinner = ({ message = "Loading dashboard..." }) => (
  <>
    <Navbar />
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-purple-500 rounded-full animate-spin mx-auto"></div>
        <p className="text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  </>
);

export default LoadingSpinner;