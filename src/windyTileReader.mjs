// Decode each native Windy tile once, rather than issuing a GPU read for every contour node.
export function sampleTile(tile,params,point) {
  if(!tile.valid)return null;
  const {pixels,width,height,header}=tile,x=Math.min(width-1-1e-7,Math.max(0,point.x)),y=Math.min(height-1-1e-7,Math.max(0,point.y));
  const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy;
  const positions=[(iy*width+ix)*4,(iy*width+ix+1)*4,((iy+1)*width+ix)*4,((iy+1)*width+ix+1)*4];
  const values=[];
  for(const at of positions) {
    if(params.JPGtransparency&&pixels[at+2]>=192||params.PNGtransparency&&pixels[at+3]<1)return null;
    let value=header.decoderRmin+pixels[at]*header.decoderRstep;
    if(params.transformR)value=params.transformR(value);
    values.push(value);
  }
  return [values[0]*(1-fx)*(1-fy)+values[1]*fx*(1-fy)+values[2]*(1-fx)*fy+values[3]*fx*fy,0,0];
}
export function createWindyTileReader({fetchImageBlob,extractTileHeader,decodeImage=blob=>createImageBitmap(blob),readPixels}) {
  const cache=new Map();
  return {
    async get(url,signal) {
      let pending=cache.get(url);
      if(!pending) {
        pending=(async()=>{
          const response=await fetchImageBlob(url,signal);
          const blob=response instanceof Blob?response:response?.valid?response.blob:null;
          if(!blob)throw Error('Windy forecast tile unavailable');
          let original,image;
          try {
            original=await decodeImage(blob);
            const decoded=await extractTileHeader(original);image=decoded.image;
            let pixels;
            if(readPixels)pixels=await readPixels(image);
            else {
              const canvas=typeof OffscreenCanvas==='function'?new OffscreenCanvas(image.width,image.height):document.createElement('canvas');
              canvas.width=image.width;canvas.height=image.height;
              const ctx=canvas.getContext('2d',{willReadFrequently:true});
              if(!ctx)throw Error('Tile decoder unavailable');
              ctx.drawImage(image,0,0);
              pixels=ctx.getImageData(0,0,image.width,image.height).data;
            }
            return {valid:true,width:image.width,height:image.height,pixels,header:decoded.header};
          } finally {image?.close();original?.close();}
        })();
        cache.set(url,pending);
        pending.catch(()=>{if(cache.get(url)===pending)cache.delete(url);});
      }else{cache.delete(url);cache.set(url,pending);}
      while(cache.size>24)cache.delete(cache.keys().next().value);
      return {value:await pending};
    },
    free(){},
    destroy(){cache.clear();}
  };
}
