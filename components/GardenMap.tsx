'use client';

import React, { useState } from 'react';

interface GardenArea {
  id: string;
  name: string;
  description: string;
  plants: string[];
  tasks: string[];
}

const gardenAreas: Record<string, GardenArea> = {
  vegetables: {
    id: 'vegetables',
    name: 'Vegetable Patches',
    description: 'Area dedicated to growing seasonal vegetables',
    plants: ['Tomatoes', 'Peppers', 'Lettuce', 'Carrots'],
    tasks: ['Water daily', 'Check for pests', 'Add compost monthly']
  },
  fruits: {
    id: 'fruits',
    name: 'Fruit Trees/Bushes',
    description: 'Orchard area with various fruit trees and berry bushes',
    plants: ['Apple Trees', 'Blueberry Bushes', 'Raspberry Canes'],
    tasks: ['Prune seasonally', 'Check fruit development', 'Mulch annually']
  },
  pond: {
    id: 'pond',
    name: 'Ponds',
    description: 'Water features and aquatic plants',
    plants: ['Water Lilies', 'Cattails', 'Lotus'],
    tasks: ['Monitor water level', 'Clean filters', 'Check plant health']
  },
  woodland: {
    id: 'woodland',
    name: 'Woodland',
    description: 'Shaded area with native woodland plants',
    plants: ['Ferns', 'Mushrooms', 'Shade Flowers'],
    tasks: ['Clear fallen leaves', 'Check soil moisture', 'Monitor shade levels']
  },
  flowers: {
    id: 'flowers',
    name: 'Flower Beds',
    description: 'Decorative flower gardens',
    plants: ['Roses', 'Tulips', 'Daffodils', 'Lavender'],
    tasks: ['Deadhead flowers', 'Weed regularly', 'Add fertilizer']
  }
};

const GardenMap = () => {
  const [selectedArea, setSelectedArea] = useState<string | null>(null);

  const handleAreaClick = (areaId: string) => {
    setSelectedArea(selectedArea === areaId ? null : areaId);
  };

  return (
    <div className="bg-green-50 rounded-lg shadow-lg p-4">
      <div className="grid grid-cols-3 grid-rows-3 gap-4 mb-4">
        {Object.entries(gardenAreas).map(([id, area]) => (
          <div
            key={id}
            onClick={() => handleAreaClick(id)}
            className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
              selectedArea === id
                ? 'ring-2 ring-blue-500 shadow-lg transform scale-105'
                : 'hover:shadow-md'
            } ${
              id === 'vegetables' ? 'bg-yellow-200' :
              id === 'fruits' ? 'bg-orange-200' :
              id === 'pond' ? 'bg-blue-200' :
              id === 'woodland' ? 'bg-green-200' :
              'bg-pink-200'
            }`}
          >
            <h3 className="font-semibold text-gray-800">{area.name}</h3>
          </div>
        ))}
      </div>

      {selectedArea && (
        <div className="mt-4 p-4 bg-white rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">{gardenAreas[selectedArea].name}</h3>
          <p className="text-gray-600 mb-3">{gardenAreas[selectedArea].description}</p>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Plants</h4>
              <ul className="list-disc list-inside">
                {gardenAreas[selectedArea].plants.map((plant, index) => (
                  <li key={index} className="text-gray-600">{plant}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Tasks</h4>
              <ul className="list-disc list-inside">
                {gardenAreas[selectedArea].tasks.map((task, index) => (
                  <li key={index} className="text-gray-600">{task}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GardenMap;
