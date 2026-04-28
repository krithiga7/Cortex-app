import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gdqsnkmhoyutyaynkyav.supabase.co';
const supabaseAnonKey = 'sb_publishable_YjpPvL5McrPk0Dvn4S2KLQ_SJsjkdgg';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seedDatabase() {
  console.log('🌱 Seeding database with mock data...');

  // Seed Volunteers
  const volunteers = [
    {
      volunteer_id: 'V101',
      name: 'Arjun Krishnan',
      email: 'arjun@example.com',
      phone: '+91 98765 43210',
      skills: ['Medical', 'First Aid', 'Emergency Care'],
      location: 'Adyar',
      availability: 'Available',
      rating: 92,
      completed_tasks: 148,
      current_load: 2,
      max_capacity: 5,
      x: 70,
      y: 55,
      metadata: JSON.stringify({})
    },
    {
      volunteer_id: 'V102',
      name: 'Meena Sundaram',
      email: 'meena@example.com',
      phone: '+91 98765 43211',
      skills: ['Food Distribution', 'Logistics'],
      location: 'T Nagar',
      availability: 'Available',
      rating: 85,
      completed_tasks: 96,
      current_load: 3,
      max_capacity: 6,
      x: 38,
      y: 42,
      metadata: JSON.stringify({})
    },
    {
      volunteer_id: 'V103',
      name: 'Rahul Verma',
      email: 'rahul@example.com',
      phone: '+91 98765 43212',
      skills: ['Medical', 'First Aid'],
      location: 'Saidapet',
      availability: 'Available',
      rating: 88,
      completed_tasks: 120,
      current_load: 2,
      max_capacity: 5,
      x: 48,
      y: 52,
      metadata: JSON.stringify({})
    },
    {
      volunteer_id: 'V104',
      name: 'Priya Raman',
      email: 'priya@example.com',
      phone: '+91 98765 43213',
      skills: ['Shelter Coord.', 'Community Management'],
      location: 'Tambaram',
      availability: 'Available',
      rating: 79,
      completed_tasks: 64,
      current_load: 1,
      max_capacity: 4,
      x: 45,
      y: 80,
      metadata: JSON.stringify({})
    },
    {
      volunteer_id: 'V105',
      name: 'Karthik Iyer',
      email: 'karthik@example.com',
      phone: '+91 98765 43214',
      skills: ['Logistics', 'Transport'],
      location: 'Adyar',
      availability: 'Available',
      rating: 81,
      completed_tasks: 88,
      current_load: 2,
      max_capacity: 5,
      x: 68,
      y: 58,
      metadata: JSON.stringify({})
    }
  ];

  console.log('📝 Inserting volunteers...');
  const { data: insertedVolunteers, error: volunteerError } = await supabase
    .from('volunteers')
    .upsert(volunteers, { onConflict: 'volunteer_id' })
    .select();

  if (volunteerError) {
    console.error('❌ Error inserting volunteers:', volunteerError);
  } else {
    console.log(`✅ Inserted ${insertedVolunteers?.length} volunteers`);
  }

  // Seed Requests
  const requests = [
    {
      request_id: 'R101',
      type: 'Medical',
      people: 15,
      location: 'T Nagar',
      priority: 'High',
      score: 95,
      status: 'Pending',
      description: 'Multiple injured after building collapse. Urgent first-aid and ambulance support needed.',
      source: 'Form',
      urgency: 10,
      severity: 9,
      suggested_volunteer: 'V101',
      x: 38,
      y: 42
    },
    {
      request_id: 'R102',
      type: 'Food',
      people: 50,
      location: 'Velachery',
      priority: 'High',
      score: 88,
      status: 'Pending',
      description: 'Flood-affected families in relief camp need urgent food and water supplies.',
      source: 'WhatsApp',
      urgency: 9,
      severity: 7,
      suggested_volunteer: 'V102',
      x: 62,
      y: 70
    },
    {
      request_id: 'R103',
      type: 'Shelter',
      people: 30,
      location: 'Tambaram',
      priority: 'Medium',
      score: 75,
      status: 'Pending',
      description: 'Homeless families need temporary shelter and blankets due to heavy rains.',
      source: 'Voice',
      urgency: 7,
      severity: 8,
      suggested_volunteer: 'V104',
      x: 45,
      y: 80
    },
    {
      request_id: 'R104',
      type: 'Medical',
      people: 8,
      location: 'Adyar',
      priority: 'High',
      score: 92,
      status: 'Pending',
      description: 'Elderly residents in care home need medical checkup and medication.',
      source: 'Form',
      urgency: 9,
      severity: 8,
      suggested_volunteer: 'V103',
      x: 70,
      y: 55
    },
    {
      request_id: 'R105',
      type: 'Water',
      people: 100,
      location: 'Anna Nagar',
      priority: 'High',
      score: 90,
      status: 'Pending',
      description: 'Water pipeline burst affecting entire neighborhood. Need urgent water tankers.',
      source: 'WhatsApp',
      urgency: 10,
      severity: 6,
      suggested_volunteer: 'V105',
      x: 25,
      y: 20
    }
  ];

  console.log('📝 Inserting requests...');
  const { data: insertedRequests, error: requestError } = await supabase
    .from('requests')
    .upsert(requests, { onConflict: 'request_id' })
    .select();

  if (requestError) {
    console.error('❌ Error inserting requests:', requestError);
  } else {
    console.log(`✅ Inserted ${insertedRequests?.length} requests`);
  }

  // Seed Assignments
  const assignments = [
    {
      assignment_id: 'A201',
      request_id: 'R102',
      volunteer_id: 'V102',
      eta: 14,
      status: 'Dispatched',
      started_at: new Date(Date.now() - 8 * 60000).toISOString(),
      proof_submitted: false,
      verification_status: 'Pending',
      match_score: 88,
      rating: 0
    },
    {
      assignment_id: 'A202',
      request_id: 'R104',
      volunteer_id: 'V103',
      eta: 6,
      status: 'In Progress',
      started_at: new Date(Date.now() - 12 * 60000).toISOString(),
      proof_submitted: false,
      verification_status: 'Pending',
      match_score: 92,
      rating: 0
    },
    {
      assignment_id: 'A203',
      request_id: 'R101',
      volunteer_id: 'V101',
      eta: 10,
      status: 'Pending',
      started_at: new Date().toISOString(),
      proof_submitted: false,
      verification_status: 'Pending',
      match_score: 95,
      rating: 0
    }
  ];

  console.log('📝 Inserting assignments...');
  const { data: insertedAssignments, error: assignmentError } = await supabase
    .from('assignments')
    .upsert(assignments, { onConflict: 'assignment_id' })
    .select();

  if (assignmentError) {
    console.error('❌ Error inserting assignments:', assignmentError);
  } else {
    console.log(`✅ Inserted ${insertedAssignments?.length} assignments`);
  }

  console.log('🎉 Database seeding complete!');
  process.exit(0);
}

seedDatabase().catch(error => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
