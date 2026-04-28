import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { NeedRequest, Volunteer } from '@/data/mock';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Chennai area coordinates
const CHENNAI_CENTER: [number, number] = [13.0827, 80.2707];

// Location mapping (area name to coordinates)
const LOCATION_COORDS: Record<string, [number, number]> = {
  'T Nagar': [13.0418, 80.2341],
  'Adyar': [13.0067, 80.2573],
  'Anna Nagar': [13.0850, 80.2101],
  'Velachery': [12.9750, 80.2210],
  'Mylapore': [13.0345, 80.2735],
  'Guindy': [13.0067, 80.2278],
  'Royapuram': [13.1120, 80.2990],
  'Tambaram': [12.9249, 80.1000],
  'Saidapet': [13.0225, 80.2270],
  'Porur': [13.0350, 80.1580],
  'Kodambakkam': [13.0525, 80.2210],
  'Nungambakkam': [13.0569, 80.2425],
};

interface ChennaiMapViewProps {
  requests: NeedRequest[];
  volunteers: Volunteer[];
  showVolunteers?: boolean;
}

export function ChennaiMapView({ requests, volunteers, showVolunteers = true }: ChennaiMapViewProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-[500px] rounded-2xl border border-gray-200 bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">Loading Chennai Map...</p>
        </div>
      </div>
    );
  }

  const getCoordinates = (location: string): [number, number] => {
    return LOCATION_COORDS[location] || CHENNAI_CENTER;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return '#ef4444';
      case 'Medium': return '#f59e0b';
      case 'Low': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getRadius = (score: number) => {
    return 500 + (score * 50); // meters
  };

  return (
    <div className="h-[500px] rounded-2xl border border-gray-200 overflow-hidden">
      <MapContainer
        center={CHENNAI_CENTER}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Request Heatmap Circles */}
        {requests.map((request) => {
          const coords = getCoordinates(request.location);
          const color = getPriorityColor(request.priority);
          
          return (
            <Circle
              key={`circle-${request.id}`}
              center={coords}
              radius={getRadius(request.score)}
              pathOptions={{
                color: color,
                fillColor: color,
                fillOpacity: 0.3,
                weight: 2,
              }}
            >
              <Tooltip>
                <div className="text-xs">
                  <strong>{request.type}</strong><br/>
                  {request.location} - {request.priority} Priority<br/>
                  Score: {request.score}/100
                </div>
              </Tooltip>
            </Circle>
          );
        })}

        {/* Request Markers */}
        {requests.map((request) => {
          const coords = getCoordinates(request.location);
          const color = getPriorityColor(request.priority);
          
          const customIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="
              background: ${color};
              width: 24px;
              height: 24px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 12px;
            ">!</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });

          return (
            <Marker
              key={`marker-${request.id}`}
              position={coords}
              icon={customIcon}
            >
              <Popup>
                <div className="text-sm">
                  <h3 className="font-bold text-base mb-2">{request.type} Request</h3>
                  <p><strong>ID:</strong> {request.id}</p>
                  <p><strong>Location:</strong> {request.location}</p>
                  <p><strong>Priority:</strong> <span style={{ color }}>{request.priority}</span></p>
                  <p><strong>People:</strong> {request.people}</p>
                  <p><strong>Status:</strong> {request.status}</p>
                  <p className="mt-2 text-xs text-gray-600">{request.description}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Volunteer Markers */}
        {showVolunteers && volunteers.map((volunteer) => {
          const coords = getCoordinates(volunteer.location);
          
          const volunteerIcon = L.divIcon({
            className: 'volunteer-marker',
            html: `<div style="
              background: ${volunteer.availability === 'Available' ? '#22c55e' : '#6b7280'};
              width: 20px;
              height: 20px;
              border-radius: 50%;
              border: 2px solid white;
              box-shadow: 0 2px 6px rgba(0,0,0,0.2);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 10px;
            ">V</div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          });

          return (
            <Marker
              key={`vol-${volunteer.id}`}
              position={coords}
              icon={volunteerIcon}
            >
              <Popup>
                <div className="text-sm">
                  <h3 className="font-bold text-base mb-2">{volunteer.name}</h3>
                  <p><strong>ID:</strong> {volunteer.id}</p>
                  <p><strong>Skill:</strong> {volunteer.skill}</p>
                  <p><strong>Location:</strong> {volunteer.location}</p>
                  <p><strong>Status:</strong> <span style={{ color: volunteer.availability === 'Available' ? '#22c55e' : '#6b7280' }}>{volunteer.availability}</span></p>
                  <p><strong>Trust:</strong> {volunteer.trust}%</p>
                  <p><strong>Tasks:</strong> {volunteer.tasksCompleted}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
