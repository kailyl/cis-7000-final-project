import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import * as d3 from "d3";

interface MapProps {
  isSchoolsChecked: boolean;
  isSubwaysChecked: boolean;
  isHospitalsChecked: boolean;
  eventName: String;
  setEventName: (value: string) => void;
  setNeighborhoodName: (value: string) => void;
}

const Map: React.FC<MapProps> = ({ 
  isSchoolsChecked, 
  isSubwaysChecked, 
  isHospitalsChecked, 
  eventName, 
  setEventName,
  setNeighborhoodName
}) => {  

  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  
  // Load CSV data
  const fetchData = async (dataTypes) => {
    try {
        const textDict = {};

        // Define an array of offense categories
        const offenseCategories = Object.keys(dataTypes);

        // Loop through each offense category to fetch data
        for (const category of offenseCategories) {
          if (dataTypes[category] > 0) {
            const response = await fetch(`/data/${category}.csv`);
            const text = await response.text();
            textDict[category] = text;
          }
        }

        return textDict;
    } catch (error) {
        console.error("Error loading CSV:", error);
        return null;
    }
  };

  useEffect(() => {
    if (mapContainer.current) {
      mapboxgl.accessToken = "pk.eyJ1IjoibGl1a2FpbHkiLCJhIjoiY2x1ajFpNHZxMGIwYzJrbno1Yjh3MW42MiJ9.xbXOekv11HSOizwSEzxhcQ";

      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/dark-v10",
        center: [-75.191501, 39.962232], // Philadelphia coordinates
        zoom: 12,
        maxZoom: 16, 
        minZoom: 10,
      });

      map.on("style.load", () => {
        mapRef.current = map;

        // GeoJSON map of neighborhoods 
        map.addSource("neighborhoods", {
          type: "geojson",
          data: "/geojson/philadelphia_neighborhoods.geojson" // Replace this with the path to your GeoJSON file
        });

        // Add layer for Philadelphia neighborhoods
        map.addLayer({
          id: "neighborhoods-layer",
          type: "fill",
          source: "neighborhoods",
          paint: {
            "fill-color": "rgba(0, 0, 255, 0.1)", // Adjust the fill color as desired
            "fill-opacity": 0 // Adjust the fill opacity as desired
          }
        });

        // Add a layer for hovered neighborhood outline
        map.addLayer({
          id: "hovered-neighborhood-outline",
          type: "line",
          source: "neighborhoods",
          paint: {
            "line-color": "white", // Change the outline color as desired
            "line-width": 3 // Change the outline width as desired
          },
          filter: ["==", "cartodb_id", ""] // Initially, filter to no features
        });

        // Variable to hold the ID of the hovered neighborhood feature
        let hoveredNeighborhoodId: string | undefined;

        // When the mouse moves over the map, check for features at the mouse position
        map.on("mousemove", "neighborhoods-layer", (e) => {
          if (e.features && e.features.length > 0) {
            const hoveredNeighborhoodId = e.features[0].properties.cartodb_id;
            setNeighborhoodName(e.features[0].properties.mapname)
            map.setFilter("hovered-neighborhood-outline", ["==", "cartodb_id", hoveredNeighborhoodId]);
          }
        });

        // Reset the state of the previously hovered neighborhood when the mouse leaves the map
        map.on("mouseleave", "neighborhoods-layer", () => {
          map.setFilter("hovered-neighborhood-outline", ["==", "cartodb_id", ""]);
          setNeighborhoodName("")
        });

        setEventName("Priority 1: Immediate Threat to Life")
      })
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    mapRef.current.getStyle().layers.forEach(layer => {
      if (layer.id.includes("heatmap")) {
        mapRef.current.removeLayer(layer.id);
      }
    });

    Object.keys(mapRef.current.getStyle().sources).forEach(sourceId => {
      if (sourceId.includes("heatmap")) {
        mapRef.current.removeSource(sourceId);
      }
    });

    let dataTypes = {};

    if (eventName === 'Priority 1: Immediate Threat to Life') {
      dataTypes = {
        // priority one - immediate response + reason to believe that an immediate threat to life exists
        "aggravated_assault_firearm" : 0.1,
        "homicide_-_criminal" : 0.1, 
        "robbery_firearm" : 0.1, 
      }
    } else if (eventName === 'Priority 1 and 2: Immediate Response with Risk of Property Loss') {
      dataTypes = {
        // priority one - immediate response + reason to believe that an immediate threat to life exists
        "aggravated_assault_firearm" : 0.1,
        "homicide_-_criminal" : 0.1, 
        "robbery_firearm" : 0.1, 
    
        // priority two - immediate response + immediate and substantial risk of major property loss or damage
        "aggravated_assault_no_firearm" : 0.03,
        "arson" : 0.03, 
        "burglary_non-residential" : 0.03, 
        "burglary_residential" : 0.03,
        "motor_vehicle_theft" : 0.03, 
        "other_assaults" : 0.03, 
        "robbery_no_firearm" : 0.03, 
      } 
    } else if (eventName === 'All Priorities: Immediate Response with Varying Degrees of Risk') {
      dataTypes = {
        // priority one - immediate response + reason to believe that an immediate threat to life exists
        "aggravated_assault_firearm" : 0.1,
        "homicide_-_criminal" : 0.1, 
        "robbery_firearm" : 0.1, 
    
        // priority two - immediate response + immediate and substantial risk of major property loss or damage
        "aggravated_assault_no_firearm" : 0.03,
        "arson" : 0.03, 
        "burglary_non-residential" : 0.03, 
        "burglary_residential" : 0.03,
        "motor_vehicle_theft" : 0.03, 
        "other_assaults" : 0.03, 
        "robbery_no_firearm" : 0.03, 

        // priority three - immediate response + no significant threat of serious physical injury or major property damage
        "disorderly_conduct" : 0.01, 
        "driving_under_the_influence" : 0.01, 
        "narcotic___drug_law_violations" : 0.01, 
        "public_drunkenness" : 0.01, 
        "vagrancy_loitering" : 0.01, 
        "vandalism_criminal_mischief" : 0.01, 
        "theft_from_vehicle" : 0.01, 
        "thefts" : 0.01,
      } 
    }
    
    fetchData(dataTypes).then(res => {
      const textDict = res; 
      if (!textDict) return; 

      // Create map for each offense category
      for (const category in textDict) {
        if (textDict.hasOwnProperty(category)) {
          const data = d3.csvParse(textDict[category]);

          let opacity = 0.2; 
          if (dataTypes[category] >= 0.1) {
            opacity = 1;
          } else if (dataTypes[category] >= 0.03) {
            opacity = 0.3; 
          }

          // Convert CSV data to heatmapData array
          const heatmapData = data.map(row => ({
            lng: parseFloat(row.lng),
            lat: parseFloat(row.lat),
            weight: dataTypes[category], // Set weight based on the offense category
            description: row.text_general_code // Description from your CSV data
          }));

          // Add heatmap source
          mapRef.current.addSource(`${category}-heatmap-data`, {
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
                  weight: point.weight,
                }
              }))
            }
          });

          // Add heatmap layer
          mapRef.current.addLayer({
            id: `${category}-heatmap-layer`,
            type: "heatmap",
            source: `${category}-heatmap-data`,
            maxzoom: 20,
            minzoom: 5, 
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
              "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 0, 1, 5, 10],
              // Transition from heatmap to circle layer by zoom level
              "heatmap-opacity": opacity,
            }
          });
        }
      }

      mapRef.current.moveLayer('neighborhoods-layer');
      mapRef.current.moveLayer('hovered-neighborhood-outline')
      mapRef.current.getStyle().layers.forEach(layer => {
        if (layer.id.includes("dot-layer")) {
          mapRef.current.moveLayer(layer.id)
        }
      });
    })
  }, [eventName]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Function to add subway dots to the map
    const addSubwayDots = async () => {
      const response = await fetch("/data/subways.csv");
      const text = await response.text();
      const data = d3.csvParse(text);

      // Convert CSV data to dotData array
      const dotData = data.map(row => ({
        lng: parseFloat(row.lng),
        lat: parseFloat(row.lat),
      }));

      // Add dot source
      mapRef.current.addSource("subways-dot-data", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: dotData.map(point => ({
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [point.lng, point.lat]
            }
          }))
        }
      });

      // Add dot layer
      mapRef.current.addLayer({
        id: "subways-dot-layer",
        type: "circle",
        source: "subways-dot-data",
        paint: {
          // Adjust the circle radius to a smaller value
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 0, 0.8, 10, 3],
          // Color for subway dots
          "circle-color": "rgba(255, 0, 255, 0.8)", // Adjust color as needed
          // Adjust the circle opacity by zoom level
          "circle-opacity": 1,
          // Set circle border color to white
          "circle-stroke-color": "#000000",
          // Set circle border width to 0
          "circle-stroke-width": 1
        }
      });
    };

    // Function to remove subway dots from the map
    const removeSubwayDots = () => {
      if (mapRef.current.getLayer("subways-dot-layer")) {
        mapRef.current.removeLayer("subways-dot-layer");
      }
      if (mapRef.current.getSource("subways-dot-data")) {
        mapRef.current.removeSource("subways-dot-data");
      }
    };

    // Add or remove subway dots based on the state of isSubwaysChecked
    if (isSubwaysChecked) {
      addSubwayDots();
    } else {
      removeSubwayDots();
    }
  }, [isSubwaysChecked]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Function to add hospital dots to the map
    const addHospitalDots = async () => {
      const response = await fetch("/data/hospitals.csv");
      const text = await response.text();
      const data = d3.csvParse(text);

      // Convert CSV data to dotData array
      const dotData = data.map(row => ({
        lng: parseFloat(row.lng),
        lat: parseFloat(row.lat),
      }));

      // Add dot source
      mapRef.current.addSource("hospitals-dot-data", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: dotData.map(point => ({
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [point.lng, point.lat]
            }
          }))
        }
      });

      // Add dot layer
      mapRef.current.addLayer({
        id: "hospitals-dot-layer",
        type: "circle",
        source: "hospitals-dot-data",
        paint: {
          // Adjust the circle radius to a smaller value
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 0, 0.8, 10, 3],
          // Color for hospital dots
          "circle-color": "rgba(0, 139, 139, 0.8)", // Adjust color as needed
          // Adjust the circle opacity by zoom level
          "circle-opacity": 1,
          // Set circle border color to white
          "circle-stroke-color": "#000000",
          // Set circle border width to 0
          "circle-stroke-width": 1
        }
      });
    };

    // Function to remove hospital dots from the map
    const removeHospitalDots = () => {
      if (mapRef.current.getLayer("hospitals-dot-layer")) {
        mapRef.current.removeLayer("hospitals-dot-layer");
      }
      if (mapRef.current.getSource("hospitals-dot-data")) {
        mapRef.current.removeSource("hospitals-dot-data");
      }
    };

    // Add or remove hospital dots based on the state of isHospitalsChecked
    if (isHospitalsChecked) {
      addHospitalDots();
    } else {
      removeHospitalDots();
    }
  }, [isHospitalsChecked]);

  useEffect(() => {
    if (!mapRef.current) return;

    const addSchoolDots = async () => {
      const response = await fetch("/data/public_schools.csv");
      const text = await response.text();
      const data = d3.csvParse(text);

      const dotData = data.map(row => ({
        name: row.name,
        lng: parseFloat(row.lng),
        lat: parseFloat(row.lat),
      }));

      // Add dot source
       mapRef.current.addSource("schools-dot-data", {
            type: "geojson",
            data: {
                type: "FeatureCollection",
                features: dotData.map(point => ({
                    type: "Feature",
                    properties: {
                        description: point.name  // Assuming you want to show school names
                    },
                    geometry: {
                        type: "Point",
                        coordinates: [point.lng, point.lat]
                    }
                }))
            }
      });

      // Add dot layer
      mapRef.current.addLayer({
            id: "schools-dot-layer",
            type: "circle",
            source: "schools-dot-data",
            paint: {
                "circle-radius": ["interpolate", ["linear"], ["zoom"], 0, 0.8, 10, 3],
                "circle-color": "rgba(255, 165, 0, 0.8)",
                "circle-opacity": 1,
                "circle-stroke-color": "#000000",
                "circle-stroke-width": 1
            }
      });
    };

    const removeSchoolDots = () => {
        if (mapRef.current.getLayer("schools-dot-layer")) {
            mapRef.current.removeLayer("schools-dot-layer");
        }
        if (mapRef.current.getSource("schools-dot-data")) {
            mapRef.current.removeSource("schools-dot-data");
        }
        // Remove event listeners if they were added
        mapRef.current.off('mouseenter', 'schools-dot-layer');
        mapRef.current.off('mouseleave', 'schools-dot-layer');
    };

    // Add or remove school dots based on the state of isSchoolsChecked
    if (isSchoolsChecked) {
        addSchoolDots();
    } else {
        removeSchoolDots();
    }
}, [isSchoolsChecked]); // Ensure mapRef is also included in dependencies


  return (
    <div
      ref={mapContainer}
      style={{ 
        position: "absolute", 
        top: 0, 
        bottom: 0, 
        left: 0, 
        width: "70%" 
      }}
    />
  );
};

export default Map;