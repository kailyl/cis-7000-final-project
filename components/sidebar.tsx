import React, { useState } from 'react';
import styles from '../styles/Sidebar.module.css';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { FormControl, MenuItem, Select, OutlinedInput } from '@mui/material';


interface SidebarProps {
    onSchoolsChecked: (checked: boolean) => void;
    isSchoolsChecked: boolean;
    onSubwaysChecked: (checked: boolean) => void;
    isSubwaysChecked: boolean;
    onHospitalsChecked: (checked: boolean) => void;
    isHospitalsChecked: boolean;
    onEventChanged: (value: string) => void;
    eventName: String;
}

const Sidebar: React.FC<SidebarProps> = ({ 
    onSchoolsChecked, 
    isSchoolsChecked, 
    onSubwaysChecked, 
    isSubwaysChecked, 
    onHospitalsChecked, 
    isHospitalsChecked, 
    onEventChanged, 
    eventName
}) => {

    const handleSchoolsChecked = (event: React.ChangeEvent<HTMLInputElement>) => {
        onSchoolsChecked(event.target.checked);
    };

    const handleSubwaysChecked = (event: React.ChangeEvent<HTMLInputElement>) => {
        onSubwaysChecked(event.target.checked);
    };

    const handleHospitalsChecked = (event: React.ChangeEvent<HTMLInputElement>) => {
        onHospitalsChecked(event.target.checked);
    };

    const handleEventChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onEventChanged(event.target.value);
    };  

    const names = [
        'Priority 1: Immediate Threat to Life',
        'Priority 1 and 2: Immediate Response with Risk of Property Loss',
        'All Priorities: Immediate Response with Varying Degrees of Risk',
    ];

    return (
        <div className={styles.body}>
            <p className={styles.heading}>
                Visualizing Philadelphia's Predictive <br />
                Policing Algorithms
            </p>
            <p className={styles.subheading}>
                HunchLab Pseudo-Clone
            </p>
            <p className={styles.description}>
                Despite well-documented biases and persistent public concern, 
                predictive policing algorithms continue to be employed by law 
                enforcement agencies, including in the city of Philadelphia. 
                However, there exists a lack of transparency regarding the 
                factors considered by these algorithms and the information they 
                provide to law enforcement officers. <br />
                <br />
                In response to these concerns, this project aims to bridge the 
                gap between predictive policing algorithms and public 
                understanding by creating a publicly accessible website. 
                Leveraging existing research and publicly disclosed records on 
                predictive policing from precincts across the country, the website 
                will provide insightful visualizations that illustrate the inner 
                workings of predictive policing algorithms as they pertain to 
                Philadelphia. <br />
                <br />
                Data for this website was collected from {" "}
                <a 
                    href="https://opendataphilly.org/" 
                    className={styles.hyperlink}
                    style={{
                        color: "white"
                    }}
                >
                    OpenDataPhilly
                </a>
                , including the crime incident datasets from 2018 - 2023.
            </p>

            <p className={styles.subheading2}>
                Include information from: 
            </p>

            <div style={{ marginLeft: -10 }}>
                <FormControl sx={{ m: 1, width: "99%" }}>
                    <Select
                    value={eventName}
                    onChange={handleEventChange}
                    input={<OutlinedInput />}
                    displayEmpty
                    renderValue={(selected) => selected || 'Priority 1: Immediate Threat to Life'}
                    sx={{ 
                        backgroundColor: '#1F1F1F',
                        '& .MuiSelect-select': {
                            fontSize: '0.76em',
                        },
                        height: 30,
                        fontFamily: 'Inconsolata, serif',
                        color: "white",
                        '.MuiOutlinedInput-notchedOutline': {
                        borderColor: '#A8A8A8',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#A8A8A8',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#A8A8A8',
                        },
                        '.MuiSvgIcon-root ': {
                        fill: "white !important",
                        }
                     }}
                    >
                    {names.map((name) => (
                        <MenuItem key={name} value={name} sx={{ fontSize: '0.82em', fontFamily: 'Inconsolata, serif' }}>
                        {name}
                        </MenuItem>
                    ))}
                    </Select>
                </FormControl>
            </div>

            <div>
                <FormControlLabel 
                    control={
                        <Checkbox 
                            sx={{ color: '#A8A8A8', fontSize: '0.8em', height: 25 }}
                            checked={isSchoolsChecked}
                            onChange={handleSchoolsChecked}
                        />
                    }
                    label={<span className={styles.checkbox}>{"Public Schools"}</span>}
                    sx={{ 
                        color: 'white',
                        display: 'block',
                        width: "99%"
                    }}
                />
                <FormControlLabel 
                    control={
                        <Checkbox 
                            sx={{ color: '#A8A8A8', fontSize: '0.8em', height: 25 }} 
                            checked={isSubwaysChecked}
                            onChange={handleSubwaysChecked}
                        />
                    }
                    label={<span className={styles.checkbox}>{"Subways"}</span>}
                    sx={{ 
                        color: 'white',
                        display: 'block',
                        width: "99%"
                    }}
                />
                <FormControlLabel 
                    control={
                        <Checkbox 
                            sx={{ color: '#A8A8A8', fontSize: '0.8em', height: 25 }} 
                            checked={isHospitalsChecked}
                            onChange={handleHospitalsChecked}
                        />
                    }
                    label={<span className={styles.checkbox}>{"Hospitals"}</span>}
                    sx={{ 
                        color: 'white',
                        display: 'block',
                        width: "99%"
                    }}
                />
            </div>
        </div>
    );
};

export default Sidebar;