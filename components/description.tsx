import React, { useState } from 'react';
import styles from '../styles/Description.module.css';
import * as d3 from "d3";

interface DescriptionProps {
    neighborhoodName: string;
}

const Description: React.FC<DescriptionProps> = ({ 
    neighborhoodName
}) => {

    const [neighborhoodData, setNeighborhoodData] = useState({})
    const [majority, setMajority] = useState({})

    const fetchData = async() => {
        try {
            const response = await fetch(`/data/census_data.csv`);
            const text = await response.text();
            const data = d3.csvParse(text);
            return data
        } catch (error) {
            console.error("Error loading CSV:", error);
            return null;
        }
    };

    fetchData().then(res => {
        const dict = {}
        const maxDemographic = {};
        res.forEach(row => {
            const neighborhood = row.neighborhood.trim();
            dict[neighborhood] = {
                asian: parseFloat(row.asian), 
                black: parseFloat(row.black), 
                hispanic: parseFloat(row.hispanic), 
                white: parseFloat(row.white), 
                other: parseFloat(row.other), 
                income: row.income.trim()
            };

            Object.keys(dict).forEach(neighborhood => {
                let maxPercentage = 0;
                let maxDemographicType = '';
            
                Object.keys(dict[neighborhood]).forEach(demographic => {
                    if (dict[neighborhood][demographic] > maxPercentage) {
                        maxPercentage = dict[neighborhood][demographic];
                        maxDemographicType = demographic;
                    }
                });
            
                maxDemographic[neighborhood] = maxDemographicType;
            });
        });
        setNeighborhoodData(dict);
        setMajority(maxDemographic);
    });

    return (
        neighborhoodName !== "" && !isNaN(neighborhoodData[neighborhoodName]?.white) ? 
        <div className={styles.body}>
            <p className={styles.heading}>{neighborhoodName}</p>
            <div className={styles.demographics}>
                {
                    majority[neighborhoodName] === 'white' ? 
                    <li className={styles.highlighted}> White: {neighborhoodData[neighborhoodName]?.white}% </li> :
                    <li className={styles.bulletPoint}> White: {neighborhoodData[neighborhoodName]?.white}% </li>
                }
                {
                    majority[neighborhoodName] === 'black' ? 
                    <li className={styles.highlighted}> Black: {neighborhoodData[neighborhoodName]?.black}% </li> :
                    <li className={styles.bulletPoint}> Black: {neighborhoodData[neighborhoodName]?.black}% </li>
                }
                {
                    majority[neighborhoodName] === 'hispanic' ? 
                    <li className={styles.highlighted}> Hispanic: {neighborhoodData[neighborhoodName]?.hispanic}% </li> :
                    <li className={styles.bulletPoint}> Hispanic: {neighborhoodData[neighborhoodName]?.hispanic}% </li>
                }
                {
                    majority[neighborhoodName] === 'asian' ? 
                    <li className={styles.highlighted}> Asian: {neighborhoodData[neighborhoodName]?.asian}% </li> :
                    <li className={styles.bulletPoint}> Asian: {neighborhoodData[neighborhoodName]?.asian}% </li>
                }
                {
                    majority[neighborhoodName] === 'other' ? 
                    <li className={styles.highlighted}> Other: {neighborhoodData[neighborhoodName]?.other}% </li> :
                    <li className={styles.bulletPoint}> Other: {neighborhoodData[neighborhoodName]?.other}% </li>
                }
                <p className={styles.income}> Average income: {neighborhoodData[neighborhoodName]?.income} </p>
            </div>
        </div>
        :
        neighborhoodName !== "" && isNaN(neighborhoodData[neighborhoodName]?.white) ? 
        <div className={styles.body}>
            <p className={styles.heading}>{neighborhoodName}</p>
            <div className={styles.demographics}>
                <p> Data is unavailable for this neighborhood :( </p>
            </div>
        </div>
        :
        <div/>
    );
};

export default Description;