'use client';

import React, { useState } from 'react';

interface Plant {
  id: string;
  name: string;
  color: string;
  spacing: number;
  plantingTime: string;
  harvestTime: string;
}

interface GridCell {
  plantId: string | null;
  plantedDate: string | null;
}

interface GardenLayout {
  id: string;
  name: string;
  rows: number;
  columns: number;
  grid: GridCell[][];
}

const plantTypes: Plant[] = [
  { 
    id: 'tomato',
    name: 'Tomato',
    color: 'bg-red-400',
    spacing: 2,
    plantingTime: 'Spring',
    harvestTime: '70-80 days'
  },
  { 
    id: 'lettuce',
    name: 'Lettuce',
    color: 'bg-green-300',
    spacing: 1,
    plantingTime: 'Spring/Fall',
    harvestTime: '45-60 days'
  },
  { 
    id: 'pepper',
    name: 'Pepper',
    color: 'bg-yellow-400',
    spacing: 1.5,
    plantingTime: 'Spring',
    harvestTime: '60-90 days'
  },
  { 
    id: 'carrot',
    name: 'Carrot',
    color: 'bg-orange-400',
    spacing: 0.5,
    plantingTime: 'Spring/Fall',
    harvestTime: '70-80 days'
  },
  { 
    id: 'cucumber',
    name: 'Cucumber',
    color: 'bg-green-500',
    spacing: 1.5,
    plantingTime: 'Spring',
    harvestTime: '50-70 days'
  }
];

const createEmptyGrid = (rows: number, columns: number): GridCell[][] => {
  return Array(rows).fill(null).map(() => 
    Array(columns).fill(null).map(() => ({ plantId: null, plantedDate: null }))
  );
};

const VegetablePatchPlanner = () => {
  const [selectedPlant, setSelectedPlant] = useState<string | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{x: number, y: number} | null>(null);
  const [layouts, setLayouts] = useState<GardenLayout[]>([
    {
      id: '1',
      name: 'Main Garden',
      rows: 8,
      columns: 12,
      grid: createEmptyGrid(8, 12)
    }
  ]);
  const [selectedLayout, setSelectedLayout] = useState<string>('1');
  const [showNewLayoutForm, setShowNewLayoutForm] = useState(false);
  const [newLayoutName, setNewLayoutName] = useState('');
  const [newLayoutRows, setNewLayoutRows] = useState('8');
  const [newLayoutColumns, setNewLayoutColumns] = useState('12');

  const currentLayout = layouts.find(l => l.id === selectedLayout)!;

  const handleCellClick = (x: number, y: number) => {
    if (!selectedPlant) return;

    const newLayouts = layouts.map(layout => {
      if (layout.id === selectedLayout) {
        const newGrid = [...layout.grid];
        const currentCell = newGrid[y][x];

        if (currentCell.plantId === selectedPlant) {
          newGrid[y][x] = { plantId: null, plantedDate: null };
        } else {
          newGrid[y][x] = {
            plantId: selectedPlant,
            plantedDate: new Date().toISOString().split('T')[0]
          };
        }

        return { ...layout, grid: newGrid };
      }
      return layout;
    });

    setLayouts(newLayouts);
  };

  const handleCreateNewLayout = (e: React.FormEvent) => {
    e.preventDefault();
    const rows = parseInt(newLayoutRows);
    const columns = parseInt(newLayoutColumns);
    
    if (rows > 0 && columns > 0 && newLayoutName.trim()) {
      const newLayout: GardenLayout = {
        id: Date.now().toString(),
        name: newLayoutName.trim(),
        rows,
        columns,
        grid: createEmptyGrid(rows, columns)
      };

      setLayouts([...layouts, newLayout]);
      setSelectedLayout(newLayout.id);
      setShowNewLayoutForm(false);
      setNewLayoutName('');
      setNewLayoutRows('8');
      setNewLayoutColumns('12');
    }
  };

  const getPlantById = (id: string): Plant | undefined => {
    return plantTypes.find(plant => plant.id === id);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Vegetable Patch Planner</h2>
        <button
          onClick={() => setShowNewLayoutForm(true)}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
        >
          Create New Layout
        </button>
      </div>

      {/* Layout Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Layout:</label>
        <div className="flex gap-2">
          {layouts.map((layout) => (
            <button
              key={layout.id}
              onClick={() => setSelectedLayout(layout.id)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedLayout === layout.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {layout.name} ({layout.rows}x{layout.columns})
            </button>
          ))}
        </div>
      </div>

      {/* New Layout Form */}
      {showNewLayoutForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Create New Layout</h3>
            <form onSubmit={handleCreateNewLayout}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Layout Name:</label>
                <input
                  type="text"
                  value={newLayoutName}
                  onChange={(e) => setNewLayoutName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rows:</label>
                  <input
                    type="number"
                    value={newLayoutRows}
                    onChange={(e) => setNewLayoutRows(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Columns:</label>
                  <input
                    type="number"
                    value={newLayoutColumns}
                    onChange={(e) => setNewLayoutColumns(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    min="1"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewLayoutForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Create Layout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Plant Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Select Plant:</h3>
        <div className="flex flex-wrap gap-2">
          {plantTypes.map((plant) => (
            <button
              key={plant.id}
              onClick={() => setSelectedPlant(plant.id)}
              className={`px-4 py-2 rounded-lg ${plant.color} text-white transition-transform ${
                selectedPlant === plant.id ? 'ring-2 ring-blue-500 scale-105' : ''
              }`}
            >
              {plant.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto mb-6">
        <div className="inline-block border border-gray-200 rounded-lg">
          {currentLayout.grid.map((row, y) => (
            <div key={y} className="flex">
              {row.map((cell, x) => {
                const plant = cell.plantId ? getPlantById(cell.plantId) : null;
                return (
                  <div
                    key={`${x}-${y}`}
                    onClick={() => handleCellClick(x, y)}
                    onMouseEnter={() => setHoveredCell({x, y})}
                    onMouseLeave={() => setHoveredCell(null)}
                    className={`
                      w-12 h-12 border border-gray-200 cursor-pointer
                      transition-all duration-200
                      ${plant ? plant.color : 'hover:bg-gray-100'}
                      ${hoveredCell?.x === x && hoveredCell?.y === y ? 'ring-2 ring-blue-300' : ''}
                    `}
                  >
                    {cell.plantId && (
                      <div className="w-full h-full flex items-center justify-center text-white text-xs">
                        {getPlantById(cell.plantId)?.name[0]}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend and Information */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3">Plant Information:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plantTypes.map((plant) => (
            <div key={plant.id} className="p-4 rounded-lg bg-gray-50">
              <div className={`w-4 h-4 rounded-full ${plant.color} mb-2`}></div>
              <h4 className="font-medium">{plant.name}</h4>
              <p className="text-sm text-gray-600">Spacing: {plant.spacing} ft</p>
              <p className="text-sm text-gray-600">Plant: {plant.plantingTime}</p>
              <p className="text-sm text-gray-600">Harvest: {plant.harvestTime}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VegetablePatchPlanner;
