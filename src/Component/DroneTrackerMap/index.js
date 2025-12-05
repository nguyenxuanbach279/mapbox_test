import React, { useState, useEffect, useCallback, useRef } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import { INITIAL_DRONE_ARRAY } from "../../data";
import Map, { Layer, Marker, Popup, Source } from "react-map-gl/mapbox";
import LeftSidebar from "../LeftSidebar";
import droneImage from "../../assets/images/drone.png";

const MAPBOX_TOKEN =
  "pk.eyJ1IjoiYmFjaDI3MDkwMSIsImEiOiJjbWlzcXN5M2sxNzY2M2VwdnF6ZHM1NXJjIn0.aFeZ5HwOBJc7ASztxPQ2KQ";

const routeLayerStyle = {
  id: "route-line",
  type: "line",
  layout: {
    "line-join": "round",
    "line-cap": "round",
  },
  paint: {
    "line-color": "#00BFFF",
    "line-width": 4,
  },
};

const INITIAL_VIEW_STATE = {
  longitude: 106.77,
  latitude: 10.82,
  zoom: 10.5,
};

const speed = 0.00005;

const dronesToGeoJSON = (dronesArray) => {
  return {
    type: "FeatureCollection",
    features: dronesArray.map((drone) => ({
      type: "Feature",
      properties: {
        id: drone.id,
        status: drone.orderStatus,
        destination: drone.endLocation,
        cluster: false,
      },
      geometry: {
        type: "Point",
        coordinates: drone.currentPosition,
      },
    })),
  };
};

const clusterLayer = {
  id: "clusters",
  type: "circle",
  source: "drone-source",
  filter: ["has", "point_count"], // Lọc: Chỉ hiển thị các Feature có thuộc tính 'point_count' (là cụm)
  paint: {
    "circle-color": [
      "step",
      ["get", "point_count"], // Dựa vào số lượng điểm trong cụm
      "#51bbd6",
      100,
      "#f1f075",
      750,
      "#f28cb1",
    ],
    "circle-radius": ["step", ["get", "point_count"], 20, 100, 30, 750, 40],
  },
};

// Layer 2: Cluster Counts (Số lượng)
const clusterCountLayer = {
  id: "cluster-count",
  type: "symbol",
  source: "drone-source",
  filter: ["has", "point_count"],
  layout: {
    "text-field": ["get", "point_count_abbreviated"],
    "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
    "text-size": 12,
    "icon-allow-overlap": true, // Cho phép số lượng đè lên vòng tròn
  },
  paint: {
    "text-color": "#000",
  },
};

// Layer 3: Unclustered Points (Điểm riêng lẻ)
const unclusteredPointLayer = {
  id: "unclustered-point",
  type: "symbol",
  source: "drone-source",
  filter: ["!", ["has", "point_count"]],
  layout: {
    // ****** SỬ DỤNG ID CỦA ẢNH PNG ĐÃ ADD ******
    "icon-image": droneImage,
    "icon-size": 0.3, // Điều chỉnh kích thước (ví dụ: 0.3 lần kích thước gốc)
    "icon-allow-overlap": true,
    "icon-anchor": "bottom",
    // Bỏ các thuộc tính text/emoji cũ
  },
  paint: {},
};

export default function DroneTrackerMap() {
  const mapRef = useRef(null);
  const [drones, setDrones] = useState(INITIAL_DRONE_ARRAY);
  const [selectedDrone, setSelectedDrone] = useState(null);
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const updateDronePositions = useCallback(() => {
    setDrones((prevDrones) =>
      prevDrones.map((drone) => {
        if (drone.waypointIndex > 1) {
          return drone;
        }

        const currentPos = drone.currentPosition;
        const targetPos = drone.destinationPosition;

        const [longDiff, latDiff] = [
          targetPos[0] - currentPos[0],
          targetPos[1] - currentPos[1],
        ];
        const distance = Math.sqrt(longDiff * longDiff + latDiff * latDiff);

        if (distance < speed * 1.5) {
          if (selectedDrone && selectedDrone.id === drone.id) {
            setSelectedDrone((prev) => ({
              ...prev,
              currentPosition: targetPos,
              orderStatus: "Đã giao",
            }));
          }

          return {
            ...drone,
            currentPosition: targetPos,
            waypointIndex: 2,
            orderStatus: "Đã giao",
          };
        }

        const fraction = Math.min(speed / distance, 1);
        const newLong = currentPos[0] + longDiff * fraction;
        const newLat = currentPos[1] + latDiff * fraction;

        if (selectedDrone && selectedDrone.id === drone.id) {
          setSelectedDrone((prev) => ({
            ...prev,
            currentPosition: [newLong, newLat],
          }));
        }

        return {
          ...drone,
          currentPosition: [newLong, newLat],
        };
      })
    );
  }, [selectedDrone]);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    const interval = setInterval(updateDronePositions, 2000);
    return () => clearInterval(interval);
  }, [updateDronePositions]);

  const handleDroneClick = useCallback((drone) => {
    setSelectedDrone(drone);
    setIsSidebarOpen(true);

    if (mapRef.current) {
      mapRef.current.getMap().flyTo({
        center: drone.currentPosition,
        zoom: 15,
        duration: 1000,
      });
    }
  }, []);

  const clearSelectedDrone = useCallback(() => {
    setSelectedDrone(null);
  }, []);

  return (
    <>
      <LeftSidebar
        drones={drones}
        selectedDrone={selectedDrone}
        handleDroneClick={handleDroneClick}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        clearSelectedDrone={clearSelectedDrone}
      />
      <Map
        {...viewState}
        ref={mapRef}
        onMove={(evt) => setViewState(evt.viewState)}
        style={{ flex: 1, height: "100vh" }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
        id="mainMap"
      >
        {drones.map((drone) => {
          return (
            <Marker
              key={drone.id}
              longitude={drone.currentPosition[0]}
              latitude={drone.currentPosition[1]}
              anchor="bottom"
              onClick={() => handleDroneClick(drone)}
            >
              <div
                style={{
                  fontSize: "30px",
                  cursor: "pointer",
                  color:
                    drone.orderStatus === "Đã giao" ? "#009900" : "#FF0000",
                  position: 'relative'
                }}
                title={`Drone ID: ${drone.id}`}
              >
                <img src={droneImage} alt="drone" style={{width: 48, height: 48, position: 'absolute', bottom: -10}}/>
              </div>
            </Marker>
          );
        })}

        {selectedDrone && (
          <>
            <Source
              key={`route-${selectedDrone.id}`}
              id="route-source"
              type="geojson"
              data={selectedDrone.routeGeoJSON}
            >
              <Layer {...routeLayerStyle} />
            </Source>
          </>
        )}
      </Map>
    </>
  );
}
