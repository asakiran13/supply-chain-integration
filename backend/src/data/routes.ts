import { ShippingRoute } from '../types/index.js';

export const shippingRoutes: ShippingRoute[] = [
  {
    id: 'suez-canal',
    name: 'Suez Canal',
    description: 'Primary Europe–Asia route via Red Sea and Suez Canal. Fastest between Mediterranean and Indian Ocean.',
    corridor: ['europe', 'asia', 'middle-east'],
    alternatives: ['cape-of-good-hope'],
    base_cost_per_teu: 1200,
    transit_days: 25,
    center: [32.5, 29.9],
    waypoints: [
      [14.5, 40.8],   // Strait of Messina (Med entry)
      [20.0, 36.0],   // Central Mediterranean
      [25.0, 33.5],   // Eastern Mediterranean
      [32.5, 29.9],   // Suez Canal (Port Said)
      [33.0, 27.0],   // Red Sea North
      [37.0, 20.0],   // Red Sea Mid
      [43.5, 12.5],   // Bab el-Mandeb Strait
      [50.6, 11.8],   // Gulf of Aden
      [58.0, 14.0],   // Arabian Sea West
      [63.0, 20.0],   // Arabian Sea
      [72.0, 18.5],   // Indian Ocean West
    ],
  },
  {
    id: 'cape-of-good-hope',
    name: 'Cape of Good Hope',
    description: 'Alternative Europe–Asia route circumnavigating Africa. Longer but avoids Suez and Hormuz chokepoints.',
    corridor: ['europe', 'asia', 'africa'],
    alternatives: ['suez-canal'],
    base_cost_per_teu: 1800,
    transit_days: 35,
    center: [18.5, -34.2],
    waypoints: [
      [14.5, 40.8],   // Strait of Messina
      [5.0, 35.5],    // West Mediterranean
      [-5.6, 36.0],   // Strait of Gibraltar
      [-10.0, 30.0],  // Atlantic off Morocco
      [-15.0, 20.0],  // Atlantic off West Africa
      [-17.0, 5.0],   // Gulf of Guinea approach
      [5.0, -5.0],    // Gulf of Guinea
      [10.0, -20.0],  // South Atlantic
      [15.0, -30.0],  // Approaching Cape
      [18.5, -34.2],  // Cape of Good Hope
      [25.0, -35.0],  // South of Africa
      [35.0, -30.0],  // Indian Ocean South
      [45.0, -20.0],  // Indian Ocean mid
      [55.0, -15.0],  // Mozambique Channel area
      [63.0, -10.0],  // Indian Ocean NW
      [72.0, 18.5],   // Indian Ocean West
    ],
  },
  {
    id: 'panama-canal',
    name: 'Panama Canal',
    description: 'Primary Atlantic–Pacific route through Central America. Critical for US East Coast to Asia trade.',
    corridor: ['americas', 'asia', 'pacific'],
    alternatives: [],
    base_cost_per_teu: 1500,
    transit_days: 20,
    center: [-79.9, 9.0],
    waypoints: [
      [-74.0, 40.7],  // New York
      [-76.0, 37.0],  // US East Coast
      [-78.0, 30.0],  // Florida approach
      [-80.0, 22.0],  // Caribbean
      [-80.0, 15.0],  // Caribbean South
      [-79.9, 9.0],   // Panama Canal
      [-80.5, 5.0],   // Pacific entry
      [-84.0, 8.0],   // Pacific off Costa Rica
      [-90.0, 12.0],  // Pacific Central America
      [-100.0, 18.0], // Pacific Mexico
      [-110.0, 22.0], // Pacific open
      [-120.0, 30.0], // Pacific mid
      [-130.0, 36.0], // Pacific NE
      [-140.0, 40.0], // Pacific mid North
      [-150.0, 38.0], // Pacific approach Japan
      [135.0, 34.0],  // Japan / Korea
    ],
  },
  {
    id: 'strait-of-hormuz',
    name: 'Strait of Hormuz',
    description: 'Critical chokepoint for Persian Gulf energy and cargo routes. Connects Gulf producers to Indian Ocean.',
    corridor: ['middle-east', 'asia', 'indian-ocean'],
    alternatives: [],
    base_cost_per_teu: 900,
    transit_days: 10,
    center: [56.5, 26.6],
    waypoints: [
      [50.6, 26.3],   // Bahrain / Qatar
      [53.0, 26.5],   // UAE Coast
      [55.0, 25.8],   // Dubai approach
      [56.5, 26.6],   // Strait of Hormuz
      [58.0, 23.0],   // Gulf of Oman
      [60.0, 21.0],   // Arabian Sea entry
      [63.0, 20.0],   // Arabian Sea
      [65.0, 15.0],   // Arabian Sea South
      [70.0, 12.0],   // Indian Ocean approach
    ],
  },
];

export const MAJOR_PORTS: { name: string; code: string; coordinates: [number, number]; routes: string[] }[] = [
  { name: 'Shanghai, China', code: 'SHA', coordinates: [121.5, 31.2], routes: ['suez-canal', 'panama-canal', 'cape-of-good-hope'] },
  { name: 'Rotterdam, Netherlands', code: 'RTM', coordinates: [4.5, 51.9], routes: ['suez-canal', 'cape-of-good-hope'] },
  { name: 'Singapore', code: 'SIN', coordinates: [103.8, 1.3], routes: ['suez-canal', 'strait-of-hormuz'] },
  { name: 'Dubai, UAE', code: 'DXB', coordinates: [55.3, 25.2], routes: ['strait-of-hormuz', 'suez-canal'] },
  { name: 'Los Angeles, USA', code: 'LAX', coordinates: [-118.2, 33.7], routes: ['panama-canal'] },
  { name: 'New York, USA', code: 'NYC', coordinates: [-74.0, 40.7], routes: ['panama-canal', 'suez-canal', 'cape-of-good-hope'] },
  { name: 'Houston, USA', code: 'HOU', coordinates: [-95.4, 29.7], routes: ['panama-canal'] },
  { name: 'Mumbai, India', code: 'MUM', coordinates: [72.8, 18.9], routes: ['suez-canal', 'strait-of-hormuz', 'cape-of-good-hope'] },
  { name: 'Busan, South Korea', code: 'BUS', coordinates: [129.0, 35.1], routes: ['suez-canal', 'panama-canal'] },
  { name: 'Hamburg, Germany', code: 'HAM', coordinates: [9.9, 53.5], routes: ['suez-canal', 'cape-of-good-hope'] },
  { name: 'Cape Town, South Africa', code: 'CPT', coordinates: [18.4, -33.9], routes: ['cape-of-good-hope'] },
  { name: 'Colombo, Sri Lanka', code: 'CMB', coordinates: [79.9, 6.9], routes: ['suez-canal', 'strait-of-hormuz'] },
];
