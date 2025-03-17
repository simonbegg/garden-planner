'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GardenLayout, GridCell } from '../lib/types';
import { gardenLayoutService } from '../lib/supabaseService';
import { v4 as uuidv4 } from 'uuid';

interface GardenLayoutContextType {
  layouts: GardenLayout[];
  currentLayout: GardenLayout | null;
  loading: boolean;
  error: string | null;
  addLayout: (layoutData: Omit<GardenLayout, 'id'>) => Promise<GardenLayout | null>;
  updateLayout: (id: string, layoutData: Partial<GardenLayout>) => Promise<GardenLayout | null>;
  deleteLayout: (id: string) => Promise<boolean>;
  setCurrentLayout: (layout: GardenLayout | null) => void;
  updateCell: (layoutId: string, x: number, y: number, cell: GridCell) => Promise<boolean>;
  refreshLayouts: () => Promise<void>;
}

const GardenLayoutContext = createContext<GardenLayoutContextType | undefined>(undefined);

export const useGardenLayouts = () => {
  const context = useContext(GardenLayoutContext);
  if (!context) {
    throw new Error('useGardenLayouts must be used within a GardenLayoutProvider');
  }
  return context;
};

interface GardenLayoutProviderProps {
  children: ReactNode;
}

export const GardenLayoutProvider: React.FC<GardenLayoutProviderProps> = ({ children }) => {
  const [layouts, setLayouts] = useState<GardenLayout[]>([]);
  const [currentLayout, setCurrentLayout] = useState<GardenLayout | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load layouts on initial render
  useEffect(() => {
    refreshLayouts();
  }, []);

  const refreshLayouts = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedLayouts = await gardenLayoutService.getLayouts();
      setLayouts(fetchedLayouts);
      
      // Set the first layout as current if none is selected
      if (!currentLayout && fetchedLayouts.length > 0) {
        setCurrentLayout(fetchedLayouts[0]);
      }
    } catch (err: any) {
      console.error('Error loading layouts:', err);
      setError('Failed to load layouts');
    } finally {
      setLoading(false);
    }
  };

  const addLayout = async (layoutData: Omit<GardenLayout, 'id'>) => {
    try {
      // Optimistic UI update
      const tempId = `temp-${uuidv4()}`;
      const tempLayout = { ...layoutData, id: tempId } as GardenLayout;
      setLayouts(prevLayouts => [...prevLayouts, tempLayout]);
      
      // Set as current layout
      setCurrentLayout(tempLayout);

      // Actual API call
      const newLayout = await gardenLayoutService.createLayout(layoutData);
      
      if (newLayout) {
        // Replace the temp layout with the actual one from the API
        setLayouts(prevLayouts => 
          prevLayouts.map(l => l.id === tempId ? newLayout : l)
        );
        setCurrentLayout(newLayout);
        return newLayout;
      }
      
      return null;
    } catch (err: any) {
      console.error('Error adding layout:', err);
      setError(err.message || 'Failed to add layout');
      
      // Revert optimistic update
      setLayouts(prevLayouts => prevLayouts.filter(l => !l.id.startsWith('temp-')));
      if (currentLayout?.id.startsWith('temp-')) {
        setCurrentLayout(layouts.length > 0 ? layouts[0] : null);
      }
      return null;
    }
  };

  const updateLayout = async (id: string, layoutData: Partial<GardenLayout>) => {
    try {
      // Optimistic UI update
      const existingLayout = layouts.find(l => l.id === id);
      if (!existingLayout) {
        throw new Error('Layout not found');
      }
      
      const updatedLayout = { ...existingLayout, ...layoutData } as GardenLayout;
      setLayouts(prevLayouts => 
        prevLayouts.map(l => l.id === id ? updatedLayout : l)
      );
      
      // Update current layout if it's the one being modified
      if (currentLayout?.id === id) {
        setCurrentLayout(updatedLayout);
      }

      // Actual API call
      const result = await gardenLayoutService.updateLayout(id, layoutData);
      
      if (result) {
        // Update with the actual data from the API
        setLayouts(prevLayouts => 
          prevLayouts.map(l => l.id === id ? result : l)
        );
        
        // Update current layout if it's the one that was modified
        if (currentLayout?.id === id) {
          setCurrentLayout(result);
        }
        
        return result;
      }
      
      return null;
    } catch (err: any) {
      console.error('Error updating layout:', err);
      setError(err.message || 'Failed to update layout');
      
      // Revert optimistic update
      refreshLayouts();
      return null;
    }
  };

  const deleteLayout = async (id: string) => {
    try {
      // Optimistic UI update
      const layoutToDelete = layouts.find(l => l.id === id);
      if (!layoutToDelete) {
        throw new Error('Layout not found');
      }
      
      setLayouts(prevLayouts => prevLayouts.filter(l => l.id !== id));
      
      // If the current layout is being deleted, set a new current layout
      if (currentLayout?.id === id) {
        const remainingLayouts = layouts.filter(l => l.id !== id);
        setCurrentLayout(remainingLayouts.length > 0 ? remainingLayouts[0] : null);
      }

      // Actual API call
      const success = await gardenLayoutService.deleteLayout(id);
      
      if (!success) {
        // Revert optimistic update if API call fails
        setLayouts(prevLayouts => [...prevLayouts, layoutToDelete]);
        
        // Reset current layout if it was the one being deleted
        if (currentLayout === null && layoutToDelete) {
          setCurrentLayout(layoutToDelete);
        }
        
        return false;
      }
      
      return true;
    } catch (err: any) {
      console.error('Error deleting layout:', err);
      setError(err.message || 'Failed to delete layout');
      
      // Revert optimistic update
      refreshLayouts();
      return false;
    }
  };

  const updateCell = async (layoutId: string, x: number, y: number, cell: GridCell) => {
    try {
      // Find the layout to update
      const layoutToUpdate = layouts.find(l => l.id === layoutId);
      if (!layoutToUpdate) {
        throw new Error('Layout not found');
      }
      
      // Create a deep copy of the grid
      const updatedGrid = JSON.parse(JSON.stringify(layoutToUpdate.grid));
      
      // Update the specific cell
      updatedGrid[y][x] = cell;
      
      // Update the layout with the new grid
      const updatedLayout = { ...layoutToUpdate, grid: updatedGrid };
      
      // Optimistic UI update
      setLayouts(prevLayouts => 
        prevLayouts.map(l => l.id === layoutId ? updatedLayout : l)
      );
      
      // Update current layout if it's the one being modified
      if (currentLayout?.id === layoutId) {
        setCurrentLayout(updatedLayout);
      }
      
      // Call the API to update the layout
      const result = await gardenLayoutService.updateLayout(layoutId, { grid: updatedGrid });
      
      if (result) {
        return true;
      }
      
      return false;
    } catch (err: any) {
      console.error('Error updating cell:', err);
      setError(err.message || 'Failed to update cell');
      
      // Revert optimistic update
      refreshLayouts();
      return false;
    }
  };

  return (
    <GardenLayoutContext.Provider
      value={{
        layouts,
        currentLayout,
        loading,
        error,
        addLayout,
        updateLayout,
        deleteLayout,
        setCurrentLayout,
        updateCell,
        refreshLayouts,
      }}
    >
      {children}
    </GardenLayoutContext.Provider>
  );
};
