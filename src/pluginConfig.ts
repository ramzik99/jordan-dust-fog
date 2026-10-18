import type { ExternalPluginConfig } from '@windy/interfaces';
const config: ExternalPluginConfig = {
  name: 'windy-plugin-jordan-dust-fog', version: '1.1.0', icon: '🌫️',
  title: 'Synoptic Atlas',
  description: 'Global GEOS-FP dust, independent geopotential height, temperature and MSLP contours, and satellite imagery.',
  author: 'Ramzi Kandah', repository: 'https://github.com/ramzik99/jordan-dust-fog',
  desktopUI: 'embedded', mobileUI: 'small', addToContextmenu: true, listenToSingleclick: true,
};
export default config;

