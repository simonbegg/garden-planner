'use client';

import React, { useState, useEffect } from 'react';
import { Plant } from '../lib/types';
import { plantColors } from '../context/PlantContext';

interface PlantFormProps {
  onSubmit: (plant: Omit<Plant, 'id'>) => void;
  onCancel: () => void;
  initialData?: Plant;
  isEdit?: boolean;
}

const PlantForm: React.FC<PlantFormProps> = ({ 
  onSubmit, 
  onCancel, 
  initialData,
  isEdit = false
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [variety, setVariety] = useState(initialData?.variety || '');
  const [type, setType] = useState<Plant['type']>(initialData?.type || 'vegetable');
  const [color, setColor] = useState(initialData?.color || plantColors[0]);
  const [spacing, setSpacing] = useState(initialData?.spacing?.toString() || '1');
  const [plantingTime, setPlantingTime] = useState(initialData?.plantingTime || '');
  const [harvestTime, setHarvestTime] = useState(initialData?.harvestTime || '');
  const [plantingDate, setPlantingDate] = useState(initialData?.plantingDate || '');
  const [careInstructions, setCareInstructions] = useState<string[]>(
    initialData?.careInstructions || ['', '', '', '']
  );
  const [growthStage, setGrowthStage] = useState(
    initialData?.growthStage?.toString() || '0'
  );

  const handleCareInstructionChange = (index: number, value: string) => {
    const newInstructions = [...careInstructions];
    newInstructions[index] = value;
    setCareInstructions(newInstructions);
  };

  const addCareInstruction = () => {
    setCareInstructions([...careInstructions, '']);
  };

  const removeCareInstruction = (index: number) => {
    if (careInstructions.length <= 1) return;
    const newInstructions = careInstructions.filter((_, i) => i !== index);
    setCareInstructions(newInstructions);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter out empty care instructions
    const filteredInstructions = careInstructions.filter(instruction => instruction.trim() !== '');
    
    onSubmit({
      name,
      variety,
      type,
      color,
      spacing: parseFloat(spacing),
      plantingTime,
      harvestTime,
      plantingDate: plantingDate || undefined,
      careInstructions: filteredInstructions,
      growthStage: growthStage ? parseInt(growthStage) : undefined
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4">{isEdit ? 'Edit Plant' : 'Add New Plant'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Plant Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Variety:</label>
            <input
              type="text"
              value={variety}
              onChange={(e) => setVariety(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type:</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as Plant['type'])}
              className="w-full px-3 py-2 border rounded-lg"
              required
            >
              <option value="vegetable">Vegetable</option>
              <option value="fruit">Fruit</option>
              <option value="herb">Herb</option>
              <option value="flower">Flower</option>
              <option value="tree">Tree</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Spacing (ft):</label>
            <input
              type="number"
              value={spacing}
              onChange={(e) => setSpacing(e.target.value)}
              step="0.1"
              min="0.1"
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Planting Time:</label>
            <input
              type="text"
              value={plantingTime}
              onChange={(e) => setPlantingTime(e.target.value)}
              placeholder="e.g., Spring, Fall"
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Harvest Time:</label>
            <input
              type="text"
              value={harvestTime}
              onChange={(e) => setHarvestTime(e.target.value)}
              placeholder="e.g., 60-90 days"
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Planting Date:</label>
            <input
              type="date"
              value={plantingDate}
              onChange={(e) => setPlantingDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Growth Stage (%):</label>
            <input
              type="number"
              value={growthStage}
              onChange={(e) => setGrowthStage(e.target.value)}
              min="0"
              max="100"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Color:</label>
          <div className="flex flex-wrap gap-2">
            {plantColors.map((colorOption) => (
              <button
                key={colorOption}
                type="button"
                onClick={() => setColor(colorOption)}
                className={`w-8 h-8 rounded-full ${colorOption} ${
                  color === colorOption ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                }`}
              />
            ))}
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">Care Instructions:</label>
            <button
              type="button"
              onClick={addCareInstruction}
              className="text-sm text-blue-500 hover:text-blue-700"
            >
              + Add Instruction
            </button>
          </div>
          {careInstructions.map((instruction, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="text"
                value={instruction}
                onChange={(e) => handleCareInstructionChange(index, e.target.value)}
                placeholder={`Care instruction ${index + 1}`}
                className="w-full px-3 py-2 border rounded-lg mr-2"
              />
              <button
                type="button"
                onClick={() => removeCareInstruction(index)}
                className="text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            {isEdit ? 'Update Plant' : 'Add Plant'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PlantForm;
