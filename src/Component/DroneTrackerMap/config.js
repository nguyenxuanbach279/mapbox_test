import { DRONE_IMAGE_ID } from "../contants";

export const routeLayerStyle = {
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

export const clusterLayer = {
  id: "clusters",
  type: "circle",
  source: "drone-source",
  filter: ["has", "point_count"],
  paint: {
    "circle-color": [
      "step",
      ["get", "point_count"],
      "#51bbd6",
      100,
      "#f1f075",
      750,
      "#f28cb1",
    ],
    "circle-radius": ["step", ["get", "point_count"], 20, 100, 30, 750, 40],
  },
};

export const clusterCountLayer = {
  id: "cluster-count",
  type: "symbol",
  source: "drone-source",
  filter: ["has", "point_count"],
  layout: {
    "text-field": ["get", "point_count_abbreviated"],
    "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
    "text-size": 12,
    "icon-allow-overlap": true,
  },
  paint: {
    "text-color": "#000",
  },
};


export const unclusteredPointLayer = {
    id: 'unclustered-point',
    type: 'symbol', 
    source: 'drone-source', 
    filter: ['!', ['has', 'point_count']],
    layout: {
        'icon-image': DRONE_IMAGE_ID, 
        'icon-size': 0.5, 
        'icon-allow-overlap': true,
        'icon-anchor': 'bottom', 
    },
    paint: {
        'icon-color': '#000000', 
    }
};

export const selectedCircleLayerStyle = {
    id: "selected-drone-circle",
    type: "circle",
    paint: {
        "circle-radius": 16,
        "circle-color": "#FFD700",
        "circle-opacity": 0.5,
        "circle-stroke-width": 2, 
        "circle-stroke-color": "#FFFFFF",
        "circle-translate": [0, -24],
    },
};

export const selectedDroneIconLayerStyle = {
    id: "single-selected-drone-icon",
    type: "symbol",
    layout: {
        'icon-image': DRONE_IMAGE_ID, 
        'icon-size': 0.5, 
        'icon-allow-overlap': true,
        'icon-anchor': 'bottom', 
    },
    paint: {
        'icon-color': 'rgba(245, 13, 13, 1)' // Luôn là màu vàng nổi bật
    }
};