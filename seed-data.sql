-- ============================================
-- SEED MOCK DATA - Run this in Supabase SQL Editor
-- ============================================

-- Insert 5 Volunteers
INSERT INTO volunteers (volunteer_id, name, email, phone, skills, location, availability, rating, completed_tasks, current_load, max_capacity, x, y, metadata)
VALUES 
  ('V101', 'Arjun Krishnan', 'arjun@example.com', '+91 98765 43210', ARRAY['Medical', 'First Aid', 'Emergency Care'], 'Adyar', 'Available', 92, 148, 2, 5, 70, 55, '{}'),
  ('V102', 'Meena Sundaram', 'meena@example.com', '+91 98765 43211', ARRAY['Food Distribution', 'Logistics'], 'T Nagar', 'Available', 85, 96, 3, 6, 38, 42, '{}'),
  ('V103', 'Rahul Verma', 'rahul@example.com', '+91 98765 43212', ARRAY['Medical', 'First Aid'], 'Saidapet', 'Available', 88, 120, 2, 5, 48, 52, '{}'),
  ('V104', 'Priya Raman', 'priya@example.com', '+91 98765 43213', ARRAY['Shelter Coord.', 'Community Management'], 'Tambaram', 'Available', 79, 64, 1, 4, 45, 80, '{}'),
  ('V105', 'Karthik Iyer', 'karthik@example.com', '+91 98765 43214', ARRAY['Logistics', 'Transport'], 'Adyar', 'Available', 81, 88, 2, 5, 68, 58, '{}')
ON CONFLICT (volunteer_id) DO NOTHING;

-- Insert 5 Requests
INSERT INTO requests (request_id, category, people_affected, location, urgency, priority_score, status, description, source, summary, x, y)
VALUES 
  ('R101', 'Medical', 15, 'T Nagar', 'High', 95, 'Pending', 'Multiple injured after building collapse. Urgent first-aid and ambulance support needed.', 'Form', 'Multiple injured after building collapse. Urgent first-aid and ambulance support needed.', 38, 42),
  ('R102', 'Food', 50, 'Velachery', 'High', 88, 'Pending', 'Flood-affected families in relief camp need urgent food and water supplies.', 'WhatsApp', 'Flood-affected families in relief camp need urgent food and water supplies.', 62, 70),
  ('R103', 'Shelter', 30, 'Tambaram', 'Medium', 75, 'Pending', 'Homeless families need temporary shelter and blankets due to heavy rains.', 'Voice', 'Homeless families need temporary shelter and blankets due to heavy rains.', 45, 80),
  ('R104', 'Medical', 8, 'Adyar', 'High', 92, 'Pending', 'Elderly residents in care home need medical checkup and medication.', 'Form', 'Elderly residents in care home need medical checkup and medication.', 70, 55),
  ('R105', 'Water', 100, 'Anna Nagar', 'High', 90, 'Pending', 'Water pipeline burst affecting entire neighborhood. Need urgent water tankers.', 'WhatsApp', 'Water pipeline burst affecting entire neighborhood. Need urgent water tankers.', 25, 20)
ON CONFLICT (request_id) DO NOTHING;

-- Insert 3 Assignments
INSERT INTO assignments (assignment_id, request_id, volunteer_id, eta, status, started_at, proof_submitted, verification_status, match_score, rating)
VALUES 
  ('A201', 'R102', 'V102', 14, 'Dispatched', NOW() - INTERVAL '8 minutes', false, 'Pending', 88, 0),
  ('A202', 'R104', 'V103', 6, 'In Progress', NOW() - INTERVAL '12 minutes', false, 'Pending', 92, 0),
  ('A203', 'R101', 'V101', 10, 'Pending', NOW(), false, 'Pending', 95, 0)
ON CONFLICT (assignment_id) DO NOTHING;

-- Verify data
SELECT 'Volunteers: ' || COUNT(*) FROM volunteers;
SELECT 'Requests: ' || COUNT(*) FROM requests;
SELECT 'Assignments: ' || COUNT(*) FROM assignments;
