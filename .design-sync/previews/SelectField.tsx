import { SelectField } from '@depot/web';

const factionOptions = [
  { label: 'Adeptus Astartes', value: 'space-marines' },
  { label: 'Necrons', value: 'necrons' },
  { label: 'Aeldari', value: 'aeldari' },
  { label: 'T’au Empire', value: 'tau' }
];

export const Default = () => (
  <div style={{ maxWidth: 360 }}>
    <SelectField label="Faction" options={factionOptions} defaultValue="space-marines" />
  </div>
);

export const WithPlaceholder = () => (
  <div style={{ maxWidth: 360 }}>
    <SelectField
      label="Detachment"
      placeholder="Select a detachment"
      defaultValue=""
      options={[
        { label: 'Gladius Task Force', value: 'gladius' },
        { label: 'Anvil Siege Force', value: 'anvil' },
        { label: 'Ironstorm Spearhead', value: 'ironstorm' }
      ]}
    />
  </div>
);

export const WithError = () => (
  <div style={{ maxWidth: 360 }}>
    <SelectField
      label="Battle size"
      options={[
        { label: 'Incursion (1000 pts)', value: '1000' },
        { label: 'Strike Force (2000 pts)', value: '2000' },
        { label: 'Onslaught (3000 pts)', value: '3000' }
      ]}
      defaultValue="2000"
      error="Roster exceeds the selected battle size."
    />
  </div>
);

export const Disabled = () => (
  <div style={{ maxWidth: 360 }}>
    <SelectField label="Faction" options={factionOptions} defaultValue="necrons" disabled />
  </div>
);
