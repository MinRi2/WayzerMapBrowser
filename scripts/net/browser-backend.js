const { wayzerApi, network } = require(modName + "/vars");

const previewCache = new IntMap();

function fetchPreview(thread, url, callback) {
    let cache = previewCache.get(thread);

    if (cache != null) {
        return callback(cache);
    }

    network.fetch(url).then(data => {
        try {
            let pix = new Pixmap(data.result);
            let tex = new Texture(pix);
            tex.setFilter(Texture.TextureFilter.linear);

            let region = new TextureRegion(tex);
            previewCache.put(thread, region);

            pix.dispose();

            callback(region);
        } catch (e) {
            // Log.err(e);
        }
    });
}

function downloadMap(thread, onSuccess, onError) {
    Http.get(wayzerApi + "/maps/" + thread + ".msav", r => {
        let result = r.getResult();

        Core.app.post(() => {
            onSuccess(result);
        });
    }, onError);
}

function details(thread, onSuccess, onError) {
    network.fetch(wayzerApi + "/maps/" + thread + ".json").then(data => {
        let result = JSON.parse(data.getResultAsString());

        onSuccess(result);
    }).error(error => {
        onError(error);
    });
}

module.exports = {
    fetchPreview: fetchPreview,
    downloadMap: downloadMap,
    details: details,
}