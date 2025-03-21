'use client';

import React, { useState } from 'react';
import { usePlants } from '../context/PlantContext';
import { useGardenLayouts } from '../context/GardenLayoutContext';
import { Plant, GridCell } from '../lib/types';

const VegetablePatchPlanner = () => {
  const { plants, loading: plantsLoading } = usePlants();
  const { 
    layouts, 
    currentLayout, 
    loading: layoutsLoading, 
    addLayout, 
    updateCell, 
    setCurrentLayout 
  } = useGardenLayouts();
  
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [newLayoutName, setNewLayoutName] = useState('');
  const [showNewLayoutForm, setShowNewLayoutForm] = useState(false);
  const [gridSize, setGridSize] = useState({ rows: 10, columns: 10 });

  // Filter for vegetable plants only
  const vegetablePlants = plants.filter(plant => plant.type === 'vegetable');

  const handlePlantSelect = (plant: Plant | null) => {
    setSelectedPlant(plant);
  };

  const handleCellClick = async (x: number, y: number) => {
    if (!currentLayout) return;
    
    const cell: GridCell = selectedPlant 
      ? { plantId: selectedPlant.id, plantedDate: new Date().toISOString().split('T')[0] }
      : { plantId: null, plantedDate: null };
    
    await updateCell(currentLayout.id, x, y, cell);
  };

  const handleLayoutSelect = (layoutId: string) => {
    const layout = layouts.find(l => l.id === layoutId);
    if (layout) {
      setCurrentLayout(layout);
    }
  };

  const handleCreateLayout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newLayoutName.trim()) return;
    
    // Create empty grid based on selected size
    const grid = Array(gridSize.rows).fill(null).map(() => 
      Array(gridSize.columns).fill(null).map(() => ({ plantId: null, plantedDate: null }))
    );
    
    await addLayout({
      name: newLayoutName,
      rows: gridSize.rows,
      columns: gridSize.columns,
      grid
    });
    
    // Reset form
    setNewLayoutName('');
    setShowNewLayoutForm(false);
  };

  const getPlantForCell = (cell: GridCell) => {
    if (!cell || !cell.plantId) return null;
    return plants.find(p => p.id === cell.plantId);
  };

  if (plantsLoading || layoutsLoading) {
    return <div className="p-4 text-center">Loading garden planner...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Vegetable Patch Planner</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left sidebar - Plant selection */}
        <div className="lg:col-span-1 bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Select a Plant</h2>
          
          {vegetablePlants.length === 0 ? (
            <p className="text-gray-500">No vegetable plants available. Add some from the Plants page.</p>
          ) : (
            <div className="space-y-2">
              <button
                className={`block w-full text-left p-2 rounded ${!selectedPlant ? 'bg-green-100 border border-green-500' : 'hover:bg-gray-100'}`}
                onClick={() => handlePlantSelect(null)}
              >
                Eraser (Remove Plant)
              </button>
              
              {vegetablePlants.map(plant => (
                <button
                  key={plant.id}
                  className={`block w-full text-left p-2 rounded ${selectedPlant?.id === plant.id ? 'bg-green-100 border border-green-500' : 'hover:bg-gray-100'}`}
                  onClick={() => handlePlantSelect(plant)}
                >
                  <span className={`inline-block w-4 h-4 rounded-full ${plant.color} mr-2`}></span>
                  {plant.name} ({plant.variety})
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Right content - Garden grid and layout controls */}
        <div className="lg:col-span-3">
          {/* Layout controls */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="flex flex-wrap items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Garden Layouts</h2>
              
              <button
                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                onClick={() => setShowNewLayoutForm(!showNewLayoutForm)}
              >
                {showNewLayoutForm ? 'Cancel' : 'Create New Layout'}
              </button>
            </div>
            
            {showNewLayoutForm && (
              <form onSubmit={handleCreateLayout} className="mb-4 p-3 bg-gray-50 rounded">
                <div className="mb-3">
                  <label htmlFor="layoutName" className="block text-sm font-medium mb-1">Layout Name</label>
                  <input
                    type="text"
                    id="layoutName"
                    value={newLayoutName}
                    onChange={(e) => setNewLayoutName(e.target.value)}
                    className="w-full px-3 py-2 border rounded"
                    placeholder="My Garden Layout"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label htmlFor="rows" className="block text-sm font-medium mb-1">Rows</label>
                    <input
                      type="number"
                      id="rows"
                      value={gridSize.rows}
                      onChange={(e) => setGridSize(prev => ({ ...prev, rows: parseInt(e.target.value) || 5 }))}
                      className="w-full px-3 py-2 border rounded"
                      min="1"
                      max="20"
                    />
                  </div>
                  <div>
                    <label htmlFor="columns" className="block text-sm font-medium mb-1">Columns</label>
                    <input
                      type="number"
                      id="columns"
                      value={gridSize.columns}
                      onChange={(e) => setGridSize(prev => ({ ...prev, columns: parseInt(e.target.value) || 5 }))}
                      className="w-full px-3 py-2 border rounded"
                      min="1"
                      max="20"
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Create Layout
                </button>
              </form>
            )}
            
            {layouts.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {layouts.map(layout => (
                  <button
                    key={layout.id}
                    className={`px-3 py-1 rounded ${currentLayout?.id === layout.id ? 'bg-green-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                    onClick={() => handleLayoutSelect(layout.id)}
                  >
                    {layout.name} ({layout.rows}x{layout.columns})
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No layouts available. Create one to get started.</p>
            )}
          </div>
          
          {/* Garden grid */}
          {currentLayout ? (
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">{currentLayout.name}</h3>
              
              <div className="overflow-x-auto">
                <div 
                  className="grid gap-1" 
                  style={{ 
                    gridTemplateColumns: `repeat(${currentLayout.columns}, minmax(60px, 1fr))`,
                    width: 'fit-content'
                  }}
                >
                  {currentLayout.grid.map((row, y) => 
                    row.map((cell, x) => {
                      const plant = getPlantForCell(cell);
                      return (
                        <div
                          key={`${y}-${x}`}
                          className={`w-16 h-16 border flex items-center justify-center cursor-pointer hover:bg-gray-100 ${plant ? plant.color : 'bg-gray-50'}`}
                          onClick={() => handleCellClick(x, y)}
                          title={plant ? `${plant.name} (${plant.variety})` : 'Empty cell'}
                        >
                          {plant && (
                            <span className="text-xs text-center overflow-hidden">
                              {plant.name.substring(0, 3)}
                            </span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
              
              {/* Plant legend */}
              {vegetablePlants.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-semibold mb-2">Legend</h4>
                  <div className="flex flex-wrap gap-2">
                    {vegetablePlants.map(plant => (
                      <div key={plant.id} className="flex items-center text-xs">
                        <span className={`inline-block w-3 h-3 rounded-full ${plant.color} mr-1`}></span>
                        {plant.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white p-4 rounded-lg shadow text-center">
              <p className="text-gray-500">
                {layouts.length > 0 
                  ? 'Select a layout to view and edit' 
                  : 'Create a layout to get started with your garden planning'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VegetablePatchPlanner;
