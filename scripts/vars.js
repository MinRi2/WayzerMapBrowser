exports.theModName = modName;

exportVar("wayzerApi", "https://api.mindustry.top");

exportVar("network", require(modName + "/net/network"));
exportVar("previews", require(modName + "/net/previews"));

exportVar("ui", require(modName + "/ui/RiUI"));
exportVar("elemUtils", require(modName + "/ui/ElementUtils"));

function exportVar(name, value){
    module.exports[name] = value;
}