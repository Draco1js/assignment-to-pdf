import React, { useState } from 'react';
import styled from 'styled-components';
import { Header, Markdown } from './Components';
import { Provider } from 'nonaction';
import { TextContainer } from './Container';

const MobileBanner = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ff5252;
  color: white;
  padding: 20px;
  text-align: center;
  z-index: 1000;
  font-weight: bold;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 1.5rem;
  display: none; /* Hidden by default on all devices */
  
  @media (max-width: 480px) {
    display: ${props => props.visible ? 'flex' : 'none'};
  }
  
  button {
    position: absolute;
    right: 15px;
    top: 15px;
    background: none;
    border: 2px solid white;
    border-radius: 50%;
    color: white;
    font-size: 24px;
    width: 40px;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }
`;

const App = ({ className }) => {
  const [showMobileBanner, setShowMobileBanner] = useState(true);
  
  const closeBanner = () => {
    setShowMobileBanner(false);
  };
  
  return (
    <div className={className} id="md2pdf-app">
      <MobileBanner visible={showMobileBanner}>
        This site isn't optimized for mobile devices. Please use a desktop for the best experience.
        <button onClick={closeBanner}>×</button>
      </MobileBanner>
      <Provider inject={[TextContainer]}>
        <Header />
        <Markdown />
      </Provider>
    </div>
  );
};

export default styled(App)`
  height: 100%;
  display: flex;
  flex-direction: column;
  font-family: 微軟正黑體, sans-serif;
  @media print {
    &,
    div {
      display: block;
      height: auto;
      /* Reset to normalize for FireFox */
    }
    .no-print,
    .no-print * {
      display: none !important;
    }
    
    /* Ensure backgrounds are printed */
    * {
      -webkit-print-color-adjust: exact !important;
      color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
  }
`;
