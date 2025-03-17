'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Plant } from '../lib/types';
import { plantService } from '../lib/supabaseService';
import { v4 as uuidv4 } from 'uuid';

// Define available plant colors
export const plantColors = [
  'bg-red-500',
  'bg-orange-500',
  'bg-yellow-500',
  'bg-green-500',
  'bg-green-700',
  'bg-blue-500',
  'bg-indigo-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-gray-500',
];

interface PlantContextType {
  plants: Plant[];
  loading: boolean;
  error: string | null;
  addPlant: (plantData: Omit<Plant, 'id'>) => Promise<Plant | null>;
  updatePlant: (id: string, plantData: Partial<Plant>) => Promise<Plant | null>;
  deletePlant: (id: string) => Promise<boolean>;
  getPlantById: (id: string) => Plant | undefined;
  getVegetablePlants: () => Plant[];
  getPlantsByType: (type: Plant['type']) => Plant[];
  refreshPlants: () => Promise<void>;
}

const PlantContext = createContext<PlantContextType | undefined>(undefined);

export const usePlants = () => {
  const context = useContext(PlantContext);
  if (!context) {
    throw new Error('usePlants must be used within a PlantProvider');
  }
  return context;
};

interface PlantProviderProps {
  children: ReactNode;
}

export const PlantProvider: React.FC<PlantProviderProps> = ({ children }) => {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load plants on initial render
  useEffect(() => {
    refreshPlants();
  }, []);

  const refreshPlants = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedPlants = await plantService.getPlants();
      setPlants(fetchedPlants);
    } catch (err: any) {
      console.error('Error loading plants:', err);
      setError('Failed to load plants');
    } finally {
      setLoading(false);
    }
  };

  const getPlantById = (id: string) => {
    return plants.find(plant => plant.id === id);
  };

  const getVegetablePlants = () => {
    return plants.filter(plant => plant.type === 'vegetable');
  };

  const getPlantsByType = (type: Plant['type']) => {
    return plants.filter(plant => plant.type === type);
  };

  const addPlant = async (plantData: Omit<Plant, 'id'>) => {
    try {
      // Optimistic UI update with a temporary ID
      const tempId = `temp-${uuidv4()}`;
      const tempPlant = { ...plantData, id: tempId } as Plant;
      
      setPlants(prevPlants => [...prevPlants, tempPlant]);
      
      // Actual API call
      const newPlant = await plantService.createPlant(plantData);
      
      if (newPlant) {
        // Replace the temp plant with the actual one from the API
        setPlants(prevPlants => 
          prevPlants.map(p => p.id === tempId ? newPlant : p)
        );
        return newPlant;
      }
      
      return null;
    } catch (err: any) {
      console.error('Error adding plant:', err);
      setError(err.message || 'Failed to add plant');
      
      // Revert optimistic update
      setPlants(prevPlants => prevPlants.filter(p => !p.id.startsWith('temp-')));
      return null;
    }
  };

  const updatePlant = async (id: string, plantData: Partial<Plant>) => {
    try {
      // Optimistic UI update
      const existingPlant = plants.find(p => p.id === id);
      if (!existingPlant) {
        throw new Error('Plant not found');
      }
      
      const updatedPlant = { ...existingPlant, ...plantData };
      setPlants(prevPlants => 
        prevPlants.map(p => p.id === id ? updatedPlant : p)
      );

      // Actual API call
      const result = await plantService.updatePlant(id, plantData);
      
      if (result) {
        // Update with the actual data from the API
        setPlants(prevPlants => 
          prevPlants.map(p => p.id === id ? result : p)
        );
        return result;
      }
      
      return null;
    } catch (err: any) {
      console.error('Error updating plant:', err);
      setError(err.message || 'Failed to update plant');
      
      // Revert optimistic update
      refreshPlants();
      return null;
    }
  };

  const deletePlant = async (id: string) => {
    try {
      // Optimistic UI update
      const plantToDelete = plants.find(p => p.id === id);
      if (!plantToDelete) {
        throw new Error('Plant not found');
      }
      
      setPlants(prevPlants => prevPlants.filter(p => p.id !== id));

      // Actual API call
      const success = await plantService.deletePlant(id);
      
      if (!success) {
        // Revert optimistic update if API call fails
        setPlants(prevPlants => [...prevPlants, plantToDelete]);
        return false;
      }
      
      return true;
    } catch (err: any) {
      console.error('Error deleting plant:', err);
      setError(err.message || 'Failed to delete plant');
      
      // Revert optimistic update
      refreshPlants();
      return false;
    }
  };

  return (
    <PlantContext.Provider
      value={{
        plants,
        loading,
        error,
        addPlant,
        updatePlant,
        deletePlant,
        getPlantById,
        getVegetablePlants,
        getPlantsByType,
        refreshPlants,
      }}
    >
      {children}
    </PlantContext.Provider>
  );
};
