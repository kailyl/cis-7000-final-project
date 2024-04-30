import React, { useState } from 'react';
import Head from 'next/head';
import Map from '../components/map';
import Sidebar from '../components/sidebar';
import Description from '../components/description';

const IndexPage: React.FC = () => {

  const [isSchoolsChecked, setSchoolsChecked] = useState(false);
  const [isSubwaysChecked, setSubwaysChecked] = useState(false);
  const [isHospitalsChecked, setHospitalsChecked] = useState(false);

  const [eventName, setEventName] = useState('');
  const [neighborhoodName, setNeighborhoodName] = useState('');

  return (
    <>
      <Head>
        <title>CIS 7000 Final Project</title>
        <meta name="description" content="Visualizing Philadelphia's Predictive Algorithms: Unveiling Bias and Disparities" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inconsolata:wght@400;700&display=swap" />
        <link rel="shortcut icon" href="/favicon/favicon.ico" />
      </Head>
      <div style={{ position: "absolute", left: 0, top: 0, zIndex: 2 }}>
        <Description 
          neighborhoodName={neighborhoodName}
        />
      </div>
      <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
        <div style={{ flex: '7 1 0%', zIndex: 1 }}>
          <Map 
            isSchoolsChecked={isSchoolsChecked} 
            isSubwaysChecked={isSubwaysChecked}
            isHospitalsChecked={isHospitalsChecked}
            eventName={eventName}
            setEventName={setEventName}
            setNeighborhoodName={setNeighborhoodName}
          />
        </div>
        <div style={{ flex: '3 1 0%', zIndex: 1 }}>
          <Sidebar 
            onSchoolsChecked={setSchoolsChecked}
            isSchoolsChecked={isSchoolsChecked} 
            onSubwaysChecked={setSubwaysChecked}
            isSubwaysChecked={isSubwaysChecked}
            onHospitalsChecked={setHospitalsChecked}
            isHospitalsChecked={isHospitalsChecked}
            onEventChanged={setEventName}
            eventName={eventName}
          />
        </div>
      </div>
    </>
  );
};

export default IndexPage;