import { Search } from '@depot/web';

export const Default = () => (
  <div style={{ maxWidth: 360 }}>
    <Search value="Intercessor" placeholder="Search datasheets" onChange={() => {}} />
  </div>
);

export const WithLabel = () => (
  <div style={{ maxWidth: 360 }}>
    <Search
      label="Find a unit"
      value="Terminator"
      placeholder="Search datasheets"
      onChange={() => {}}
    />
  </div>
);

export const Empty = () => (
  <div style={{ maxWidth: 360 }}>
    <Search label="Search roster" value="" placeholder="Search units" onChange={() => {}} />
  </div>
);
