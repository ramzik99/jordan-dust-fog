import type { ExternalPluginConfig } from '@windy/interfaces';
const config: ExternalPluginConfig = {
  name: 'windy-plugin-synoptic-atlas', version: '1.0.1', icon: '🌐',
  title: 'Synoptic Atlas',
  description: 'Independent GEOS-FP geopotential height, temperature and MSLP isolines, with pressure levels and labels.',
  author: 'Ramzi Kandah', repository: 'https://github.com/ramzik99/jordan-dust-fog',
  desktopUI: 'embedded', mobileUI: 'small', addToContextmenu: false, listenToSingleclick: false,
};
export default config;
