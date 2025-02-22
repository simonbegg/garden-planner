import React from 'react';
import PlantProfile from '../../components/PlantProfile';

const samplePlants = [
  {
    name: 'Tomato',
    variety: 'Roma',
    plantingDate: '2025-02-15',
    careInstructions: [
      'Water deeply 2-3 times per week',
      'Provide full sun exposure',
      'Add support stakes as plant grows',
      'Prune suckers weekly'
    ],
    growthStage: 45
  },
  {
    name: 'Basil',
    variety: 'Sweet Basil',
    plantingDate: '2025-02-10',
    careInstructions: [
      'Keep soil consistently moist',
      'Harvest leaves regularly',
      'Pinch off flower buds',
      'Protect from cold'
    ],
    growthStage: 60
  }
];

export default function PlantsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Plant Profiles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {samplePlants.map((plant, index) => (
            <PlantProfile key={index} {...plant} />
          ))}
        </div>
      </div>
    </div>
  );
}
