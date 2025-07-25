const browser = require(modName + "/ui/browser/browser");
const drag = require(modName + "/ui/listener/DragListener");

var table = new Table();

var label = null;

function init(){
    Vars.ui.settings.graphics.checkPref("wayzer-maps-show", true);

    browser.init();
        
    setupTable();
    addTable();
    
    if(X && typeof X.ui.OverlayUI.INSTANCE.registerWindow == "function"){
        X.ui.OverlayUI.INSTANCE.registerWindow("wayzer-maps", table);
    }else{
        let listener = drag.createListener(table, true, true);
        label.addListener(listener);
    }
}

module.exports = {
    init: init,
}

function setupTable(){
    table.name = "wayzer-maps";
    table.background(Tex.pane);
    table.touchable = Touchable.childrenOnly;
    table.visibility = () => Vars.ui.hudfrag.shown && !Vars.ui.minimapfrag.shown() && Core.settings.getBool("wayzer-maps-show");
    
    table.defaults().expandX();
    
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
            let {scene} = Core;
            if(!scene.hasField() && keyValid()){
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

function keyValid(){
    const {input} = Core;
    return (input.keyDown(KeyCode.w) && input.keyRelease(KeyCode.z)) || (input.keyDown(KeyCode.z) && input.keyRelease(KeyCode.w));
}