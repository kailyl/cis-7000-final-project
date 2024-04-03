import React from 'react';
import Head from 'next/head';
import Home from '../components/home';

const IndexPage: React.FC = () => {
  return (
    <div>
      <Head>
        <title>CIS 7000 Final Project</title>
        <meta name="description" content="Visualizing Philadelphia's Predictive Algorithms: Unveiling Bias and Disparities" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inconsolata:wght@400;700&display=swap" />
        <link rel="shortcut icon" href="/favicon/favicon.ico" />
      </Head>
      <Home />
    </div>
  );
};

export default IndexPage;