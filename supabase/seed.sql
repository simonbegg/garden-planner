-- Seed data for garden management application

-- Insert sample plants
INSERT INTO plants (id, name, variety, type, color, spacing, planting_time, harvest_time, care_instructions, growth_stage)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Tomato', 'Roma', 'vegetable', 'bg-red-500', 2.5, 'Spring', '75-85 days', ARRAY['Water regularly', 'Provide support for vines', 'Prune suckers for better yield'], 0),
  ('00000000-0000-0000-0000-000000000002', 'Carrot', 'Nantes', 'vegetable', 'bg-orange-500', 0.5, 'Spring/Fall', '60-80 days', ARRAY['Thin seedlings to 2 inches apart', 'Keep soil moist', 'Loosen soil for better growth'], 0),
  ('00000000-0000-0000-0000-000000000003', 'Basil', 'Sweet', 'herb', 'bg-green-500', 1.0, 'After last frost', '30-60 days', ARRAY['Pinch off flower buds', 'Harvest regularly', 'Water at base'], 0),
  ('00000000-0000-0000-0000-000000000004', 'Sunflower', 'Mammoth', 'flower', 'bg-yellow-500', 2.0, 'Spring', '80-120 days', ARRAY['Support tall varieties', 'Water deeply', 'Protect from birds'], 0),
  ('00000000-0000-0000-0000-000000000005', 'Apple', 'Honeycrisp', 'tree', 'bg-red-700', 15.0, 'Spring', '3-5 years', ARRAY['Prune annually', 'Thin fruit', 'Protect from pests'], 0),
  ('00000000-0000-0000-0000-000000000006', 'Lettuce', 'Butterhead', 'vegetable', 'bg-green-300', 1.0, 'Spring/Fall', '45-60 days', ARRAY['Keep soil moist', 'Harvest outer leaves first', 'Provide partial shade in hot weather'], 0),
  ('00000000-0000-0000-0000-000000000007', 'Cucumber', 'English', 'vegetable', 'bg-green-600', 3.0, 'After last frost', '55-65 days', ARRAY['Provide trellis support', 'Water consistently', 'Harvest regularly'], 0),
  ('00000000-0000-0000-0000-000000000008', 'Strawberry', 'Eversweet', 'fruit', 'bg-red-400', 1.5, 'Spring', '1 year', ARRAY['Mulch to prevent fruit rot', 'Remove runners', 'Protect from birds'], 0);

-- Insert sample garden layout
INSERT INTO garden_layouts (id, name, rows, columns, grid)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Main Vegetable Patch', 5, 8, 
   '[
     [{"plantId":null,"plantedDate":null},{"plantId":null,"plantedDate":null},{"plantId":null,"plantedDate":null},{"plantId":null,"plantedDate":null},{"plantId":null,"plantedDate":null},{"plantId":null,"plantedDate":null},{"plantId":null,"plantedDate":null},{"plantId":null,"plantedDate":null}],
     [{"plantId":null,"plantedDate":null},{"plantId":"00000000-0000-0000-0000-000000000001","plantedDate":"2025-03-01"},{"plantId":"00000000-0000-0000-0000-000000000001","plantedDate":"2025-03-01"},{"plantId":null,"plantedDate":null},{"plantId":"00000000-0000-0000-0000-000000000006","plantedDate":"2025-03-05"},{"plantId":"00000000-0000-0000-0000-000000000006","plantedDate":"2025-03-05"},{"plantId":null,"plantedDate":null},{"plantId":null,"plantedDate":null}],
     [{"plantId":null,"plantedDate":null},{"plantId":"00000000-0000-0000-0000-000000000001","plantedDate":"2025-03-01"},{"plantId":"00000000-0000-0000-0000-000000000001","plantedDate":"2025-03-01"},{"plantId":null,"plantedDate":null},{"plantId":"00000000-0000-0000-0000-000000000006","plantedDate":"2025-03-05"},{"plantId":"00000000-0000-0000-0000-000000000006","plantedDate":"2025-03-05"},{"plantId":null,"plantedDate":null},{"plantId":null,"plantedDate":null}],
     [{"plantId":null,"plantedDate":null},{"plantId":null,"plantedDate":null},{"plantId":null,"plantedDate":null},{"plantId":null,"plantedDate":null},{"plantId":null,"plantedDate":null},{"plantId":null,"plantedDate":null},{"plantId":null,"plantedDate":null},{"plantId":null,"plantedDate":null}],
     [{"plantId":"00000000-0000-0000-0000-000000000002","plantedDate":"2025-03-10"},{"plantId":"00000000-0000-0000-0000-000000000002","plantedDate":"2025-03-10"},{"plantId":"00000000-0000-0000-0000-000000000002","plantedDate":"2025-03-10"},{"plantId":"00000000-0000-0000-0000-000000000002","plantedDate":"2025-03-10"},{"plantId":"00000000-0000-0000-0000-000000000007","plantedDate":"2025-03-15"},{"plantId":"00000000-0000-0000-0000-000000000007","plantedDate":"2025-03-15"},{"plantId":null,"plantedDate":null},{"plantId":null,"plantedDate":null}]
   ]'::jsonb
  ),
  ('00000000-0000-0000-0000-000000000002', 'Herb Garden', 3, 4, 
   '[
     [{"plantId":"00000000-0000-0000-0000-000000000003","plantedDate":"2025-03-05"},{"plantId":null,"plantedDate":null},{"plantId":null,"plantedDate":null},{"plantId":null,"plantedDate":null}],
     [{"plantId":"00000000-0000-0000-0000-000000000003","plantedDate":"2025-03-05"},{"plantId":null,"plantedDate":null},{"plantId":null,"plantedDate":null},{"plantId":null,"plantedDate":null}],
     [{"plantId":null,"plantedDate":null},{"plantId":null,"plantedDate":null},{"plantId":null,"plantedDate":null},{"plantId":null,"plantedDate":null}]
   ]'::jsonb
  );

-- Insert sample activities
INSERT INTO activities (id, activity_type, activity_date, notes, plant_id, garden_layout_id, weather_conditions)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Planting', '2025-03-01', 'Planted Roma tomatoes in main vegetable patch', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Sunny, 65°F'),
  ('00000000-0000-0000-0000-000000000002', 'Watering', '2025-03-03', 'Watered all plants', NULL, NULL, 'Partly cloudy, 70°F'),
  ('00000000-0000-0000-0000-000000000003', 'Planting', '2025-03-05', 'Planted basil in herb garden', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'Sunny, 68°F'),
  ('00000000-0000-0000-0000-000000000004', 'Fertilizing', '2025-03-08', 'Applied organic fertilizer to tomatoes', '00000000-0000-0000-0000-000000000001', NULL, 'Overcast, 62°F'),
  ('00000000-0000-0000-0000-000000000005', 'Planting', '2025-03-10', 'Planted carrots in main vegetable patch', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Sunny, 72°F');
