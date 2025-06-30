'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { SuumoProperty } from '../utils/suumoApi';
import { IntersectionArea } from '../utils/intersectionUtils';
import { RequirementCircle } from '../utils/placesApi';

export interface CircleData {
  id: string;
  center: { lat: number; lng: number };
  radius: number;
  color: string;
  colorIndex: number;
  circle?: google.maps.Circle;
  marker?: google.maps.Marker;
  requirementId?: string;
  placeName?: string;
  address?: string;
  rating?: number;
  requirement?: string;
}

export interface SearchFilters {
  priceRange: {
    min?: number;
    max?: number;
  };
  roomTypes: string[];
  searchRadius: number;
  facilities: string[];
}

export interface SearchState {
  circles: CircleData[];
  intersections: IntersectionArea[];
  properties: SuumoProperty[];
  requirements: RequirementCircle[];
  filters: SearchFilters;
  loading: boolean;
  searchQuery: string;
}

type SearchAction =
  | { type: 'SET_CIRCLES'; payload: CircleData[] }
  | { type: 'ADD_CIRCLES'; payload: CircleData[] }
  | { type: 'SET_INTERSECTIONS'; payload: IntersectionArea[] }
  | { type: 'SET_PROPERTIES'; payload: SuumoProperty[] }
  | { type: 'SET_REQUIREMENTS'; payload: RequirementCircle[] }
  | { type: 'ADD_REQUIREMENT'; payload: RequirementCircle }
  | { type: 'SET_FILTERS'; payload: Partial<SearchFilters> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'CLEAR_ALL' };

const initialState: SearchState = {
  circles: [],
  intersections: [],
  properties: [],
  requirements: [],
  filters: {
    priceRange: {},
    roomTypes: [],
    searchRadius: 2.5,
    facilities: []
  },
  loading: false,
  searchQuery: ''
};

function searchReducer(state: SearchState, action: SearchAction): SearchState {
  switch (action.type) {
    case 'SET_CIRCLES':
      return { ...state, circles: action.payload };
    case 'ADD_CIRCLES':
      return { ...state, circles: [...state.circles, ...action.payload] };
    case 'SET_INTERSECTIONS':
      return { ...state, intersections: action.payload };
    case 'SET_PROPERTIES':
      return { ...state, properties: action.payload };
    case 'SET_REQUIREMENTS':
      return { ...state, requirements: action.payload };
    case 'ADD_REQUIREMENT':
      const exists = state.requirements.some(req => req.id === action.payload.id);
      if (exists) {
        return state;
      }
      return { ...state, requirements: [...state.requirements, action.payload] };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'CLEAR_ALL':
      return {
        ...initialState,
        filters: state.filters // 保留篩選條件
      };
    default:
      return state;
  }
}

interface SearchContextType {
  state: SearchState;
  dispatch: React.Dispatch<SearchAction>;
  actions: {
    setCircles: (circles: CircleData[]) => void;
    addCircles: (circles: CircleData[]) => void;
    setIntersections: (intersections: IntersectionArea[]) => void;
    setProperties: (properties: SuumoProperty[]) => void;
    setRequirements: (requirements: RequirementCircle[]) => void;
    addRequirement: (requirement: RequirementCircle) => void;
    setFilters: (filters: Partial<SearchFilters>) => void;
    setLoading: (loading: boolean) => void;
    setSearchQuery: (query: string) => void;
    clearAll: () => void;
  };
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(searchReducer, initialState);

  const actions = React.useMemo(() => ({
    setCircles: (circles: CircleData[]) => dispatch({ type: 'SET_CIRCLES', payload: circles }),
    addCircles: (circles: CircleData[]) => dispatch({ type: 'ADD_CIRCLES', payload: circles }),
    setIntersections: (intersections: IntersectionArea[]) => dispatch({ type: 'SET_INTERSECTIONS', payload: intersections }),
    setProperties: (properties: SuumoProperty[]) => dispatch({ type: 'SET_PROPERTIES', payload: properties }),
    setRequirements: (requirements: RequirementCircle[]) => dispatch({ type: 'SET_REQUIREMENTS', payload: requirements }),
    addRequirement: (requirement: RequirementCircle) => dispatch({ type: 'ADD_REQUIREMENT', payload: requirement }),
    setFilters: (filters: Partial<SearchFilters>) => dispatch({ type: 'SET_FILTERS', payload: filters }),
    setLoading: (loading: boolean) => dispatch({ type: 'SET_LOADING', payload: loading }),
    setSearchQuery: (query: string) => dispatch({ type: 'SET_SEARCH_QUERY', payload: query }),
    clearAll: () => dispatch({ type: 'CLEAR_ALL' })
  }), []);

  return (
    <SearchContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}