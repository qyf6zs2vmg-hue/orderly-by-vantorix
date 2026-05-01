import React from 'react';

export default function AnimatedSearch() {
  return (
    <div className="search-poda rounded-xl flex-shrink-0">
      <div className="search-glow"></div>
      <div className="search-darkBorderBg"></div>
      <div className="search-darkBorderBg"></div>
      <div className="search-darkBorderBg"></div>

      <div className="search-white"></div>
      <div className="search-border"></div>

      <div id="search-main">
        <input id="search-input-search" placeholder="Search anything..." type="text" />
        <div id="search-input-mask"></div>
        <div id="search-mask-color"></div>
        <div className="search-filterBorder"></div>
        <div id="search-filter-icon">
          <svg
            preserveAspectRatio="none"
            height="27"
            width="27"
            viewBox="4.8 4.56 14.832 15.408"
            fill="none"
          >
            <path
              d="M8.16 6.65002H15.83C16.47 6.65002 16.99 7.17002 16.99 7.81002V9.09002C16.99 9.56002 16.7 10.14 16.41 10.43L13.91 12.64C13.56 12.93 13.33 13.51 13.33 13.98V16.48C13.33 16.83 13.1 17.29 12.81 17.47L12 17.98C11.24 18.45 10.2 17.92 10.2 16.99V13.91C10.2 13.5 9.97 12.98 9.73 12.69L7.52 10.36C7.23 10.08 7 9.55002 7 9.20002V7.87002C7 7.17002 7.52 6.65002 8.16 6.65002Z"
              stroke="#A8A39D"
              strokeWidth="1"
              strokeMiterlimit="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
          </svg>
        </div>
        <div id="search-icon-svg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            viewBox="0 0 24 24"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
            height="20"
            fill="none"
            className="feather feather-search"
          >
            <circle stroke="url(#search-brown)" r="8" cy="11" cx="11"></circle>
            <line
              stroke="url(#searchl-brown)"
              y2="16.65"
              y1="22"
              x2="16.65"
              x1="22"
            ></line>
            <defs>
              <linearGradient gradientTransform="rotate(50)" id="search-brown">
                <stop stopColor="#DBCBB9" offset="0%"></stop>
                <stop stopColor="#8B5E3C" offset="50%"></stop>
              </linearGradient>
              <linearGradient id="searchl-brown">
                <stop stopColor="#8B5E3C" offset="0%"></stop>
                <stop stopColor="#5A3E2B" offset="50%"></stop>
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  );
}
