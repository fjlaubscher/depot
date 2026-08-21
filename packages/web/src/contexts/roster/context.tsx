import type { FC, ReactNode } from 'react';
import { createContext, useContext, useReducer, useEffect, useMemo, useRef } from 'react';
import { offlineStorage } from '@/data/offline-storage';
import { useToast } from '@/contexts/toast/context';
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

  // `dispatch` is stable, so the action set is created once.
  const actions = useMemo<Omit<RosterContextValue, 'state'>>(
    () => ({
      createRoster: (payload) => {
        const id = crypto.randomUUID();
        dispatch({ type: 'CREATE_ROSTER', payload: { ...payload, id } });
        return id;
      },
      updateRosterDetails: (payload) => dispatch({ type: 'UPDATE_DETAILS', payload }),
      setRoster: (payload) => dispatch({ type: 'SET_ROSTER', payload }),
      addUnit: (datasheet, modelCost) =>
        dispatch({ type: 'ADD_UNIT', payload: { datasheet, modelCost } }),
      duplicateUnit: (unit) => dispatch({ type: 'DUPLICATE_UNIT', payload: { unit } }),
      removeUnit: (rosterUnitId) => dispatch({ type: 'REMOVE_UNIT', payload: { rosterUnitId } }),
      updateUnitWargear: (rosterUnitId, wargear) =>
        dispatch({ type: 'UPDATE_UNIT_WARGEAR', payload: { rosterUnitId, wargear } }),
      updateUnitWargearAbilities: (rosterUnitId, abilities) =>
        dispatch({ type: 'UPDATE_UNIT_WARGEAR_ABILITIES', payload: { rosterUnitId, abilities } }),
      updateUnitModelCost: (rosterUnitId, modelCost) =>
        dispatch({ type: 'UPDATE_UNIT_MODEL_COST', payload: { rosterUnitId, modelCost } }),
      applyEnhancement: (enhancement, targetUnitId) =>
        dispatch({ type: 'APPLY_ENHANCEMENT', payload: { enhancement, targetUnitId } }),
      removeEnhancement: (enhancementId) =>
        dispatch({ type: 'REMOVE_ENHANCEMENT', payload: { enhancementId } }),
      setWarlord: (unitId) => dispatch({ type: 'SET_WARLORD', payload: { unitId } })
    }),
    []
  );

  return <RosterContext.Provider value={{ state, ...actions }}>{children}</RosterContext.Provider>;
};

export const useRoster = (): RosterContextValue => {
  const context = useContext(RosterContext);
  if (!context) {
    throw new Error('useRoster must be used within a RosterProvider');
  }
  return context;
};
