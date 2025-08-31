import React, { createContext, useReducer, useEffect } from 'react';
import { AppContextType } from './types';
import { appReducer, initialState } from './reducer';
import { APP_ACTIONS } from './constants';

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load faction data
  const loadFaction = async (id: string) => {
    if (state.factionCache[id]) {
      return; // Already cached
    }

    dispatch({ type: APP_ACTIONS.LOAD_FACTION_START, payload: id });

    try {
      const response = await fetch(`/data/${id}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load faction ${id}`);
      }
      const faction = await response.json();
      dispatch({ type: APP_ACTIONS.LOAD_FACTION_SUCCESS, payload: { id, faction } });
    } catch (error) {
      dispatch({
        type: APP_ACTIONS.LOAD_FACTION_ERROR,
        payload: { id, error: error instanceof Error ? error.message : 'Unknown error' }
      });
    }
  };

  // Load faction index on mount
  useEffect(() => {
    const loadIndex = async () => {
      dispatch({ type: APP_ACTIONS.LOAD_INDEX_START });

      try {
        const response = await fetch('/data/index.json');
        if (!response.ok) {
          throw new Error('Failed to load faction index');
        }
        const index = await response.json();
        dispatch({ type: APP_ACTIONS.LOAD_INDEX_SUCCESS, payload: index });
      } catch (error) {
        dispatch({
          type: APP_ACTIONS.LOAD_INDEX_ERROR,
          payload: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    };

    loadIndex();
  }, []);

  const contextValue: AppContextType = {
    state,
    dispatch,
    loadFaction
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

export default AppContext;
