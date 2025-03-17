'use client';

import React, { useState, useEffect } from 'react';
import { useActivities, activityTypes, Activity } from '../context/ActivityContext';
import { usePlants } from '../context/PlantContext';
import { useGardenLayouts } from '../context/GardenLayoutContext';

interface ActivityFormProps {
  initialActivity?: Partial<Activity>;
  onClose: () => void;
  isEdit?: boolean;
}

const ActivityForm: React.FC<ActivityFormProps> = ({ 
  initialActivity, 
  onClose,
  isEdit = false
}) => {
  const { addActivity, updateActivity } = useActivities();
  const { plants } = usePlants();
  const { layouts } = useGardenLayouts();
  
  const [formData, setFormData] = useState<Partial<Activity>>({
    activityType: initialActivity?.activityType || 'planting',
    activityDate: initialActivity?.activityDate || new Date().toISOString().split('T')[0],
    notes: initialActivity?.notes || '',
    plantId: initialActivity?.plantId || '',
    gardenLayoutId: initialActivity?.gardenLayoutId || '',
    weatherConditions: initialActivity?.weatherConditions || '',
    photoUrl: initialActivity?.photoUrl || '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      if (isEdit && initialActivity?.id) {
        await updateActivity(initialActivity.id, formData);
      } else {
        await addActivity(formData as Omit<Activity, 'id' | 'createdAt'>);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save activity');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
      <h2 className="text-xl font-semibold mb-4">
        {isEdit ? 'Edit Activity' : 'Log New Activity'}
      </h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="activityType">
            Activity Type
          </label>
          <select
            id="activityType"
            name="activityType"
            value={formData.activityType}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          >
            {activityTypes.map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="activityDate">
            Date
          </label>
          <input
            id="activityDate"
            name="activityDate"
            type="date"
            value={formData.activityDate}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="plantId">
            Plant (Optional)
          </label>
          <select
            id="plantId"
            name="plantId"
            value={formData.plantId || ''}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="">-- Select Plant --</option>
            {plants.map(plant => (
              <option key={plant.id} value={plant.id}>
                {plant.name} ({plant.variety})
              </option>
            ))}
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="gardenLayoutId">
            Garden Layout (Optional)
          </label>
          <select
            id="gardenLayoutId"
            name="gardenLayoutId"
            value={formData.gardenLayoutId || ''}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="">-- Select Layout --</option>
            {layouts.map(layout => (
              <option key={layout.id} value={layout.id}>
                {layout.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="weatherConditions">
            Weather Conditions (Optional)
          </label>
          <input
            id="weatherConditions"
            name="weatherConditions"
            type="text"
            value={formData.weatherConditions || ''}
            onChange={handleChange}
            placeholder="e.g., Sunny, Rainy, etc."
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="notes">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes || ''}
            onChange={handleChange}
            rows={4}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="photoUrl">
            Photo URL (Optional)
          </label>
          <input
            id="photoUrl"
            name="photoUrl"
            type="text"
            value={formData.photoUrl || ''}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            {isSubmitting ? 'Saving...' : isEdit ? 'Update Activity' : 'Log Activity'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ActivityForm;
