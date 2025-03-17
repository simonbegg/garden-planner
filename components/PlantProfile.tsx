import React from 'react';
import { Plant } from '../lib/types';

interface PlantProfileProps extends Plant {
  onEdit?: () => void;
  onDelete?: () => void;
}

const PlantProfile: React.FC<PlantProfileProps> = ({
  id,
  name,
  variety,
  type,
  plantingDate,
  careInstructions,
  growthStage = 0,
  color,
  spacing,
  plantingTime,
  harvestTime,
  onEdit,
  onDelete
}) => {
  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className={`w-4 h-4 rounded-full ${color} mr-2`}></div>
          <h3 className="text-xl font-semibold text-gray-900">{name}</h3>
        </div>
        <div className="flex items-center">
          <span className="text-sm text-gray-500 mr-2">Variety: {variety}</span>
          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 capitalize">{type}</span>
        </div>
      </div>
      
      <div className="mb-4">
        {plantingDate && <p className="text-sm text-gray-600">Planted: {plantingDate}</p>}
        <p className="text-sm text-gray-600">Planting Time: {plantingTime}</p>
        <p className="text-sm text-gray-600">Harvest Time: {harvestTime}</p>
        <p className="text-sm text-gray-600">Spacing Needed: {spacing} ft</p>
        
        {growthStage > 0 && (
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
        )}
      </div>

      <div className="mt-4">
        <h4 className="text-lg font-medium text-gray-900 mb-2">Care Instructions</h4>
        <ul className="list-disc list-inside space-y-2">
          {careInstructions.map((instruction, index) => (
            <li key={index} className="text-gray-600">{instruction}</li>
          ))}
        </ul>
      </div>
      
      {(onEdit || onDelete) && (
        <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end space-x-2">
          {onEdit && (
            <button 
              onClick={onEdit}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button 
              onClick={onDelete}
              className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PlantProfile;
