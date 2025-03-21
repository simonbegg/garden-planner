'use client';

import React, { useState } from 'react';
import { useActivities, Activity } from '../../context/ActivityContext';
import { usePlants } from '../../context/PlantContext';
import { useGardenLayouts } from '../../context/GardenLayoutContext';
import ActivityForm from '../../components/ActivityForm';
import Modal from '../../components/Modal';
import Image from 'next/image';

export default function ActivitiesPage() {
  const { activities, loading, error, deleteActivity } = useActivities();
  const { plants } = usePlants();
  const { layouts } = useGardenLayouts();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [editActivity, setEditActivity] = useState<Activity | null>(null);
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  // Get plant name by ID
  const getPlantName = (plantId?: string) => {
    if (!plantId) return 'N/A';
    const plant = plants.find(p => p.id === plantId);
    return plant ? `${plant.name} (${plant.variety})` : 'Unknown Plant';
  };

  // Get layout name by ID
  const getLayoutName = (layoutId?: string) => {
    if (!layoutId) return 'N/A';
    const layout = layouts.find(l => l.id === layoutId);
    return layout ? layout.name : 'Unknown Layout';
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Filter activities based on selected filter
  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    if (filter === 'plant' && activity.plantId) return true;
    if (filter === 'layout' && activity.gardenLayoutId) return true;
    if (filter === activity.activityType) return true;
    
    // Date range filter
    if (filter === 'date-range') {
      if (!dateRange.startDate || !dateRange.endDate) return true;
      
      const activityDate = new Date(activity.activityDate);
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      
      // Set end date to end of day
      endDate.setHours(23, 59, 59, 999);
      
      return activityDate >= startDate && activityDate <= endDate;
    }
    
    return false;
  });

  // Handle activity deletion
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      await deleteActivity(id);
    }
  };

  // Handle activity edit
  const handleEdit = (activity: Activity) => {
    setEditActivity(activity);
  };

  // Close edit modal
  const handleCloseEdit = () => {
    setEditActivity(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Garden Activities</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
      )}
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Log New Activity
        </button>
        
        <div className="flex flex-col md:flex-row gap-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="shadow border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="all">All Activities</option>
            <option value="plant">Plant Related</option>
            <option value="layout">Layout Related</option>
            <option value="planting">Planting</option>
            <option value="watering">Watering</option>
            <option value="fertilizing">Fertilizing</option>
            <option value="pruning">Pruning</option>
            <option value="harvesting">Harvesting</option>
            <option value="weeding">Weeding</option>
            <option value="pest_control">Pest Control</option>
            <option value="planning">Planning</option>
            <option value="date-range">Date Range</option>
          </select>
          
          {filter === 'date-range' && (
            <div className="flex gap-2">
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                className="shadow border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Start Date"
              />
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                className="shadow border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="End Date"
              />
            </div>
          )}
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading activities...</p>
        </div>
      ) : filteredActivities.length === 0 ? (
        <div className="text-center py-8 bg-gray-100 rounded-lg">
          <p className="text-gray-500">No activities found. Start by logging a new activity!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredActivities.map(activity => (
            <div key={activity.id} className="bg-white shadow-md rounded-lg p-4 border-l-4 border-green-500">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold capitalize">
                    {activity.activityType.replace('_', ' ')}
                  </h3>
                  <p className="text-sm text-gray-500">{formatDate(activity.activityDate)}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(activity)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(activity.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                {activity.plantId && (
                  <div>
                    <span className="text-sm font-semibold">Plant:</span>{' '}
                    <span className="text-sm">{getPlantName(activity.plantId)}</span>
                  </div>
                )}
                
                {activity.gardenLayoutId && (
                  <div>
                    <span className="text-sm font-semibold">Layout:</span>{' '}
                    <span className="text-sm">{getLayoutName(activity.gardenLayoutId)}</span>
                  </div>
                )}
                
                {activity.weatherConditions && (
                  <div>
                    <span className="text-sm font-semibold">Weather:</span>{' '}
                    <span className="text-sm">{activity.weatherConditions}</span>
                  </div>
                )}
              </div>
              
              {activity.notes && (
                <div className="mt-3">
                  <p className="text-sm font-semibold">Notes:</p>
                  <p className="text-sm mt-1 bg-gray-50 p-2 rounded">{activity.notes}</p>
                </div>
              )}
              
              {activity.photoUrl && (
                <div className="mt-3">
                  <Image 
                    src={activity.photoUrl} 
                    alt="Activity photo" 
                    width={500}
                    height={300}
                    className="w-full max-h-48 object-cover rounded"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Add Activity Modal */}
      {showAddModal && (
        <Modal onClose={() => setShowAddModal(false)}>
          <ActivityForm onClose={() => setShowAddModal(false)} />
        </Modal>
      )}
      
      {/* Edit Activity Modal */}
      {editActivity && (
        <Modal onClose={handleCloseEdit}>
          <ActivityForm 
            initialActivity={editActivity} 
            onClose={handleCloseEdit}
            isEdit
          />
        </Modal>
      )}
    </div>
  );
}
