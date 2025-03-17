'use client';

import React, { useState } from 'react';
import PlantProfile from '../../components/PlantProfile';
import PlantForm from '../../components/PlantForm';
import { usePlants } from '../../context/PlantContext';
import { Plant } from '../../lib/types';

export default function PlantsPage() {
  const { plants, addPlant, updatePlant, deletePlant } = usePlants();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPlant, setEditingPlant] = useState<Plant | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  const handleAddPlant = (plantData: Omit<Plant, 'id'>) => {
    addPlant(plantData);
    setShowAddForm(false);
  };

  const handleUpdatePlant = (plantData: Omit<Plant, 'id'>) => {
    if (editingPlant) {
      updatePlant(editingPlant.id, plantData);
      setEditingPlant(null);
    }
  };

  const handleDeletePlant = (id: string) => {
    if (window.confirm('Are you sure you want to delete this plant?')) {
      deletePlant(id);
    }
  };

  const filteredPlants = filterType === 'all' 
    ? plants 
    : plants.filter(plant => plant.type === filterType);

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Plant Profiles</h2>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
          >
            Add New Plant
          </button>
        </div>

        {/* Filter Controls */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Type:</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                filterType === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('vegetable')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                filterType === 'vegetable'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              Vegetables
            </button>
            <button
              onClick={() => setFilterType('fruit')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                filterType === 'fruit'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              Fruits
            </button>
            <button
              onClick={() => setFilterType('herb')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                filterType === 'herb'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              Herbs
            </button>
            <button
              onClick={() => setFilterType('flower')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                filterType === 'flower'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              Flowers
            </button>
            <button
              onClick={() => setFilterType('tree')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                filterType === 'tree'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              Trees
            </button>
          </div>
        </div>

        {/* Plant Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPlants.map((plant) => (
            <PlantProfile 
              key={plant.id} 
              {...plant} 
              onEdit={() => setEditingPlant(plant)}
              onDelete={() => handleDeletePlant(plant.id)}
            />
          ))}
        </div>

        {filteredPlants.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-500">No plants found. Add some plants to get started!</p>
          </div>
        )}

        {/* Add Plant Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-3xl">
              <PlantForm 
                onSubmit={handleAddPlant} 
                onCancel={() => setShowAddForm(false)} 
              />
            </div>
          </div>
        )}

        {/* Edit Plant Modal */}
        {editingPlant && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-3xl">
              <PlantForm 
                initialData={editingPlant}
                isEdit={true}
                onSubmit={handleUpdatePlant} 
                onCancel={() => setEditingPlant(null)} 
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
