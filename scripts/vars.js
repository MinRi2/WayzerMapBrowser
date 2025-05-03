exports.theModName = modName;

const multiplierRules = [
    "solarMultiplier",

    "blockHealthMultiplier",
    "blockDamageMultiplier",
    "buildCostMultiplier",
    "deconstructRefundMultiplier",

    "unitHealthMultiplier",
    "unitHealthMultiplier",
    "unitBuildSpeedMultiplier",
];

const booleanRules = [
    "attackMode",
    "coreIncinerates",
    "waveTimer",
];

const modeTags = ["Survive", "Pvp", "Attack", "Sandbox", "Editor", "Unkown"];
const versionTags = [3, 4, 5, 7, 8];
const sortTags = ["updateTime", "createTime", "download", "rating", "like"];

exportVar("wayzerApi", "https://api.mindustry.top");

exportVar("network", require(modName + "/net/network"));
exportVar("browser", require(modName + "/net/browser-backend"));

exportVar("ui", require(modName + "/ui/RiUI"));
exportVar("elemUtils", require(modName + "/ui/ElementUtils"));

exportVar("booleanRules", booleanRules);
exportVar("multiplierRules", multiplierRules);
exportVar("modeTags", modeTags);
exportVar("versionTags", versionTags);
exportVar("sortTags", sortTags);

function exportVar(name, value) {
    module.exports[name] = value;
}