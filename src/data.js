// data.js

// Tọa độ trung tâm để tạo Hub ngẫu nhiên (Ví dụ: Trung tâm TP.HCM)
const CENTER_LONG = 106.7000;
const CENTER_LAT = 10.7700;

// Bán kính ngẫu nhiên tối đa để rải Hubs (khoảng 0.05 độ ~ 5 km)
const RANDOM_HUB_RANGE = 0.05; 

// Số lượng Hub/Điểm đến
const NUM_HUBS = 100;

// Số lượng Drone
const NUM_DRONES = 10;

// --- HÀM TẠO 100 HUB NGẪU NHIÊN ---
const generateRandomHubs = (count) => {
    const hubs = [];
    for (let i = 0; i < count; i++) {
        // Tạo tọa độ ngẫu nhiên xung quanh điểm trung tâm
        const randomLong = CENTER_LONG + (Math.random() - 0.5) * RANDOM_HUB_RANGE * 2;
        const randomLat = CENTER_LAT + (Math.random() - 0.5) * RANDOM_HUB_RANGE * 2;
        
        hubs.push({
            name: `HUB ${i.toString().padStart(3, '0')}`,
            position: [randomLong, randomLat]
        });
    }
    return hubs;
};

// Khởi tạo 100 Hubs
const HUBS = generateRandomHubs(NUM_HUBS);

// --- HÀM MÔ PHỎNG TUYẾN ĐƯỜNG (Giữ nguyên) ---
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

// --- HÀM TẠO DỮ LIỆU CHO MỘT DRONE DUY NHẤT ---
export const createNewDrone = (id) => {
  // Chọn ngẫu nhiên một Hub làm điểm xuất phát
  const startHub = HUBS[Math.floor(Math.random() * NUM_HUBS)];
  
  let endHub;
  do {
      // Chọn ngẫu nhiên một Hub làm điểm đến (đảm bảo không trùng với điểm xuất phát)
      endHub = HUBS[Math.floor(Math.random() * NUM_HUBS)];
  } while (endHub.name === startHub.name);

  // Thêm một chút độ lệch nhỏ vào vị trí xuất phát thực tế
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

// --- HÀM TẠO DỮ LIỆU KHỞI TẠO CHO 1000 DRONE ---
export const generateInitialDrones = (numDrones = NUM_DRONES) => {
  const initialDrones = [];
  for (let i = 1; i <= numDrones; i++) {
    initialDrones.push(createNewDrone(i));
  }
  return initialDrones;
};

export const INITIAL_DRONE_ARRAY = generateInitialDrones(NUM_DRONES);
export const DESTINATIONS_ARRAY = HUBS;