const {
    ui,
} = require(modName + "/vars");

module.exports = {
    setLoadingText: setLoadingText,
    setLoadFaildText: setLoadFaildText,
    setNoResultText: setNoResultText,
    addTitle: addTitle,
    addTooltip: addTooltip,
    getDeboundTextField: getDeboundTextField,
    addTagsPane: addTagsPane,
}

function setLoadingText(table){    
    table.clearChildren();
    
    let label = new FLabel("$wayzer-maps.loading");
    table.add(label).color(Pal.lightishGray).fontScale(1.3);
}

function setLoadFaildText(table){
    table.clearChildren();
    
    let label = new FLabel("$wayzer-maps.faild");
    table.add(label).color(Pal.lightishGray).fontScale(1.3).expand();
}

function setNoResultText(table){
    table.clearChildren();
    
    let label = new FLabel("$wayzer-maps.noResult");
    table.add(label).color(Pal.lightishGray).fontScale(1.3);
}

function addTitle(table, text){
    table.table(Tex.whiteui, title => {
        title.add(text);
    }).color(Pal.gray).padBottom(8).growX().row();
}

function addTooltip(elem, text, allowMobile){
    let tooltip = Object.assign(new Tooltip(t => {
        t.background(Styles.black6);
        t.add(text).margin(8);
    }), {
        allowMobile: allowMobile,
    });
    elem.addListener(tooltip);
}

function getDeboundTextField(text, cons){
    if(!Core.input.useKeyboard()){
        return Elem.newField(text, cons);
    }
    
    let keeping = false;
    let keeper = new Timekeeper(0.3);
    let field = Elem.newField(text, t => {
        keeping = true;
        keeper.reset();
    });
    
    field.update(() => {
        if(keeping && keeper.get()){
            keeping = false;
            cons(field.getText());
        }
    });
    
    return field;
}

function addTagsPane(table, tags, tagHandler){
    table.pane(Styles.noBarPane, tagsTable => {
        tagsTable.left();
        tagsTable.background(Tex.pane);
        tagsTable.defaults().pad(4);
        
        tags.forEach((tag, index) => {
            tagsTable.table(ui.grayPanel, t => {
                const text = tagHandler ? tagHandler(tag) : tag;
                const margin = index == 0 ? 0 : 8;
                                
                t.add(text).minWidth(Scl.scl(96)).labelAlign(Align.center).pad(4).marginLeft(margin);
            });
        })
    }).scrollY(false).pad(4).padLeft(8).padRight(8).fillY();
}