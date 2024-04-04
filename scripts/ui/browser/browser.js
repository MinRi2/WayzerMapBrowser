const {
    wayzerApi, network, previews, theModName, ui, elemUtils
} = require(modName + "/vars");
const {
    setLoadingText, 
    setLoadFaildText, 
    setNoResultText, 
    addTitle, 
    addTooltip, 
    getDeboundTextField,
    addTagsPane,
} = elemUtils;

const details = require(modName + "/ui/browser/details");
const { confirmVoteMap, confirmDownloadMap } = require(modName + "/ui/browser/utils");

const lastPageKeyCode = KeyCode.leftBracket,
    nextPageKeyCode = KeyCode.rightBracket;

var dialog;

var searchText = "";

var mapTable = new Table();
var width = 510, height = 270;
var imageSize = 176, buttonSize = 40;
var columns = 3;

// 按钮Tooltip
var userTag = null;
var selectTags = [
    new SelectTag("@mode",
        ["Survive", "Pvp", "Attack", "Sandbox", "Editor", "Unkown"]
    ),
    new SelectTag("@version",
        [3, 4, 5, 7]
    ),
    new SelectTag("@sort",
        ["updateTime", "createTime", "download", "rating", "like"]
    )
]

var mapArray = null;

var page = 0;
const maxRequest = 200;
const count = 14;
const minPage = 0, maxPage = Math.ceil(maxRequest / count);

function init(){
    details.init();

    dialog = new BaseDialog("$wayser-maps.browser");
            
    dialog.shown(rebuild);
    dialog.resized(rebuild);
    dialog.closeOnBack();
        
    setupButtons();
    addShiftPageKey();
}

module.exports = {
    init: init,
    show: () => dialog.show(),
}

function shiftPage(num){
    let last = page;
    page = Mathf.clamp(page + num, minPage, maxPage);
    
    if(page != last){
        rebuildMapTable();
    }
}

function setupButtons(){
    let buttons = dialog.buttons;
    
    buttons.defaults().padLeft(8);
    
    buttons.table(null, back => {        
        back.button("$back", Icon.left, Styles.flatBordert, () => dialog.hide()).size(210, 64);
    }).growX();
    
    buttons.table(null, right => {
        right.left();
            
        right.button(Icon.refresh, Styles.squarei, rebuildMapTable)
        .size(64).padRight(8).with(e => {
            addTooltip(e, "$wayzer-maps.refresh", true);
        });
        
        right.button(Icon.left, Styles.squarei, () => shiftPage(-1)).size(64).with(e => {            
            let text = Core.bundle.format("wayzer-maps.lastPage.hint", "" + lastPageKeyCode);
            addTooltip(e, text, false);
        });
        
        right.label(() => "" + (page + 1) + "/" + (maxPage + 1)).padRight(8).padLeft(8).width(64).labelAlign(Align.center);
        
        right.button(Icon.right, Styles.squarei, () => shiftPage(1)).size(64).with(e => {            
            let text = Core.bundle.format("wayzer-maps.nextPage.hint", "" + nextPageKeyCode);
            addTooltip(e, text, false);
        });
    }).fillX();
    
    buttons.table(null, webTable => {
        
    }).growX();
}

function addShiftPageKey(){
    dialog.keyDown(lastPageKeyCode, () => {
        if(Core.scene.hasField()) return;
        
        shiftPage(-1);
    });
    
    dialog.keyDown(nextPageKeyCode, () => {
        if(Core.scene.hasField()) return;
        
        shiftPage(1);
    });
}

function rebuild(){
    let cont = dialog.cont;
    
    cont.clear();
    cont.top();
    
    width = 510 / Scl.scl();
    
    if(!Core.graphics.isPortrait()){
        // 横 >= 纵
        cont.table(null, left => {
            left.top();
            left.defaults().growX();
            
            left.table(null, t => setupSearchTable(t)).growX().row();
        }).grow();
        
        let mapTableWidth = Core.scene.getWidth() / Scl.scl() * 2 / 3;
        columns = Math.floor(mapTableWidth / width);
        print(mapTableWidth)
        print(columns)
        
        cont.add(mapTable).width(mapTableWidth).pad(8).fillY();
    }else{
        // 横 < 纵
        cont.table(null, top => {
            top.top();
            top.defaults().growX();
            
            top.table(null, t => setupSearchTable(t)).growX().row();
        }).growX();
        
        cont.row();
        
        let mapTableWidth = Core.scene.getWidth() / Scl.scl(1);
        columns = Math.floor(mapTableWidth / width);
        cont.add(mapTable).pad(8).fill();
    }
    
    rebuildMapTable();
}

function setupSearchTable(table){
    table.top();
    table.defaults().growX();
    
    table.table(null, top => {
        top.left();
        
        top.image(Icon.zoom).size(buttonSize);
        
        let field = getDeboundTextField(searchText, t => {
            setSearchText(t);
        });
        
        // field.removeInputDialog();
        field.setMessageText("$wayzer-maps.search-map.tip");
        
        // 弹窗输入
        if(Core.app.isDesktop()){
            Core.scene.setKeyboardFocus(field);
        }
                
        top.add(field).growX();
        
        top.button(Icon.cancel, Styles.cleari, () => {
            setSearchText("");
        }).size(buttonSize);
        
        function setSearchText(t){
            searchText = t;
            field.setText(t);
            
            checkMapId(t);
            
            rebuildMapTable();
        }
        
        function checkMapId(text){
            let id = parseInt(text);
            
            if(isNaN(id)) return;
            
            details.safeShow(id);
        }
    }).row();
    
    table.pane(Styles.noBarPane, panet => {
        panet.top().right();
        panet.defaults().growX();
        
        panet.table(null, userTable => {
            userTable.top();
            
            userTable.add("$wayzer-maps.tag-@user").padRight(8);
            
            let text = userTag == null ? "" : userTag;
            let field = getDeboundTextField(text, t => {
                setUserTag(t);
            });
            
            // field.removeInputDialog();
            field.setMessageText("$wayzer-maps.search-user.tip");
            
            userTable.add(field).padLeft(24).width(buttonSize*6).get();
            
            userTable.button(Icon.cancel, Styles.cleari, () => {
                setUserTag("");
            }).size(buttonSize);
            
            function setUserTag(t){
                userTag = t == "" ? null : t;
                field.setText(t);
                                
                rebuildMapTable();
            }
        }).row();
            
        selectTags.forEach((searchTag) => {
            let tagsTable = panet.table().padTop(4).get();
            panet.row();
            
            tagsTable.top();
            
            tagsTable.add(searchTag.getDescription()).padRight(8);
            
            tagsTable.table(ui.grayPanel, t => {
                t.top();
                
                searchTag.tags.forEach((tag, i) => {
                    let text = searchTag.getTagName(tag);
                
                    t.button(text, Styles.flatToggleMenut, () => {
                        let now = searchTag.selectIndex;
                        
                        searchTag.selectIndex = now == i ? -1 : i;
                        rebuildMapTable();
                    }).checked(b => searchTag.selectIndex == i).size(buttonSize*3, buttonSize).padLeft(4).growY();
                    
                    if((i + 1) % 3 == 0){
                        t.row();
                    }
                });
            }).padLeft(24).growY();
        });
    }).grow();
}

function rebuildMapTable(){
    mapTable.clear();
    mapTable.center();
        
    setLoadingText(mapTable);
    
    let url = wayzerApi + "/maps/list?begin=" + page * count;
    
    let search = applyAllTags(searchText);
    url += "&search=" + search;
        
    network.fetch(url).then(data => {
        mapArray = JSON.parse(data.getResultAsString());
        setupBrowser(mapTable);
    }).error(error => {
        setLoadFaildText(mapTable);
        Log.err(error);
    });
}

function setupBrowser(table){    
    table.clear();
    
    if(mapArray.length == 0){
        setNoResultText(table);
        return;
    }
        
    table.pane(Styles.noBarPane, tp => {
        let len = Math.min(count, mapArray.length);
        
        for(let i = 0; i < len; i++){
            let obj = mapArray[i];
            
            tp.table(Styles.grayPanel, t => {
                setupMap(t, obj);
            }).size(width, height).padLeft(8).padTop(8);
            
            if((i + 1) % columns == 0) tp.row();
        }
    }).scrollX(false).grow();
}

function setupMap(table, obj){        
    table.top().left();
    table.defaults().growX();
    
    let {id, preview, name, desc, latest: hash, tags} = obj;
    
    table.table(null, top => {
        top.add(name).labelAlign(Align.left).ellipsis(true).wrap().growX();
                
        top.button(Icon.download, Styles.clearNonei, buttonSize, () => {
            confirmDownloadMap(hash, name);
        }).width(buttonSize).with(e => {
            let text = Core.bundle.format("wayzer-maps.map-download.hint", name);
            addTooltip(e, text, true);
        });
        
        let icon = new TextureRegionDrawable(ui.icons.vote);
        top.button(icon, Styles.clearNonei, buttonSize, () => {
            confirmVoteMap(name, id, () => dialog.hide());
        }).width(buttonSize).padLeft(4).disabled(e => !Vars.net.client()).with(e => {
            let text = Core.bundle.format("wayzer-maps.map-vote.hint", name);
            addTooltip(e, text, true);
        });
        
        top.button(Icon.info, Styles.clearNonei, buttonSize, () => {
            details.show(id);
        }).width(buttonSize).padLeft(4).with(e => {
            addTooltip(e, "$wayzer-maps.map-info.hint", true);
        });
    });
    
    table.row();
        
    table.table(null, bottom => {
        bottom.top().left();
    
        bottom.table(Tex.pane, imageTable => {
            let errorRegion = new TextureRegion(Core.assets.get("sprites/error.png"));
            let image = imageTable.image(errorRegion).grow().get();
            
            previews.fetchPreview(id, preview, region => {
                image.setDrawable(region);
            });
        }).size(imageSize);
        
        bottom.pane(Styles.noBarPane, info => {
            info.top().left();
            info.background(Tex.pane);
            
            let t = desc ? desc : "$wayzer-maps.no-description";
            info.add(t).labelAlign(Align.left).wrap().growX();
        }).scrollX(false).height(imageSize).padLeft(4).margin(8).growX();
    }).margin(4);
    
    table.row();
    
    addTagsPane(table, tags, tag => tag.replace(/§.*/, ""));
    
    table.invalidateHierarchy();
}

function applyAllTags(text){
    let applied = text;
    for(let i = selectTags.length - 1; i >= 0; i--){
        let st = selectTags[i];
        applied = st.apply(applied);
    }
    
    // 特殊的user tag
    if(userTag != null){
        applied += "+"+ "@user:" + userTag + "+";
    }
        
    return applied;
}

function SelectTag(name, tags){
    this.name = name;
    this.tags = tags;
    this.selectIndex = -1;
    
    this.apply = function(text){
        let {name, tags, selectIndex} = this;
        
        if(selectIndex != -1){
            return "+" + name + ":" + tags[selectIndex] + "+" + text;
        }
        
        return text;
    }
    
    this.getTagName = function(tag){
        let {name, tags} = this;
        return Core.bundle.get("wayzer-maps.tag-" + name + "-" + tag, tag);
    }
    
    this.getDescription = function(){
        return Core.bundle.get("wayzer-maps.tag-" + this.name, this.name);
    }
}