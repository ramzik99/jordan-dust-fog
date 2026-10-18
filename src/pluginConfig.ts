import type { ExternalPluginConfig } from '@windy/interfaces';
const config: ExternalPluginConfig = {
  name: 'windy-plugin-jordan-dust-fog', version: '1.0.0', icon: '???',
  title: 'Dust forecast',
  description: 'Native-grid GEOS-FP dust forecasts worldwide, point thresholds and satellite imagery.',
  author: 'Ramzi Kandah', repository: 'https://github.com/ramzik99/jordan-dust-fog',
  desktopUI: 'embedded', mobileUI: 'small', addToContextmenu: true, listenToSingleclick: true,
};
export default config;

