import { Field } from '@depot/web';

export const TextInput = () => (
  <Field style={{ maxWidth: 360 }}>
    <label htmlFor="roster-name" className="block text-sm font-medium text-body">
      Roster name
    </label>
    <input
      id="roster-name"
      type="text"
      defaultValue="Vanguard Spearhead"
      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white sm:text-base"
    />
  </Field>
);

export const WithHint = () => (
  <Field style={{ maxWidth: 360 }}>
    <label htmlFor="points-limit" className="block text-sm font-medium text-body">
      Points limit
    </label>
    <input
      id="points-limit"
      type="number"
      defaultValue={2000}
      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white sm:text-base"
    />
    <p className="text-sm text-hint">Strike Force games are typically 2000 points.</p>
  </Field>
);

export const Stacked = () => (
  <Field style={{ maxWidth: 360 }}>
    <label htmlFor="faction" className="block text-sm font-medium text-body">
      Faction
    </label>
    <input
      id="faction"
      type="text"
      defaultValue="Adeptus Astartes"
      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white sm:text-base"
    />
    <label htmlFor="detachment" className="block text-sm font-medium text-body">
      Detachment
    </label>
    <input
      id="detachment"
      type="text"
      defaultValue="Gladius Task Force"
      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white sm:text-base"
    />
  </Field>
);
