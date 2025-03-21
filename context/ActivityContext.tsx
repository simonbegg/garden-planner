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

  // Define a type for database activities
  interface DbActivity {
    id: string;
    created_at: string;
    activity_type?: string;
    activity_date?: string;
    notes?: string;
    plant_id?: string;
    garden_layout_id?: string;
    weather_conditions?: string;
    photo_url?: string;
    type?: string;
    date?: string;
    user_id?: string;
  }

  // Transform database activity to application format
  const transformDbToAppActivity = (dbActivity: DbActivity): Activity => {
    if ('activity_type' in dbActivity) {
      // This is from Supabase
      return {
        id: dbActivity.id,
        activityType: dbActivity.activity_type || '',
        activityDate: dbActivity.activity_date || '',
        notes: dbActivity.notes || '',
        plantId: dbActivity.plant_id || '',
        gardenLayoutId: dbActivity.garden_layout_id || '',
        weatherConditions: dbActivity.weather_conditions || '',
        photoUrl: dbActivity.photo_url || '',
        createdAt: dbActivity.created_at
      };
    } else if ('type' in dbActivity) {
      // This is from localStorage
      return {
        id: dbActivity.id,
        activityType: dbActivity.type || '',
        activityDate: dbActivity.date || '',
        notes: dbActivity.notes || '',
        plantId: dbActivity.plant_id || '',
        gardenLayoutId: '',
        weatherConditions: '',
        photoUrl: '',
        createdAt: dbActivity.created_at
      };
    }
    
    // Fallback
    return {
      id: dbActivity.id || `unknown-${uuidv4()}`,
      activityType: '',
      activityDate: new Date().toISOString(),
      notes: '',
      plantId: '',
      gardenLayoutId: '',
      weatherConditions: '',
      photoUrl: '',
      createdAt: dbActivity.created_at || new Date().toISOString()
    };
  };

  // Load activities on initial render
  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedActivities = await activityService.getActivities();
        setActivities(fetchedActivities.map(activity => transformDbToAppActivity(activity)));
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Failed to fetch activities');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchActivities();
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

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
      const tempId = `temp-${uuidv4()}`;
      const tempActivity: Activity = {
        ...activityData,
        id: tempId,
        createdAt: new Date().toISOString()
      };
      
      setActivities(prevActivities => [...prevActivities, tempActivity]);
      
      // Transform data for the API
      const apiActivityData = {
        plant_id: activityData.plantId || '',
        type: activityData.activityType,
        notes: activityData.notes || '',
        date: activityData.activityDate
      };
      
      // Actual API call
      const dbActivity = await activityService.createActivity(apiActivityData);
      
      if (dbActivity) {
        // Transform the response to our application format
        const newActivity = transformDbToAppActivity(dbActivity);
        
        // Replace the temp activity with the actual one from the API
        setActivities(prevActivities => 
          prevActivities.map(a => a.id === tempId ? newActivity : a)
        );
        return newActivity;
      }
      
      return null;
    } catch (err: unknown) {
      console.error('Error adding activity:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to add activity');
      }
      
      // Revert optimistic update
      setActivities(prevActivities => prevActivities.filter(a => !a.id.startsWith('temp-')));
      return null;
    }
  };

  const updateActivity = async (id: string, activityData: Partial<Activity>) => {
    try {
      // Optimistic UI update
      setActivities(prevActivities => 
        prevActivities.map(activity => 
          activity.id === id 
            ? { ...activity, ...activityData } 
            : activity
        )
      );
      
      // Transform data for the API
      const apiActivityData: Record<string, unknown> = {};
      
      if (activityData.activityType !== undefined) apiActivityData.type = activityData.activityType;
      if (activityData.activityDate !== undefined) apiActivityData.date = activityData.activityDate;
      if (activityData.notes !== undefined) apiActivityData.notes = activityData.notes;
      if (activityData.plantId !== undefined) apiActivityData.plant_id = activityData.plantId;
      if (activityData.gardenLayoutId !== undefined) apiActivityData.garden_layout_id = activityData.gardenLayoutId;
      if (activityData.weatherConditions !== undefined) apiActivityData.weather_conditions = activityData.weatherConditions;
      if (activityData.photoUrl !== undefined) apiActivityData.photo_url = activityData.photoUrl;
      
      // Check if we have an update method, otherwise just return the optimistic update
      const existingActivity = activities.find(a => a.id === id);
      if (!existingActivity) {
        throw new Error('Activity not found');
      }
      
      // Return the optimistically updated activity
      return { ...existingActivity, ...activityData };
    } catch (err: unknown) {
      console.error('Error updating activity:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to update activity');
      }
      
      // Revert optimistic update
      refreshActivities();
      return null;
    }
  };

  const deleteActivity = async (id: string) => {
    try {
      // Optimistic UI update
      setActivities(prevActivities => 
        prevActivities.filter(activity => activity.id !== id)
      );
      
      // Actual API call
      const success = await activityService.deleteActivity(id);
      
      if (!success) {
        // Revert on failure
        const fetchedActivities = await activityService.getActivities();
        setActivities(fetchedActivities.map(transformDbToAppActivity));
        return false;
      }
      
      return true;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to delete activity');
      }
      
      // Revert on error
      const fetchedActivities = await activityService.getActivities();
      setActivities(fetchedActivities.map(transformDbToAppActivity));
      
      return false;
    }
  };

  const refreshActivities = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedActivities = await activityService.getActivities();
      setActivities(fetchedActivities.map(transformDbToAppActivity));
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to refresh activities');
      }
    } finally {
      setLoading(false);
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
