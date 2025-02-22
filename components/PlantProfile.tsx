import React from 'react';

interface PlantProfileProps {
  name: string;
  variety: string;
  plantingDate: string;
  careInstructions: string[];
  growthStage: number; // 0-100
}

const PlantProfile: React.FC<PlantProfileProps> = ({
  name,
  variety,
  plantingDate,
  careInstructions,
  growthStage
}) => {
  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-900">{name}</h3>
        <span className="text-sm text-gray-500">Variety: {variety}</span>
      </div>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600">Planted: {plantingDate}</p>
        <div className="mt-2">
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200">
                  Growth Progress
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-green-600">
                  {growthStage}%
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-green-200">
              <div
                style={{ width: `${growthStage}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <h4 className="text-lg font-medium text-gray-900 mb-2">Care Instructions</h4>
        <ul className="list-disc list-inside space-y-2">
          {careInstructions.map((instruction, index) => (
            <li key={index} className="text-gray-600">{instruction}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PlantProfile;
