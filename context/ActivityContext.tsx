'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { activityService } from '../lib/supabaseService';
import { v4 as uuidv4 } from 'uuid';

// Define Activity interface
export interface Activity {
  id: string;
  activityType: string;
  activityDate: string;
  notes?: string;
  plantId?: string;
  gardenLayoutId?: string;
  weatherConditions?: string;
  photoUrl?: string;
  createdAt: string;
}

// Define activity types
export const activityTypes = [
  'planting',
  'watering',
  'fertilizing',
  'pruning',
  'harvesting',
  'weeding',
  'pest_control',
  'planning',
  'other'
];

interface ActivityContextType {
  activities: Activity[];
  loading: boolean;
  error: string | null;
  addActivity: (activityData: Omit<Activity, 'id' | 'createdAt'>) => Promise<Activity | null>;
  updateActivity: (id: string, activityData: Partial<Activity>) => Promise<Activity | null>;
  deleteActivity: (id: string) => Promise<boolean>;
  getActivityById: (id: string) => Activity | undefined;
  getActivitiesByPlant: (plantId: string) => Activity[];
  getActivitiesByLayout: (layoutId: string) => Activity[];
  getActivitiesByType: (type: string) => Activity[];
  getActivitiesByDateRange: (startDate: string, endDate: string) => Activity[];
  refreshActivities: () => Promise<void>;
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export const useActivities = () => {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error('useActivities must be used within an ActivityProvider');
  }
  return context;
};

interface ActivityProviderProps {
  children: ReactNode;
}

export const ActivityProvider: React.FC<ActivityProviderProps> = ({ children }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load activities on initial render
  useEffect(() => {
    refreshActivities();
  }, []);

  const refreshActivities = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedActivities = await activityService.getActivities();
      setActivities(fetchedActivities);
    } catch (err: any) {
      console.error('Error loading activities:', err);
      setError('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const getActivityById = (id: string) => {
    return activities.find(activity => activity.id === id);
  };

  const getActivitiesByPlant = (plantId: string) => {
    return activities.filter(activity => activity.plantId === plantId);
  };

  const getActivitiesByLayout = (layoutId: string) => {
    return activities.filter(activity => activity.gardenLayoutId === layoutId);
  };

  const getActivitiesByType = (type: string) => {
    return activities.filter(activity => activity.activityType === type);
  };

  const getActivitiesByDateRange = (startDate: string, endDate: string) => {
    return activities.filter(activity => {
      const activityDate = new Date(activity.activityDate);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return activityDate >= start && activityDate <= end;
    });
  };

  const addActivity = async (activityData: Omit<Activity, 'id' | 'createdAt'>) => {
    try {
      // Optimistic UI update with a temporary ID
      const tempId = `temp-${uuidv4()}`;
      const tempActivity = { 
        ...activityData, 
        id: tempId,
        createdAt: new Date().toISOString()
      } as Activity;
      
      setActivities(prevActivities => [...prevActivities, tempActivity]);
      
      // Actual API call
      const newActivity = await activityService.createActivity(activityData);
      
      if (newActivity) {
        // Replace the temp activity with the actual one from the API
        setActivities(prevActivities => 
          prevActivities.map(a => a.id === tempId ? newActivity : a)
        );
        return newActivity;
      }
      
      return null;
    } catch (err: any) {
      console.error('Error adding activity:', err);
      setError(err.message || 'Failed to add activity');
      
      // Revert optimistic update
      setActivities(prevActivities => prevActivities.filter(a => !a.id.startsWith('temp-')));
      return null;
    }
  };

  const updateActivity = async (id: string, activityData: Partial<Activity>) => {
    try {
      // Optimistic UI update
      const existingActivity = activities.find(a => a.id === id);
      if (!existingActivity) {
        throw new Error('Activity not found');
      }
      
      const updatedActivity = { ...existingActivity, ...activityData };
      setActivities(prevActivities => 
        prevActivities.map(a => a.id === id ? updatedActivity : a)
      );

      // Actual API call
      const result = await activityService.updateActivity(id, activityData);
      
      if (result) {
        // Update with the actual data from the API
        setActivities(prevActivities => 
          prevActivities.map(a => a.id === id ? result : a)
        );
        return result;
      }
      
      return null;
    } catch (err: any) {
      console.error('Error updating activity:', err);
      setError(err.message || 'Failed to update activity');
      
      // Revert optimistic update
      refreshActivities();
      return null;
    }
  };

  const deleteActivity = async (id: string) => {
    try {
      // Optimistic UI update
      const activityToDelete = activities.find(a => a.id === id);
      if (!activityToDelete) {
        throw new Error('Activity not found');
      }
      
      setActivities(prevActivities => prevActivities.filter(a => a.id !== id));

      // Actual API call
      const success = await activityService.deleteActivity(id);
      
      if (!success) {
        // Revert optimistic update if API call fails
        setActivities(prevActivities => [...prevActivities, activityToDelete]);
        return false;
      }
      
      return true;
    } catch (err: any) {
      console.error('Error deleting activity:', err);
      setError(err.message || 'Failed to delete activity');
      
      // Revert optimistic update
      refreshActivities();
      return false;
    }
  };

  return (
    <ActivityContext.Provider
      value={{
        activities,
        loading,
        error,
        addActivity,
        updateActivity,
        deleteActivity,
        getActivityById,
        getActivitiesByPlant,
        getActivitiesByLayout,
        getActivitiesByType,
        getActivitiesByDateRange,
        refreshActivities,
      }}
    >
      {children}
    </ActivityContext.Provider>
  );
};
