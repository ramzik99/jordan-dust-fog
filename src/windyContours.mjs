import products from '@windy/products';
import { createFullRenderingParams, getDataZoom } from '@windy/renderUtils';
import { TileLayerInterpolator } from '@windy/tileInterpolator';
import { tileLayerSource } from '@windy/tileLayerSource';
import { applyUrlTemplate } from '@windy/tileHelpers';
import { createTileContourProvider } from './windyContourData.mjs';
export const createWindyContourProvider = () => createTileContourProvider({
  products, createParams:createFullRenderingParams, getDataZoom, Interpolator:TileLayerInterpolator,
  tiles:tileLayerSource, applyUrlTemplate
});
