const CENTER_LONG = 106.7000;
const CENTER_LAT = 10.7700;

const RANDOM_HUB_RANGE = 0.05; 
const NUM_HUBS = 100;
const NUM_DRONES = 10;

const generateRandomHubs = (count) => {
    const hubs = [];
    for (let i = 0; i < count; i++) {
        const randomLong = CENTER_LONG + (Math.random() - 0.5) * RANDOM_HUB_RANGE * 2;
        const randomLat = CENTER_LAT + (Math.random() - 0.5) * RANDOM_HUB_RANGE * 2;
        
        hubs.push({
            name: `HUB ${i.toString().padStart(3, '0')}`,
            position: [randomLong, randomLat]
        });
    }
    return hubs;
};

const HUBS = generateRandomHubs(NUM_HUBS);

const createRouteGeoJSON = (start, end) => {
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            start,
            end
          ],
        },
        properties: {},
      },
    ],
  };
};

export const createNewDrone = (id) => {
  const startHub = HUBS[Math.floor(Math.random() * NUM_HUBS)];
  
  let endHub;
  do {
      endHub = HUBS[Math.floor(Math.random() * NUM_HUBS)];
  } while (endHub.name === startHub.name);

  const startPosition = [
      startHub.position[0] + (Math.random() - 0.5) * 0.0001,
      startHub.position[1] + (Math.random() - 0.5) * 0.0001
  ];

  const route = createRouteGeoJSON(startPosition, endHub.position);

  return {
    id: `DRN${id.toString().padStart(4, '0')}`,
    orderId: `ORD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    orderStatus: 'Đang vận chuyển',
    startLocation: startHub.name,
    endLocation: endHub.name,
    currentPosition: startPosition,
    destinationPosition: endHub.position,
    routeGeoJSON: route, 
    waypointIndex: 1, 
  };
};

export const generateInitialDrones = (numDrones = NUM_DRONES) => {
  const initialDrones = [];
  for (let i = 1; i <= numDrones; i++) {
    initialDrones.push(createNewDrone(i));
  }
  return initialDrones;
};

export const INITIAL_DRONE_ARRAY = generateInitialDrones(NUM_DRONES);
export const DESTINATIONS_ARRAY = HUBS;