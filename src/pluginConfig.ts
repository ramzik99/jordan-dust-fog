import type { ExternalPluginConfig } from '@windy/interfaces';
const config: ExternalPluginConfig = {
  name: 'windy-plugin-jordan-dust-fog', version: '0.1.0', icon: '🌫️',
  title: 'Jordan Dust & Fog',
  description: 'Experimental GEOS-FP dust guidance for Jordan. Fog and satellite integration pending.',
  author: 'Ramzi Kandah', repository: 'https://github.com/ramzik99/jordan-dust-fog',
  desktopUI: 'embedded', mobileUI: 'small', addToContextmenu: true, listenToSingleclick: true,
};
export default config;
