import { Filters, Search, SelectField } from '@depot/web';

const roleOptions = [
  { label: 'All roles', value: 'all' },
  { label: 'Character', value: 'character' },
  { label: 'Battleline', value: 'battleline' },
  { label: 'Elites', value: 'elites' }
];

export const WithClear = () => (
  <div style={{ maxWidth: 520 }}>
    <Filters showClear onClear={() => {}}>
      <Search value="Bladeguard" placeholder="Search datasheets" onChange={() => {}} />
      <SelectField label="Role" options={roleOptions} defaultValue="elites" />
    </Filters>
  </div>
);

export const WithoutClear = () => (
  <div style={{ maxWidth: 520 }}>
    <Filters showClear={false} onClear={() => {}}>
      <Search value="" placeholder="Search datasheets" onChange={() => {}} />
      <SelectField label="Role" options={roleOptions} defaultValue="all" />
    </Filters>
  </div>
);
