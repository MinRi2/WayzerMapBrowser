const browser = require(modName + "/ui/browser/browser");
const drag = require(modName + "/ui/listener/DragListener");

var table = new Table();

var label = null;

function init(){
    browser.init();
        
    setupTable();
    addTable();
    
    let listener = drag.createListener(table, true, true);
    label.addListener(listener);
}

module.exports = {
    init: init,
}

function setupTable(){
    table.name = "wayzer-maps";
    table.background(Tex.pane);
    table.visibility = () => Vars.ui.hudfrag.shown && !Vars.ui.minimapfrag.shown();
    
    table.defaults().growX();
    
    label = table.add("WayzerMaps").get();
    
    table.row();
    
    // 添加快捷键提示
    if(Core.app.isDesktop()){
        table.add(Core.bundle.format("wayzer-maps.open-keycode-hint", "" + KeyCode.w, "" + KeyCode.z)).row();
    }
    
    let icon = new TextureRegionDrawable(UnitTypes.oct.uiIcon);
    table.button(icon, Styles.clearNonei, 64, browser.show).height(64).padTop(8);
    
    // 快捷键实现
    if(Core.app.isDesktop()){
        table.update(() => {
            let {scene, input} = Core;
            if(!scene.hasField() && input.keyDown(KeyCode.w) && input.keyDown(KeyCode.z)){
                browser.show();
            }
        });
    }
    
    table.pack();
}

function addTable(){
    table.setPosition(0, Core.scene.getHeight()/2, Align.left);
    
    Core.scene.add(table);
}