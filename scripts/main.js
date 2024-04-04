let mod = Vars.mods.getMod(modName);

mod.meta.author = "[yellow]miner";
mod.meta.description = mod.root.child("description").readString();

const vars = require(modName + "/vars");
const button = require(modName + "/ui/button");

Events.on(ClientLoadEvent, () => {
    vars.ui.load();
    button.init();
});