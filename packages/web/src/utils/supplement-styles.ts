type SupplementStyle = {
  tagClass: string;
  tabActiveClass: string;
  tabInactiveClass: string;
};

const DEFAULT_STYLE: SupplementStyle = {
  tagClass: '',
  tabActiveClass: '',
  tabInactiveClass: ''
};

const SUPPLEMENT_COLOR_MAP: Record<string, SupplementStyle> = {
  'blood-angels': {
    tagClass:
      'border border-red-200 bg-red-100 text-red-800 dark:border-red-800 dark:bg-red-900 dark:text-red-200',
    tabActiveClass: 'bg-red-600 text-white border-red-600 dark:bg-red-500 dark:border-red-500',
    tabInactiveClass:
      'border-red-200 text-red-700 hover:text-red-900 hover:border-red-300 dark:border-red-800 dark:text-red-200 dark:hover:text-red-100'
  },
  'dark-angels': {
    tagClass:
      'border border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    tabActiveClass:
      'bg-emerald-600 text-white border-emerald-600 dark:bg-emerald-500 dark:border-emerald-500',
    tabInactiveClass:
      'border-emerald-200 text-emerald-700 hover:text-emerald-900 hover:border-emerald-300 dark:border-emerald-800 dark:text-emerald-200 dark:hover:text-emerald-100'
  },
  'space-wolves': {
    tagClass:
      'border border-sky-200 bg-sky-100 text-sky-800 dark:border-sky-800 dark:bg-sky-900 dark:text-sky-200',
    tabActiveClass: 'bg-sky-600 text-white border-sky-600 dark:bg-sky-500 dark:border-sky-500',
    tabInactiveClass:
      'border-sky-200 text-sky-700 hover:text-sky-900 hover:border-sky-300 dark:border-sky-800 dark:text-sky-200 dark:hover:text-sky-100'
  },
  'black-templars': {
    tagClass:
      'border border-gray-300 bg-gray-100 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100',
    tabActiveClass:
      'bg-gray-800 text-white border-gray-800 dark:bg-gray-200 dark:text-gray-900 dark:border-gray-200',
    tabInactiveClass:
      'border-gray-300 text-gray-800 hover:text-gray-900 hover:border-gray-400 dark:border-gray-700 dark:text-gray-200 dark:hover:text-gray-100'
  },
  deathwatch: {
    tagClass:
      'border border-indigo-200 bg-indigo-100 text-indigo-800 dark:border-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    tabActiveClass:
      'bg-indigo-600 text-white border-indigo-600 dark:bg-indigo-500 dark:border-indigo-500',
    tabInactiveClass:
      'border-indigo-200 text-indigo-700 hover:text-indigo-900 hover:border-indigo-300 dark:border-indigo-800 dark:text-indigo-200 dark:hover:text-indigo-100'
  },
  'ultramarines-legends': {
    tagClass:
      'border border-blue-200 bg-blue-100 text-blue-800 dark:border-blue-800 dark:bg-blue-900 dark:text-blue-200',
    tabActiveClass: 'bg-blue-600 text-white border-blue-600 dark:bg-blue-500 dark:border-blue-500',
    tabInactiveClass:
      'border-blue-200 text-blue-700 hover:text-blue-900 hover:border-blue-300 dark:border-blue-800 dark:text-blue-200 dark:hover:text-blue-100'
  },
  'imperial-agents-legends': {
    tagClass:
      'border border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-800 dark:bg-amber-900 dark:text-amber-200',
    tabActiveClass:
      'bg-amber-600 text-white border-amber-600 dark:bg-amber-500 dark:border-amber-500',
    tabInactiveClass:
      'border-amber-200 text-amber-700 hover:text-amber-900 hover:border-amber-300 dark:border-amber-800 dark:text-amber-200 dark:hover:text-amber-100'
  }
};

export const getSupplementStyles = (supplementKey?: string | null): SupplementStyle => {
  if (!supplementKey) {
    return DEFAULT_STYLE;
  }

  const normalized = supplementKey.toLowerCase();
  return SUPPLEMENT_COLOR_MAP[normalized] ?? DEFAULT_STYLE;
};

export const supplementColorKeys = Object.keys(SUPPLEMENT_COLOR_MAP);

export default getSupplementStyles;
