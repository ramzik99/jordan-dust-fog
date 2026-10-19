import products from '@windy/products';
import { createFullRenderingParams, getDataZoom } from '@windy/renderUtils';
import { fetchImageBlob, extractTileHeader } from '@windy/tileLayerSource';
import { applyUrlTemplate } from '@windy/tileHelpers';
import { createTileContourProvider } from './windyContourData.mjs';
import { createWindyTileReader, sampleTile } from './windyTileReader.mjs';
export const createWindyContourProvider = () => createTileContourProvider({
  products, createParams:createFullRenderingParams, getDataZoom,
  tiles:createWindyTileReader({fetchImageBlob,extractTileHeader}), applyUrlTemplate, sampleTile
});
