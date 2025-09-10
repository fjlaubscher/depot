import React, { createContext, useReducer, ReactNode, useCallback, useEffect } from 'react';
import { depot } from '@depot/core';
import { offlineStorage } from '@/data/offline-storage';
import { RosterState, RosterContextValue } from './types';
import { rosterReducer } from './reducer';
import { initialState } from './constants';

export const RosterContext = createContext<RosterContextValue | undefined>(undefined);

interface RosterProviderProps {
  children: ReactNode;
  rosterId?: string;
}

export const RosterProvider: React.FC<RosterProviderProps> = ({ children, rosterId }) => {
  const [state, dispatch] = useReducer(rosterReducer, initialState);

  // Load roster on mount if rosterId is provided
  useEffect(() => {
    if (rosterId) {
      const loadRoster = async () => {
        const roster = await offlineStorage.getRoster(rosterId);
        if (roster) {
          dispatch({ type: 'SET_ROSTER', payload: roster });
        }
      };
      loadRoster();
    }
  }, [rosterId]);

  // Auto-save roster on state change
  useEffect(() => {
    // Don't save the initial empty state
    if (state.id) {
      offlineStorage.saveRoster(state);
    }
  }, [state]);

  const createRoster = useCallback(
    (payload: { factionId: string; maxPoints: number; name: string }): string => {
      const newId = crypto.randomUUID();
      dispatch({ type: 'CREATE_ROSTER', payload: { ...payload, id: newId } });
      return newId;
    },
    []
  );

  return (
    <RosterContext.Provider value={{ state, createRoster }}>{children}</RosterContext.Provider>
  );
};
