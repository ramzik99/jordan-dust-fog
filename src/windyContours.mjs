import products from '@windy/products';
import { createFullRenderingParams, getDataZoom } from '@windy/renderUtils';
import { fetchImageBlob, extractTileHeader } from '@windy/tileLayerSource';
import { rawDataToCanvasImageSource, getImageData } from '@windy/imageFetch';
import { applyUrlTemplate } from '@windy/tileHelpers';
import { createTileContourProvider } from './windyContourData.mjs';
import { createWindyTileReader, sampleTile } from './windyTileReader.mjs';
export const createWindyContourProvider = () => createTileContourProvider({
  products, createParams:createFullRenderingParams, getDataZoom,
  tiles:createWindyTileReader({fetchImageBlob,extractTileHeader,decodeImage:rawDataToCanvasImageSource,readPixels:getImageData}), applyUrlTemplate, sampleTile
});
