import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

const Home: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mapboxgl.accessToken = "pk.eyJ1IjoibGl1a2FpbHkiLCJhIjoiY2x1ajFpNHZxMGIwYzJrbno1Yjh3MW42MiJ9.xbXOekv11HSOizwSEzxhcQ";

    if (mapContainer.current) {
      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/dark-v10",
        center: [-75.1652, 39.9526], // Philadelphia coordinates
        zoom: 12,
      });

      map.on("style.load", () => {
        // Now that the style has loaded, you can add sources and layers
        // Dummy heatmap data
        const heatmapData = [
          { lng: -75.1644, lat: 39.9533, weight: 0.5 },
          { lng: -75.1698, lat: 39.9505, weight: 0.8 },
          // Add more data points as needed
        ];

        // Add heatmap source
        map.addSource("heatmap-data", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: heatmapData.map(point => ({
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: [point.lng, point.lat]
              },
              properties: {
                weight: point.weight
              }
            }))
          }
        });

        // Add heatmap layer
        map.addLayer({
          id: "heatmap-layer",
          type: "heatmap",
          source: "heatmap-data",
          maxzoom: 15,
          paint: {
            // Increase the heatmap weight based on frequency and property magnitude
            "heatmap-weight": ["interpolate", ["linear"], ["get", "weight"], 0, 0, 1, 1],
            // Increase the heatmap color weight weight by zoom level
            // heatmap-intensity is a multiplier on top of heatmap-weight
            "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 0, 1, 15, 3],
            // Color ramp for heatmap
            "heatmap-color": [
              "interpolate",
              ["linear"],
              ["heatmap-density"],
              0,
              "rgba(33,102,172,0)",
              0.2,
              "rgb(103,169,207)",
              0.4,
              "rgb(209,229,240)",
              0.6,
              "rgb(253,219,199)",
              0.8,
              "rgb(239,138,98)",
              1,
              "rgb(178,24,43)"
            ],
            // Adjust the heatmap radius by zoom level
            "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 0, 2, 15, 20],
            // Transition from heatmap to circle layer by zoom level
            "heatmap-opacity": 0.9 // Increase opacity for better visibility
          }
        });
      });

      return () => map.remove(); // Cleanup on unmount
    }
  }, []);

  return (
    <div
      ref={mapContainer}
      style={{ position: "absolute", top: 0, bottom: 0, left: -10, width: "110%" }}
    />
  );
};

export default Home;