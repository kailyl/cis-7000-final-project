import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import * as d3 from "d3";

const Home: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);

  const dataTypes = {
    // priority one - immediate response + reason to believe that an immediate threat to life exists
    "aggravated_assault_firearm" : 0.1,
    "homicide_-_criminal" : 0.1, 
    "robbery_firearm" : 0.1, 

    // priority two - immediate response + immediate and substantial risk of major property loss or damage
    "aggravated_assault_no_firearm" : 0.03,
    "arson" : 0.03, 
    "burgulary_non-residential" : 0.03, 
    "burgulary_residential" : 0.03,
    "motor_vehicle_theft" : 0.03, 
    "other_assaults" : 0.03, 
    "robbery_no_firearm" : 0.03, 
    "theft_from_vehicle" : 0.03, 
    "thefts" : 0.03, 

    // priority three - immediate response + no significant threat of serious physical injury or major property damage
    "disorderly_conduct" : 0.01, 
    "driving_under_the_influence" : 0.01, 
    "narcotic__drug_law_violations" : 0.01, 
    "public_drunkenness" : 0.01, 
    "vagrancy_loitering" : 0.01, 
    "vandalism_criminal_mischief" : 0.01,
    
    // priority four - likelihood that an officer's investigation will lead to the apprehension of a suspect based on evidence 
    "embezzlement" : 0, 
    "forgery_and_counterfeiting" : 0, 
    "fraud" : 0, 
    "gambling_violations" : 0, 
    "homicide_-_gross_negligence" : 0, 
    "homicide_-_justifiable" : 0, 
    "liquor_law_violations" : 0,  
    "offenses_against_family_and_children" : 0, 
    "other_sex_offenses_(not_commercialized)" : 0, 
    "prostitution_and_commercialized_vice" : 0,  
    "rape" : 0, 
    "receiving_stolen_property" : 0, 
    "weapon_violations" : 0, 
  }

  const recommendedDataTypes = {
    // additional recommended data
    "public_schools" : 0.8, 
  }
  
  useEffect(() => {
    // Load CSV data
    const fetchData = async () => {
      try {
          const textDict = {};
          const recommendedDict = {};

          // Define an array of offense categories
          const offenseCategories = Object.keys(dataTypes);
          const recommendedCategories = Object.keys(recommendedDataTypes);

          // Loop through each offense category to fetch data
          for (const category of offenseCategories) {
            if (dataTypes[category] > 0) {
              const response = await fetch(`/data/${category}.csv`);
              const text = await response.text();
              textDict[category] = text;
            }
          }

          for (const category of recommendedCategories) {
            if (recommendedDataTypes[category] > 0) {
              const response = await fetch(`/data/${category}.csv`);
              const text = await response.text();
              recommendedDict[category] = text;
            }
          }
          return [textDict, recommendedDict];
      } catch (error) {
          console.error("Error loading CSV:", error);
          return null;
      }
    };

    fetchData().then(res => {
      const [textDict, recommendedDict] = res; 

      if (!textDict || !recommendedDict) return; 

      if (mapContainer.current) {
        mapboxgl.accessToken = "pk.eyJ1IjoibGl1a2FpbHkiLCJhIjoiY2x1ajFpNHZxMGIwYzJrbno1Yjh3MW42MiJ9.xbXOekv11HSOizwSEzxhcQ";

        const map = new mapboxgl.Map({
          container: mapContainer.current,
          style: "mapbox://styles/mapbox/dark-v10",
          center: [-75.15, 39.955], // Philadelphia coordinates
          zoom: 12,
          maxZoom: 14, 
          minZoom: 11,
        });

        map.on("style.load", () => {
          // Create map for each offense category
          for (const category in textDict) {
            if (textDict.hasOwnProperty(category)) {
                const data = d3.csvParse(textDict[category]);

                let opacity = 0.1; 
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
                map.addSource(`${category}-heatmap-data`, {
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
                map.addLayer({
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
                    // "heatmap-opacity": 0.2 // Increase opacity for better visibility
                    "heatmap-opacity": opacity,
                  }
                });
            }
          }
          // Create map for each recommended category
          for (const category in recommendedDict) {
            if (recommendedDict.hasOwnProperty(category)) {
              const data = d3.csvParse(recommendedDict[category]);
              
              // Convert CSV data to dotData array
              const dotData = data.map(row => ({
                lng: parseFloat(row.lng),
                lat: parseFloat(row.lat),
                weight: recommendedDataTypes[category], // Set weight based on the offense category
                description: category.split("_") // Description from your CSV data
              }));

              // Add dot source
              map.addSource(`${category}-dot-data`, {
                type: "geojson",
                data: {
                  type: "FeatureCollection",
                  features: dotData.map(point => ({
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

              // Add dot layer
              map.addLayer({
                id: `${category}-dot-layer`,
                type: "circle",
                source: `${category}-dot-data`,
                paint: {
                  // Adjust the circle radius to a smaller value
                  "circle-radius": ["interpolate", ["linear"], ["zoom"], 0, 0.8, 10, 3],
                  // Color ramp for dot (yellow-orange)
                  "circle-color": [
                    "interpolate",
                    ["linear"],
                    ["get", "weight"], // Use the "weight" property for color interpolation
                    0,
                    "rgba(255, 255, 0, 0.7)",
                    1,
                    "rgba(255, 165, 0, 0.7)"
                  ],
                  // Adjust the circle opacity by zoom level
                  "circle-opacity": 1,
                  // Set circle border color to white
                  "circle-stroke-color": "#ffffff",
                  // Set circle border width to 0
                  "circle-stroke-width": 1
                }
              });
            }
          }
        })
      }
    });
  }, []);

  return (
    <div
      ref={mapContainer}
      style={{ position: "absolute", top: 0, bottom: 0, left: -10, width: "110%" }}
    />
  );
};

export default Home;