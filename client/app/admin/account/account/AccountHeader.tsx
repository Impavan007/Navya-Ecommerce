export default function AccountHeader() {
  return (
    <div className="bg-white border-b border-gray-200 font-playfair">
      <div className=" mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-canela text-2xl font-bold text-[#3D1126]">Account Settings</h1>
              <p className="mt-2 text-gray-600">Manage your profile, payment methods, and preferences</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600 font-poppins">Account Verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}