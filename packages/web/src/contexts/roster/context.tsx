import type { FC, ReactNode } from 'react';
import { createContext, useReducer, useCallback, useEffect, useRef } from 'react';
import type { depot } from '@depot/core';
import { offlineStorage } from '@/data/offline-storage';
import { useToast } from '@/contexts/toast/use-toast-context';
import type { RosterContextValue } from './types';
import { rosterReducer } from './reducer';
import { initialState } from './constants';

export const RosterContext = createContext<RosterContextValue | undefined>(undefined);

interface RosterProviderProps {
  children: ReactNode;
  rosterId?: string;
}

export const RosterProvider: FC<RosterProviderProps> = ({ children, rosterId }) => {
  const [state, dispatch] = useReducer(rosterReducer, initialState);
  const { showToast } = useToast();
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve()); // Serialise roster saves

  // Load roster on mount if rosterId is provided
  useEffect(() => {
    if (rosterId) {
      const loadRoster = async () => {
        try {
          const roster = await offlineStorage.getRoster(rosterId);
          if (roster) {
            dispatch({ type: 'SET_ROSTER', payload: roster });
          }
        } catch (err) {
          console.error('Failed to load roster:', err);
        }
      };
      loadRoster();
    }
  }, [rosterId]);

  // Auto-save roster on state change
  useEffect(() => {
    // Don't save the initial empty state
    if (state.id) {
      let isCancelled = false;

      const enqueueSave = async () => {
        const performSave = async () => {
          try {
            await offlineStorage.saveRoster(state);
          } catch (error) {
            console.error(`Failed to auto-save roster ${state.id}:`, error);
            if (!isCancelled) {
              showToast({
                type: 'error',
                title: 'Failed to save roster',
                message: 'Changes may not be saved. Please try again.'
              });
            }
          }
        };

        saveQueueRef.current = saveQueueRef.current.catch(() => undefined).then(performSave);
        await saveQueueRef.current;
      };

      void enqueueSave();

      return () => {
        isCancelled = true;
      };
    }
  }, [state, showToast]);

  const createRoster = useCallback(
    (payload: {
      factionId: string;
      factionSlug: string;
      faction: depot.Index;
      maxPoints: number;
      name: string;
      detachment: depot.Detachment;
    }): string => {
      const newId = crypto.randomUUID();
      dispatch({ type: 'CREATE_ROSTER', payload: { ...payload, id: newId } });
      return newId;
    },
    []
  );

  const setDetachment = useCallback((detachment: depot.Detachment): void => {
    dispatch({ type: 'SET_DETACHMENT', payload: detachment });
  }, []);

  const addUnit = useCallback((datasheet: depot.Datasheet, modelCost: depot.ModelCost): void => {
    dispatch({ type: 'ADD_UNIT', payload: { datasheet, modelCost } });
  }, []);

  const duplicateUnit = useCallback((unit: depot.RosterUnit): void => {
    dispatch({ type: 'DUPLICATE_UNIT', payload: { unit } });
  }, []);

  const removeUnit = useCallback((rosterUnitId: string): void => {
    dispatch({ type: 'REMOVE_UNIT', payload: { rosterUnitId } });
  }, []);

  const updateUnitWargear = useCallback((rosterUnitId: string, wargear: depot.Wargear[]): void => {
    dispatch({ type: 'UPDATE_UNIT_WARGEAR', payload: { rosterUnitId, wargear } });
  }, []);

  const updateUnitModelCost = useCallback(
    (rosterUnitId: string, modelCost: depot.ModelCost): void => {
      dispatch({ type: 'UPDATE_UNIT_MODEL_COST', payload: { rosterUnitId, modelCost } });
    },
    []
  );

  const applyEnhancement = useCallback(
    (enhancement: depot.Enhancement, targetUnitId: string): void => {
      dispatch({ type: 'APPLY_ENHANCEMENT', payload: { enhancement, targetUnitId } });
    },
    []
  );

  const removeEnhancement = useCallback((enhancementId: string): void => {
    dispatch({ type: 'REMOVE_ENHANCEMENT', payload: { enhancementId } });
  }, []);

  const setWarlord = useCallback((unitId: string | null): void => {
    dispatch({ type: 'SET_WARLORD', payload: { unitId } });
  }, []);

  const recalculatePoints = useCallback((): void => {
    dispatch({ type: 'RECALCULATE_POINTS' });
  }, []);

  return (
    <RosterContext.Provider
      value={{
        state,
        createRoster,
        setDetachment,
        addUnit,
        duplicateUnit,
        removeUnit,
        updateUnitWargear,
        updateUnitModelCost,
        applyEnhancement,
        removeEnhancement,
        setWarlord,
        recalculatePoints
      }}
    >
      {children}
    </RosterContext.Provider>
  );
};
