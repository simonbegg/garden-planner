import GardenMap from '../components/GardenMap';
import ActivityLog from '../components/ActivityLog';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Garden Management</h1>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="col-span-1">
            <GardenMap />
          </div>
          <div className="col-span-1">
            <ActivityLog />
          </div>
        </div>
      </main>
    </div>
  );
}
