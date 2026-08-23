import type {
  Collection,
  CollectionUnit,
  Datasheet,
  DatasheetRef,
  Detachment,
  DetachmentRef,
  Enhancement,
  EnhancementRef,
  Roster,
  RosterUnit,
  StoredCollection,
  StoredRoster,
  StoredUnit
} from '../types/depot.js';

/**
 * Saves keep ids, selections and points only — the catalog data is rehydrated
 * from local game data on load (see `rebind`). Legacy saves that embed a full
 * datasheet stay readable, so both shapes flow through the same load path.
 */
const toStoredUnit = <T extends RosterUnit | CollectionUnit>(unit: T): StoredUnit => ({
  id: unit.id,
  datasheet: {
    id: unit.datasheet.id,
    slug: unit.datasheet.slug,
    name: unit.datasheet.name,
    factionSlug: unit.datasheet.factionSlug
  },
  datasheetSlug: unit.datasheetSlug ?? unit.datasheet.slug,
  modelCost: unit.modelCost,
  selectedWargear: unit.selectedWargear.map(({ id, name }) => ({ id, name })),
  selectedWargearAbilities: (unit.selectedWargearAbilities ?? []).map(
    ({ id, name, type, parameter }) => ({ id, name, type, parameter })
  )
});

const toDetachmentRef = ({ id, slug, name }: Detachment | DetachmentRef): DetachmentRef => ({
  id,
  slug,
  name
});

const toEnhancementRef = ({
  id,
  name,
  cost,
  detachment
}: Enhancement | EnhancementRef): EnhancementRef => ({ id, name, cost, detachment });

export const toStoredRoster = (roster: Roster): StoredRoster => {
  const { detachment: _legacyDetachment, ...rest } = roster;
  return {
    ...rest,
    detachments: roster.detachments.map(toDetachmentRef),
    units: roster.units.map(toStoredUnit),
    enhancements: roster.enhancements.map(({ enhancement, unitId }) => ({
      enhancement: toEnhancementRef(enhancement),
      unitId
    }))
  };
};

export const toStoredCollection = (collection: Collection): StoredCollection => ({
  ...collection,
  items: collection.items.map((item) => ({ ...toStoredUnit(item), state: item.state }))
});

/** Stand-in for a datasheet the local catalog no longer has; keeps the UI renderable. */
export const placeholderDatasheet = (ref: DatasheetRef): Datasheet => ({
  ...ref,
  factionId: '',
  sourceId: '',
  legend: '',
  isSupport: false,
  loadout: '',
  transport: '',
  virtual: false,
  leaderHead: '',
  leaderFooter: '',
  damagedW: '',
  damagedDescription: '',
  link: '',
  abilities: [],
  keywords: [],
  models: [],
  options: [],
  wargear: [],
  unitComposition: [],
  modelCosts: [],
  stratagemIds: [],
  leaders: [],
  isForgeWorld: false,
  isLegends: false
});

/** Stand-in for a detachment the local catalog no longer has. */
export const placeholderDetachment = (ref: DetachmentRef): Detachment => ({
  ...ref,
  legend: '',
  type: '',
  dp: '',
  forceDisposition: '',
  chapterDp: [],
  abilities: [],
  enhancements: [],
  stratagems: []
});

/** A saved datasheet is either a full (legacy) one or just its identity. */
export const isFullDatasheet = (datasheet: DatasheetRef | Datasheet): datasheet is Datasheet =>
  Array.isArray((datasheet as Datasheet).modelCosts);
