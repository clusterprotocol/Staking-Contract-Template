'use client';
import Link from 'next/link';

const Page = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 via-white to-yellow-100 px-4">
      <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-10 w-full max-w-md text-center border border-yellow-200">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Select Role</h1>
        <p className="text-gray-600 mb-8">Choose how you’d like to use the staking platform.</p>

        <div className="flex flex-col gap-5">
          <Link href="/stake">
            <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-3 rounded-xl shadow-lg transition-all duration-200 hover:scale-[1.02]">
              🚀 Staker
            </button>
          </Link>

          <Link href="/owner">
            <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl shadow-lg transition-all duration-200 hover:scale-[1.02]">
              🛠️ Owner
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Page;
