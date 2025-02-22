'use client';

import React from 'react';

const ActivityLog = () => {
  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Activity Log</h2>
      <form>
        <div className="mb-4">
          <label htmlFor="activityType" className="block text-gray-700 text-sm font-bold mb-2">Activity Type:</label>
          <select id="activityType" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
            <option>Planting</option>
            <option>Watering</option>
            <option>Harvesting</option>
            <option>Fertilizing</option>
            <option>Other</option>
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="date" className="block text-gray-700 text-sm font-bold mb-2">Date:</label>
          <input type="date" id="date" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
        </div>
        <div className="mb-4">
          <label htmlFor="notes" className="block text-gray-700 text-sm font-bold mb-2">Notes:</label>
          <textarea id="notes" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"></textarea>
        </div>
        <div className="mb-4">
          <label htmlFor="photo" className="block text-gray-700 text-sm font-bold mb-2">Photo:</label>
          <input type="file" id="photo" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
        </div>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
          Add Activity
        </button>
      </form>
    </div>
  );
};

export default ActivityLog;
