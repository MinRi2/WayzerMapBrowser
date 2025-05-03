const { ui, browser } = require(modName + "/vars");
const { infoToast } = ui;

function confirmVoteMap(name, id, confirmed) {
    Vars.ui.showConfirm(Core.bundle.format("wayzer-maps.map-vote.confirm", name), () => {
        if (confirmed) confirmed();

        Call.sendChatMessage("/vote map " + id);
        Call.sendChatMessage("1");
    });
}

function confirmDownloadMap(thread, mapName, confirmed) {
    // Vars.ui.showInfo("$wayzer-maps.download-unopened");

    Vars.ui.showConfirm("@confirm", Core.bundle.format("wayzer-maps.map-download.confirm", mapName), () => {
        if (confirmed) confirmed();

        downloadMap(thread, mapName);
    });
}

function downloadMap(thread, mapName) {
    let loadfrag = Vars.ui.loadfrag;
    loadfrag.setProgress(0);
    loadfrag.show();

    browser.downloadMap(thread, result => {
        loadfrag.setProgress(1);
        loadfrag.hide();

        let fi = Vars.tmpDirectory.child(mapName);
        fi.writeBytes(result);

        let conflict = Vars.maps.all().find(m => m.name().equals(mapName));

        if (conflict != null) {
            Vars.ui.showConfirm("@confirm", Core.bundle.format("editor.overwrite.confirm", mapName), () => {
                Vars.maps.tryCatchMapError(() => {
                    Vars.maps.removeMap(conflict);
                    importMap(fi);
                });
            });
        } else {
            importMap(fi);
        }
    }, error => {
        infoToast(Core.bundle.format("wayzer-maps.map-download.failed", mapName), 5);
        loadfrag.hide();
    });

    function importMap(fi) {
        Vars.maps.importMap(fi);

        infoToast(Core.bundle.format("wayzer-maps.map-download.successed", mapName), 5);

        fi.delete();
    }
}

module.exports = {
    confirmVoteMap: confirmVoteMap,
    confirmDownloadMap: confirmDownloadMap,
}