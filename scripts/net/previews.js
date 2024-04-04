const network = require("net/network");

// 缓存预览图 (id => TextureRegion)
const previewCache = new IntMap();

module.exports = {
    fetchPreview: fetchPreview,
}

function fetchPreview(id, url, callback){
    let cache = previewCache.get(id);
    
    if(cache != null){
        return callback(cache);
    }

    network.fetch(url).then(data => {        
        try{
            let pix = new Pixmap(data.result);
            let tex = new Texture(pix);
            tex.setFilter(Texture.TextureFilter.linear);
            
            let region = new TextureRegion(tex);
            previewCache.put(id, region);
            
            pix.dispose();
            
            callback(region);
        }catch(e){
            // Log.err(e);
        }
    });
}