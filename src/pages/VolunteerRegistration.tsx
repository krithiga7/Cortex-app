import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/store/auth';
import { createVolunteer } from '@/services/volunteerService';
import { VolunteerDocument } from '@/types/firestore';
import { 
  User, Mail, Phone, MapPin, Briefcase, Heart, 
  Car, Clock, Shield, Loader2, CheckCircle, AlertCircle 
} from 'lucide-react';
import { toast } from 'sonner';

// Chennai areas
const CHENNAI_AREAS = [
  'T Nagar', 'Adyar', 'Anna Nagar', 'Velachery', 'Mylapore', 
  'Guindy', 'Royapuram', 'Tambaram', 'Saidapet', 'Porur', 
  'Kodambakkam', 'Nungambakkam', 'Besant Nagar', 'Alwarpet',
  'Tondiarpet', 'Manali', 'Ennore', 'Chromepet', 'Kundrathur', 'Vadapalani'
];

const SKILL_OPTIONS = [
  'Medical', 'First Aid', 'Emergency Care', 'Food Distribution',
  'Water Distribution', 'Shelter Coord.', 'Clothes Distribution',
  'Logistics', 'Transport', 'Driving', 'Community Outreach',
  'Community Management', 'Elderly Care', 'Child Care',
  'Search & Rescue', 'Counseling', 'Translation'
];

export default function VolunteerRegistration() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    // Personal Info
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    age: '',
    gender: '',
    address: '',
    area: '',
    
    // Emergency Contact
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    
    // Skills & Availability
    primarySkill: '',
    secondarySkills: [] as string[],
    experience: '',
    availability: 'weekends' as 'fulltime' | 'weekends' | 'emergencies_only' | 'flexible',
    hoursPerWeek: '',
    
    // Medical & Physical
    bloodGroup: '',
    medicalConditions: '',
    physicallyFit: true,
    
    // Resources
    hasVehicle: false,
    vehicleType: '',
    hasFirstAidKit: false,
    hasCommunicationDevice: false,
    
    // Additional
    languages: [] as string[],
    previousVolunteerExperience: '',
    motivation: '',
    agreeTerms: false
  });

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      secondarySkills: prev.secondarySkills.includes(skill)
        ? prev.secondarySkills.filter(s => s !== skill)
        : prev.secondarySkills.length < 5
          ? [...prev.secondarySkills, skill]
          : prev.secondarySkills
    }));
  };

  const toggleLanguage = (lang: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter(l => l !== lang)
        : [...prev.languages, lang]
    }));
  };

  const validateStep = (): boolean => {
    if (step === 1) {
      if (!formData.fullName || !formData.email || !formData.phone || !formData.area) {
        toast.error('Please fill all required fields');
        return false;
      }
      if (!formData.emergencyContactName || !formData.emergencyContactPhone) {
        toast.error('Emergency contact is required');
        return false;
      }
    }
    
    if (step === 2) {
      if (!formData.primarySkill) {
        toast.error('Please select your primary skill');
        return false;
      }
    }

    if (step === 3) {
      if (!formData.agreeTerms) {
        toast.error('Please agree to the terms and conditions');
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handleBack = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep()) return;

    console.log('🚀 Starting volunteer registration...');
    setIsSubmitting(true);

    try {
      // Calculate coordinates based on area (approximate)
      const areaCoords: Record<string, { x: number; y: number }> = {
        'T Nagar': { x: 38, y: 42 },
        'Adyar': { x: 70, y: 55 },
        'Anna Nagar': { x: 25, y: 20 },
        'Velachery': { x: 62, y: 70 },
        'Mylapore': { x: 55, y: 48 },
        'Guindy': { x: 42, y: 58 },
        'Royapuram': { x: 68, y: 25 },
        'Tambaram': { x: 45, y: 80 },
        'Saidapet': { x: 48, y: 52 },
        'Porur': { x: 20, y: 45 },
      };

      const coords = areaCoords[formData.area] || { x: 50, y: 50 };

      // Create volunteer document for Firebase
      const volunteerDoc: Omit<VolunteerDocument, 'createdAt' | 'updatedAt'> = {
        volunteerId: `V${Date.now()}`,
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        skills: [formData.primarySkill, ...formData.secondarySkills],
        location: formData.area,
        availability: formData.availability === 'fulltime' ? 'Available' : 'Available',
        rating: 0,
        completedTasks: 0,
        currentLoad: 0,
        maxCapacity: 5,
        x: coords.x,
        y: coords.y,
        // Additional metadata
        metadata: {
          age: parseInt(formData.age) || 0,
          gender: formData.gender,
          address: formData.address,
          area: formData.area,
          emergencyContact: {
            name: formData.emergencyContactName,
            phone: formData.emergencyContactPhone,
            relation: formData.emergencyContactRelation
          },
          experience: formData.experience,
          availability: formData.availability,
          hoursPerWeek: parseInt(formData.hoursPerWeek) || 0,
          bloodGroup: formData.bloodGroup,
          medicalConditions: formData.medicalConditions,
          physicallyFit: formData.physicallyFit,
          hasVehicle: formData.hasVehicle,
          vehicleType: formData.vehicleType,
          hasFirstAidKit: formData.hasFirstAidKit,
          hasCommunicationDevice: formData.hasCommunicationDevice,
          languages: formData.languages,
          previousExperience: formData.previousVolunteerExperience,
          motivation: formData.motivation
        }
      };

      console.log('📝 Creating volunteer document:', volunteerDoc.volunteerId);
      
      // Save to Firebase (or localStorage if Firebase not configured)
      const docId = await createVolunteer(volunteerDoc);
      
      console.log('✅ Volunteer saved with ID:', docId);

      // Update user's auth state with volunteerId
      if (user) {
        console.log('🔄 Updating auth state with volunteerId');
        updateUser({ volunteerId: volunteerDoc.volunteerId });
      }

      toast.success('Volunteer registration successful!', {
        description: 'Your profile has been saved. Welcome to the team!',
        icon: <CheckCircle className="h-5 w-5 text-green-600" />
      });

      console.log('🎉 Registration complete, redirecting to dashboard...');
      
      // Navigate to dashboard
      setTimeout(() => {
        navigate('/volunteer-dashboard');
      }, 1000);

    } catch (error: any) {
      console.error('Registration error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      let errorMessage = 'Unknown error occurred';
      
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.error?.message) {
        errorMessage = error.error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast.error('Registration failed', {
        description: errorMessage,
        duration: 10000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-blue-600 mb-4">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Volunteer Registration</h1>
          <p className="text-gray-600">Join our crisis response team and make a difference</p>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {step > 1 ? <CheckCircle className="h-5 w-5" /> : '1'}
              </div>
              <span className="text-sm font-medium">Personal Info</span>
            </div>
            <div className={`flex-1 h-1 mx-4 ${step > 1 ? 'bg-blue-600' : 'bg-gray-200'}`} />
            <div className="flex items-center space-x-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {step > 2 ? <CheckCircle className="h-5 w-5" /> : '2'}
              </div>
              <span className="text-sm font-medium">Skills & Resources</span>
            </div>
            <div className={`flex-1 h-1 mx-4 ${step > 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
            <div className="flex items-center space-x-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                3
              </div>
              <span className="text-sm font-medium">Review & Submit</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Step 1: Personal Information */}
          {step === 1 && (
            <div className="p-8 space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <User className="h-6 w-6 mr-2 text-blue-600" />
                Personal Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => updateFormData('fullName', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateFormData('phone', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>

                {/* Age */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age
                  </label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => updateFormData('age', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="25"
                    min="18"
                    max="65"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => updateFormData('gender', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>

                {/* Area */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Area in Chennai *
                  </label>
                  <select
                    value={formData.area}
                    onChange={(e) => updateFormData('area', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select your area</option>
                    {CHENNAI_AREAS.map(area => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Address
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => updateFormData('address', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Street, Landmark, etc."
                    rows={2}
                  />
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2 text-orange-600" />
                  Emergency Contact
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    value={formData.emergencyContactName}
                    onChange={(e) => updateFormData('emergencyContactName', e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Contact name *"
                    required
                  />
                  <input
                    type="tel"
                    value={formData.emergencyContactPhone}
                    onChange={(e) => updateFormData('emergencyContactPhone', e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Phone number *"
                    required
                  />
                  <input
                    type="text"
                    value={formData.emergencyContactRelation}
                    onChange={(e) => updateFormData('emergencyContactRelation', e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Relationship"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Skills & Resources */}
          {step === 2 && (
            <div className="p-8 space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Briefcase className="h-6 w-6 mr-2 text-blue-600" />
                Skills & Resources
              </h2>

              {/* Primary Skill */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Skill *
                </label>
                <select
                  value={formData.primarySkill}
                  onChange={(e) => updateFormData('primarySkill', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select your primary skill</option>
                  {SKILL_OPTIONS.map(skill => (
                    <option key={skill} value={skill}>{skill}</option>
                  ))}
                </select>
              </div>

              {/* Secondary Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Skills (up to 5)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {SKILL_OPTIONS.filter(s => s !== formData.primarySkill).map(skill => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        formData.secondarySkills.includes(skill)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Availability *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { value: 'fulltime', label: 'Full-time' },
                    { value: 'weekends', label: 'Weekends' },
                    { value: 'emergencies_only', label: 'Emergencies Only' },
                    { value: 'flexible', label: 'Flexible' }
                  ].map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateFormData('availability', option.value)}
                      className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        formData.availability === option.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hours per week */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hours Available Per Week
                </label>
                <input
                  type="number"
                  value={formData.hoursPerWeek}
                  onChange={(e) => updateFormData('hoursPerWeek', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="10"
                  min="1"
                  max="168"
                />
              </div>

              {/* Resources */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Car className="h-5 w-5 mr-2 text-blue-600" />
                  Resources & Equipment
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.hasVehicle}
                      onChange={(e) => updateFormData('hasVehicle', e.target.checked)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">I have a vehicle</span>
                  </label>
                  
                  {formData.hasVehicle && (
                    <select
                      value={formData.vehicleType}
                      onChange={(e) => updateFormData('vehicleType', e.target.value)}
                      className="ml-8 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select vehicle type</option>
                      <option value="car">Car</option>
                      <option value="bike">Motorcycle</option>
                      <option value="van">Van/Truck</option>
                      <option value="ambulance">Ambulance</option>
                    </select>
                  )}

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.hasFirstAidKit}
                      onChange={(e) => updateFormData('hasFirstAidKit', e.target.checked)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">I have a first aid kit</span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.hasCommunicationDevice}
                      onChange={(e) => updateFormData('hasCommunicationDevice', e.target.checked)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">I have communication device (radio/walkie-talkie)</span>
                  </label>
                </div>
              </div>

              {/* Languages */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Languages Spoken
                </label>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                  {['Tamil', 'English', 'Hindi', 'Telugu', 'Malayalam', 'Kannada', 'Urdu', 'Other'].map(lang => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => toggleLanguage(lang)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        formData.languages.includes(lang)
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review & Submit */}
          {step === 3 && (
            <div className="p-8 space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Shield className="h-6 w-6 mr-2 text-blue-600" />
                Review & Submit
              </h2>

              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Personal Information</h3>
                  <p className="text-sm text-gray-600">Name: {formData.fullName}</p>
                  <p className="text-sm text-gray-600">Email: {formData.email}</p>
                  <p className="text-sm text-gray-600">Phone: {formData.phone}</p>
                  <p className="text-sm text-gray-600">Area: {formData.area}</p>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Skills & Availability</h3>
                  <p className="text-sm text-gray-600">Primary Skill: {formData.primarySkill}</p>
                  <p className="text-sm text-gray-600">Additional Skills: {formData.secondarySkills.join(', ')}</p>
                  <p className="text-sm text-gray-600">Availability: {formData.availability}</p>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Resources</h3>
                  <p className="text-sm text-gray-600">Vehicle: {formData.hasVehicle ? formData.vehicleType : 'No'}</p>
                  <p className="text-sm text-gray-600">First Aid Kit: {formData.hasFirstAidKit ? 'Yes' : 'No'}</p>
                  <p className="text-sm text-gray-600">Languages: {formData.languages.join(', ')}</p>
                </div>
              </div>

              {/* Motivation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Why do you want to volunteer?
                </label>
                <textarea
                  value={formData.motivation}
                  onChange={(e) => updateFormData('motivation', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tell us your motivation..."
                  rows={3}
                />
              </div>

              {/* Terms */}
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={formData.agreeTerms}
                  onChange={(e) => updateFormData('agreeTerms', e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 mt-1"
                  required
                />
                <span className="text-sm text-gray-700">
                  I agree to the terms and conditions, and I understand my responsibilities as a crisis response volunteer. I consent to the collection and storage of my personal information for volunteer coordination purposes. *
                </span>
              </label>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-200 flex justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Back
              </button>
            ) : (
              <div />
            )}
            
            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Next Step
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Submit Registration
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
