import React from "react";
import Markdown from "react-remarkable";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark.css"; // Dark theme import
import styled from "styled-components";

// Configure highlight.js with the dark theme
const highlight = (str, lang) => {
  if (lang && hljs.getLanguage(lang)) {
    try {
      return hljs.highlight(str, {language: lang}).value;
    } catch (err) {
      console.error(err);
    }
  }

  try {
    return hljs.highlightAuto(str).value;
  } catch (err) {
    console.error(err);
  }

  return "";
};

const StyledMarkdown = styled(Markdown)`
  pre {
    background-color: #282c34 !important; /* Dark background for code blocks */
    border-radius: 4px;
    padding: 16px;
    margin-bottom: 16px;
    -webkit-print-color-adjust: exact !important; /* Chrome/Safari */
    color-adjust: exact !important; /* Firefox */
    print-color-adjust: exact !important; /* Future standard */
  }
  
  code {
    background-color: #282c34 !important; /* Dark background for inline code */
    color: #abb2bf !important; /* Light text color for better contrast */
    padding: 2px 4px;
    border-radius: 3px;
    -webkit-print-color-adjust: exact !important;
    color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  
  pre code {
    display: block;
    overflow-x: auto;
    padding: 0 !important;
    background-color: transparent !important;
  }
  
  /* Override github-markdown-css styles */
  .markdown-body pre {
    background-color: #282c34 !important;
    -webkit-print-color-adjust: exact !important;
    color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  
  .markdown-body code {
    background-color: #282c34 !important;
    color: #abb2bf !important;
    -webkit-print-color-adjust: exact !important;
    color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  
  @media print {
    pre, code, .markdown-body pre, .markdown-body code {
      background-color: #282c34 !important;
      -webkit-print-color-adjust: exact !important;
      color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
  }
`;

export default ({ source, children }) => {
  return (
    <StyledMarkdown
      source={source}
      options={{ highlight, html: true, linkify: true }}
    >
      {children}
    </StyledMarkdown>
  );
};
