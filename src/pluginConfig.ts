import type { ExternalPluginConfig } from '@windy/interfaces';
const config: ExternalPluginConfig = {
  name: 'windy-plugin-synoptic-atlas', version: '1.2.3', icon: '🌐',
  title: 'Synoptic Atlas',
  description: 'Independent geopotential height and temperature isolines, with pressure levels and labels.',
  author: 'Ramzi Kandah', repository: 'https://github.com/ramzik99/jordan-dust-fog',
  desktopUI: 'embedded', mobileUI: 'small', addToContextmenu: false, listenToSingleclick: false,
};
export default config;
