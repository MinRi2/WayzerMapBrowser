const {
    wayzerApi, network, previews, theModName, ui, elemUtils, booleanRules, multiplierRules
} = require(modName + "/vars");
const { setClipboardText, viewImage } = ui;
const {
    setLoadingText, 
    setLoadFaildText, 
    setNoResultText, 
    addTitle, 
    addTooltip, 
    getDeboundTextField,
    addTagsPane,
} = elemUtils;
const { confirmDownloadMap } = require(modName + "/ui/browser/utils");

var dialog;

var details = null, mapTags = null;

var waveGraph;

function init(){
    dialog = new BaseDialog("$wayzer-maps.details");
    waveGraph = new WaveGraph();
    
    dialog.resized(rebuildDialog);
    dialog.addCloseButton();
}

function show(id){
    let {cont} = dialog;
        
    cont.clear();
    
    setLoadingText(cont);
    dialog.show();
    
    loadDetails(id, rebuildDialog, () => {
        setLoadFaildText(cont);
    }, e => Log.err(e));
}

function safeShow(id){
    loadDetails(id, () => {
        rebuildDialog();
        dialog.show();
    }, e => {});
}

module.exports = {
    init: init,
    show: show,
    safeShow: safeShow,
}

function loadDetails(id, successCons, faildCons){
    let url = wayzerApi + "/maps/thread/" + id + "/latest";
        
    network.fetch(url).then(data => {
        details = JSON.parse(data.getResultAsString());
        // Log.info(JSON.stringify(details, null, 4));
        mapTags = details.tags;
        successCons();
    }).error(error => {
        faildCons(error);
    });
}

function rebuildDialog(){
    let {cont} = dialog;
    
    cont.clear();
    
    let body = cont.table().get();
    
    body.top();
            
    body.table(null, front => {
        front.defaults().growX();
        
        front.table(Tex.button, topTable => {
            topTable.table(Styles.grayPanel, t => setupImageTable(t)).fill();

            topTable.table(Styles.grayPanel, t => setupInfoTable(t)).width(256*2 / Scl.scl(1)).growY().padLeft(16);
        });
        
        front.row();
        
        front.table(Tex.button, bottomTable => {
            bottomTable.top();
            bottomTable.defaults().padTop(8).growX();
            
            bottomTable.table(Styles.grayPanel, t => setupRulesTable(t)).row();
        }).padTop(16);
    });
    
    if(Core.graphics.isPortrait()){
        // 纵 >= 横
        body.row();
    }
    
    let {spawns} = mapTags.rules;
    if(spawns){
        let containerCell, waveTableCell;
        containerCell = body.table(Tex.button, container => {
            waveTableCell = container.table(Styles.grayPanel, setupWaveTable).grow();
        }).fill();
        
        if(Core.graphics.isPortrait()){
            waveTableCell.height(256*2.5 / Scl.scl(1));
            
            containerCell.padTop(16);
        }else{
            waveTableCell.width(Scl.scl(350));
            
            containerCell.padLeft(16);
        }
    }
}

function setupImageTable(table){
    let {thread: id, preview} = details;
    
    let errorRegion = new TextureRegion(Core.assets.get("sprites/error.png"));
    let image = new BorderImage(errorRegion, 1);
    
    table.add(image).scaling(Scaling.fit).size(256 / Scl.scl(1)).with(e => {
        e.clicked(() => viewImage(image.getDrawable()));
    })
    
    previews.fetchPreview(id, preview, region => {
        image.setDrawable(region);
    });
}

function setupInfoTable(table){
    table.left().top();
    table.defaults().padTop(8).growX();
    
    let {user, mode, hash, thread: id} = details;
    let {name, author, description, width, height, mods} = mapTags;
    
    table.add(name).labelAlign(Align.left).wrap().growX().row();
    
    addText("map-uploader", user.name, t => {
        t.table(null, buttons => {
            buttons.defaults().size(32).pad(4);
            
            buttons.button(Icon.copy, Styles.cleari, 24, () => {
                setClipboardText(user.name);
            });
        }).expand().right().row();
    });
    addText("map-author", author);
    
    addText("map-id", id, t => {
        t.table(null, buttons => {
            buttons.defaults().size(32).pad(4);
            
            buttons.button(Icon.copy, Styles.cleari, 24, () => {
                setClipboardText(id);
            });
            
            buttons.button(Icon.download, Styles.cleari, 24, () => {
                confirmDownloadMap(hash, name);
            });
        }).expandX().right().row();
    });
    
    addText("map-mode", mode);
    addText("map-size", [width, height]);
    
    if(mods.length != 0){
        addText("map-mods", "", modsTable => {
            addTagsPane(modsTable, mods);
        });
    }
    
    if(description != undefined){
        addText("map-description", "", descriptionTable => {            
            descriptionTable.pane(Styles.noBarPane, t => {
                t.top();
                t.background(Tex.pane);
                t.add(description).wrap().growX();
            }).scrollX(false).maxHeight(128).pad(8).grow();
        });
    }
    
    function addText(tag, text, cons){        
        table.table(null, t => {
            t.top().left();
            t.add(Core.bundle.format("wayzer-maps." + tag, text)).labelAlign(Align.left).padLeft(8);
            
            if(cons) cons(t);
        });
        
        table.row();
    }
}

function setupRulesTable(table){
    let rules = mapTags.rules;

    addTitle(table, "Rules");
    
    table.defaults().growX();
    
    let body = new Table();
    
    table.pane(Styles.noBarPane, body).scrollX(false).grow();
    
    body.defaults().growX();
    
    body.table(null, base => {
        let i = 0;
        
        const boolFormator = value => {
            return Core.bundle.get("wayzer-maps.rules." + (value ?  "enable" : "disable"));
        }
        
        
        booleanRules.forEach(t => addRule(t, boolFormator));
        multiplierRules.forEach(t => addRule(t));
        
        addRule("enemyCoreBuildRadius", r => Strings.autoFixed(r / Vars.tilesize, 1));
        
        function addRule(rule, format){
            let value = rules[rule];
            
            // 仅显示特改规则
            if(value == undefined) return;
            
            let valueText = "" + (format ? format(value) : value);
            
            let ruleText = Core.bundle.get("rules." + rule.toLowerCase());
            
            base.table(null, ruleTable => {
                ruleTable.left();
                
                ruleTable.add(ruleText).labelAlign(Align.left).color(Pal.lightishGray).padLeft(4);
                
                ruleTable.add(valueText).labelAlign(Align.left).padLeft(16);
            }).pad(4).growX();
            
            if(++i % 2 == 0){
                base.row();
            }
        }
    });
    
    body.row();
    
    body.table(null, content => {
        content.top();
        
        let {bannedBlocks, bannedUnits, revealedBlocks} = rules;
        
        addContents("$bannedblocks", ContentType.block, bannedBlocks);
        addContents("$bannedunits", ContentType.unit, bannedUnits);
        addContents("$wayzer-maps.revealedblocks", ContentType.block, revealedBlocks);
        
        function addContents(text, type, obj){
            if(obj == undefined) return;
            
            const array = obj.values;
            
            if(array.length == 0) return;
            
            const contentSeq = new Seq();
            
            array.forEach(name => {
                const c = Vars.content.getByName(type, name);
                
                if(c == null){
                    Log.warn("Content " + name + " doesn't exist ignore it");
                    return null;
                }
                
                contentSeq.add(c);
            });
            
            contentSeq.sort(floatf(c1 => c1.id));
            
            content.table(Tex.pane, t => {
                t.left().top();
                
                t.add(text).color(Pal.lightishGray).padLeft(4).padRight(4);
                
                t.pane(Styles.noBarPane, pane => {
                    pane.left();
                                    
                    let imagesTable = pane.table().get();
                    
                    let i = 0;
                    contentSeq.each(c => {
                        const image = imagesTable.image(c.uiIcon).scaling(Scaling.fit).size(32).padLeft(8).get();
                        
                        image.clicked(() => {
                            Vars.ui.content.show(c);
                        });
                        
                        if(++i % 12 == 0){
                            imagesTable.row();
                        }
                    });
                }).scrollX(false).maxHeight(32*4.5).growX();
            }).growX().padTop(4);
            
            content.row();
        }
    });
}

function setupWaveTable(waves){
    let {spawns} = mapTags.rules;
    spawns = parseSpawnGroups(spawns);
    
    let updateTimer = 0, updatePeriod = 1;
    let start = 0, displayed = 20;
    
    waves.left();
            
    updateGraph();
    
    addTitle(waves, "Waves");
    
    waves.add(waveGraph).grow();
    
    waves.row();
        
    waves.table(null, buttons => {;
        buttons.defaults().grow();
        
        buttons.table(null, left => {            
            left.button("<", () => {}).update(t => {
                if(t.isPressed()){
                    shift(-1);
                }
            });
            
            left.button(">", () => {}).update(t => {
                if(t.isPressed()){
                    shift(1);
                }
            }).padLeft(4);
        });

        buttons.table(null, right => {            
            right.button("-", () => {}).update(t => {
                if(t.isPressed()){
                    view(-1);
                }
            });
            
            right.button("+", () => {}).update(t => {
                if(t.isPressed()){
                    view(1);
                }
            }).padLeft(4);
        });
    }).pad(4).growX();
    
    // copy copy...
    function shift(amount){
        updateTimer += Time.delta;
        if(updateTimer >= updatePeriod){
            start += amount;
            if(start < 0) start = 0;
            updateTimer = 0;
            updateGraph();
        }
    }
    
    function view(amount){
        updateTimer += Time.delta;
        if(updateTimer >= updatePeriod){
            displayed += amount;
            if(displayed < 5) displayed = 5;
            updateTimer = 0;
            updateGraph();
        }
    }
    
    function updateGraph(){
        waveGraph.groups = spawns;
        waveGraph.from = start;
        waveGraph.to = start + displayed;
        waveGraph.rebuild();
    }
}

function parseSpawnGroups(spawns){    
    let json = JSON.stringify(spawns);
    let spawnGroupArrayClass = java.lang.reflect.Array.newInstance(SpawnGroup, 0).getClass();
    let groups = JsonIO.json.fromJson(spawnGroupArrayClass, json);
    
    return new Seq(groups);
}