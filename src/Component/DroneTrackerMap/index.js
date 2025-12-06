import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import { INITIAL_DRONE_ARRAY } from "../../data";
import Map, { Layer, Source } from "react-map-gl/mapbox";
import LeftSidebar from "../LeftSidebar";
import droneImage from "../../assets/images/drone.png";
import { DRONE_IMAGE_ID, INITIAL_VIEW_STATE, speed } from "../contants";
import {
  clusterCountLayer,
  clusterLayer,
  routeLayerStyle,
  unclusteredPointLayer,
} from "./config";

const MAPBOX_TOKEN =
  "pk.eyJ1IjoiYmFjaDI3MDkwMSIsImEiOiJjbWlzcXN5M2sxNzY2M2VwdnF6ZHM1NXJjIn0.aFeZ5HwOBJc7ASztxPQ2KQ";

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

export default function DroneTrackerMap() {
  const mapRef = useRef(null);
  const [drones, setDrones] = useState(INITIAL_DRONE_ARRAY);
  const [selectedDrone, setSelectedDrone] = useState(null);
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

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

  const handleDroneClick = useCallback(
    (id, coords) => {
      const drone = drones.find((d) => d.id === id);
      if (drone) {
        setSelectedDrone(drone);
        setIsSidebarOpen(true);
        if (mapRef.current) {
          mapRef.current.getMap().flyTo({
            center: coords,
            zoom: 15,
            duration: 1000,
          });
        }
      }
    },
    [drones]
  );

  useEffect(() => {
    const map = mapRef.current?.getMap();

    if (map) {
      const loadImage = () => {
        if (!map.hasImage(DRONE_IMAGE_ID)) {
          map.loadImage(droneImage, (error, image) => {
            if (error) {
              console.error("Lỗi tải ảnh drone:", error);
              return;
            }
            map.addImage(DRONE_IMAGE_ID, image, { sdf: true });
            setIsImageLoaded(true);
          });
        } else {
          setIsImageLoaded(true);
        }
      };

      map.on("load", loadImage);
      if (map.isStyleLoaded()) {
        loadImage();
      }

      return () => {
        map.off("load", loadImage);
      };
    }
  }, [mapRef.current]);

  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (map && isImageLoaded) {
      const handleClick = (e) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: ["unclustered-point"],
        });

        if (!features.length) return;

        const feature = features[0];
        const droneId = feature.properties.id;
        const coords = feature.geometry.coordinates;

        handleDroneClick(droneId, coords);
      };

      map.on("click", "unclustered-point", handleClick);

      map.on("mouseenter", "unclustered-point", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "unclustered-point", () => {
        map.getCanvas().style.cursor = "";
      });

      return () => {
        map.off("click", "unclustered-point", handleClick);
        map.off("mouseenter", "unclustered-point", () => {});
        map.off("mouseleave", "unclustered-point", () => {});
      };
    }
  }, [mapRef.current, isImageLoaded, handleDroneClick]);

  useEffect(() => {
    const interval = setInterval(updateDronePositions, 2000);
    return () => clearInterval(interval);
  }, [updateDronePositions]);

  const clearSelectedDrone = useCallback(() => {
    setSelectedDrone(null);
  }, []);

  const droneGeoJSON = useMemo(() => {
    return dronesToGeoJSON(drones);
  }, [drones]);

  return (
    <>
      <LeftSidebar
        drones={drones}
        selectedDrone={selectedDrone}
        handleDroneClick={(drone) =>
          handleDroneClick(drone.id, drone.currentPosition)
        }
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

        {isImageLoaded && (
          <Source
            id="drone-source"
            type="geojson"
            data={droneGeoJSON}
            cluster={true}
            clusterMaxZoom={14}
            clusterRadius={50}
          >
            <Layer {...clusterLayer} />
            <Layer {...clusterCountLayer} />
            <Layer {...unclusteredPointLayer} />
          </Source>
        )}
      </Map>
    </>
  );
}
