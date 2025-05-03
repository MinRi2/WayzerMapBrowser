// code by miner 2023 6.6

var resized = new Seq();
var alignmentElements = new Seq();

var background = null;
var target = null;

// 拖拽
const alignmentRange = 5;

// 绘制
var horizontalLines = new ObjectSet();
var verticalLines = new ObjectSet();

Events.on(ClientLoadEvent, e => {
    setAlignElems();
});

Events.on(ResizeEvent, e => {
    setAlignElems();
    
    let newWidth = Core.scene.getWidth(),
        newHeight = Core.scene.getHeight();
        
    resized.each(listener => listener.resized(newWidth, newHeight));
});

function setAlignElems(){
    let {ui} = Vars;
    let {hudfrag, hudGroup} = ui;
    
    let {blockfrag} = hudfrag;
    let mainStack = Reflect.get(blockfrag, "mainStack"); // 放置面板
    
    let wavesTable = hudGroup.find("waves"); // 波数面板
    
    let minimap = hudGroup.find("minimap"); // 小地图
    let position = hudGroup.find("position");
    
    let coreInfo = hudGroup.find("coreinfo");
    let coreItemsTable = coreInfo.getChildren().get(1);
    let coreItems = coreItemsTable.getChildren().get(0); // 核心资源显示
    
    alignmentElements = Seq.with(
        mainStack,
        wavesTable,
        minimap, position,
        coreItems,
    );
}

function createListener(e, needSave, alignable){
    // 读取
    if(needSave){
        readPosition(e);
    }
    
    if(alignable){
        alignmentElements.add(e);
    }
        
    let listener = extend(InputListener, {
        lastSceneWidth: Core.scene.getWidth(),
        lastSceneHeight: Core.scene.getHeight(),
        
		startX: 0,
		startY: 0,
		
		resized(width, height){
		    readPosition(e);
		
		    let { lastSceneWidth, lastSceneHeight } = this;
		    let newX = width * e.x / lastSceneWidth;
		    let newY = height * e.y / lastSceneHeight;
		    
		    e.setPosition(newX, newY);
		    e.keepInStage();
		    
		    this.lastx = newX;
		    this.lasty = newY;
		    this.lastSceneWidth = width;
		    this.lastSceneHeight = height;
		},
		
		touchUp(event, x, y, pointer, button){		    
		    if(needSave){
    		    savePosition(e);
		    }
		    
		    disableEdit();
        },
        
        touchDown(event, x, y, pointer, button){
            enableEdit(e);
		    
		    this.startX = x;
            this.startY = y;
			
			return true;
		},

		touchDragged(event, dragX, dragY, pointer){		    
		    horizontalLines.clear();
            verticalLines.clear();
		    
		    let deltaX = dragX - this.startX,
		        deltaY = dragY - this.startY;
		        		    
	        this.updateDragMode(deltaX, deltaY);
		    
		    e.keepInStage();
		},

		updateDragMode(deltaX, deltaY){
		    e.moveBy(deltaX, deltaY);
		    updateDragAlign();
		},
	
	});
	
	resized.add(listener);
	
	return listener;
}

module.exports = {
    createListener: createListener,
}

function initBackground(){
    background = extend(Element, {
        draw(){
            this.super$draw();
            
            let {x, y, width, height} = this;
            
            // 背景色
            Draw.color(Color.black, 0.2);
            Fill.rect(x + width/2, y + height/2, width, height);
            Draw.reset();
            
            this.drawAlignmentLines();
            this.drawBounds();
            this.drawHint();
        },
        
        // 绘制对齐线
        drawAlignmentLines(){
            let {x, y, width, height} = this; 
            
            Draw.color(Pal.accent, 0.8);
            horizontalLines.each(ly => {
                Lines.line(0, ly, width, ly);
            })
            
            verticalLines.each(lx => {
                Lines.line(lx, 0, lx, height);
            })
            
            Draw.reset();
        },
        
        drawBounds(){
            Draw.color(Color.sky);
            
            // 绘制可对齐元素边框
            alignmentElements.each(element => {
                if(target == element){
                    return;
                }
                
                let ew = element.getWidth();
                let eh = element.getHeight();
                
                let v1 = element.localToStageCoordinates(Tmp.v1.set(0, 0));
                
                Lines.rect(v1.x, v1.y, ew, eh);
            });
            
            Draw.reset();
        },
        
        drawHint(){
            let {x, y} = target;
        
            let tw = target.getWidth();
		    let th = target.getHeight();
		    
		    Draw.color(Pal.accent, 0.9);
		    
		    // 绘制元素边框
		    Lines.rect(x, y, tw, th);
		    
		    Draw.reset();
        },
        
    });
    
    background.touchable = Touchable.disabled;
    background.setFillParent(true);
}

function initConfirmTable(){
    confirmTable = new Table();
    
    let c = Tmp.c1.set(Pal.accent);
    c.a = 0.55;
    confirmTable.background(Tex.whiteui.tint(c));
    
    confirmTable.button("@confirm", Icon.ok, 64, () => {
        disableEdit();
    }).size(128, 64);
    
    confirmTable.pack();
    
    let h = confirmTable.getHeight();
    confirmTable.setPosition(Core.scene.getWidth()/2, h/2, Align.center);
    confirmTable.update(() => {
        if(!Vars.state.isGame()){
            disableEdit();
        }
    })
}

function enableEdit(e){
    if(background == null){
        initBackground();
    }
    
    target = e;
    
    Core.scene.add(background);
}

function disableEdit(){
    target = null;
    
    background.remove();
    
    horizontalLines.clear();
    verticalLines.clear();
}

function savePosition(e){
    let {name} = e;
        
    if(name == null){
        throw new Error("If you want to save position for element, please name your element");
    }
    
    let floatx = java.lang.Float(e.x);
    let floaty = java.lang.Float(e.y);
    Core.settings.put("ui-" + name + "-lastPosition-x", floatx);
    Core.settings.put("ui-" + name + "-lastPosition-y", floaty);
}

function readPosition(e){
    let {name} = e;
        
    if(name == null){
        throw new Error("If you want to read position for element, please name your element");
    }
    
    let x = Core.settings.getFloat("ui-" + name + "-lastPosition-x", e.x);
    let y = Core.settings.getFloat("ui-" + name + "-lastPosition-y", e.y);
    
    e.setPosition(x, y);
    e.keepInStage();
}

function updateDragAlign(){    
    let tx = target.x, ty = target.y;
    let tw = target.getWidth(), th = target.getHeight();
    
    let tleft = tx; // 目标元素左端线的x
    let tright = tx + tw; // 目标元素右端线的x
    let tbottom = ty; // 目标元素下端线的y
    let ttop = ty + th; // 目标元素上端线的y
    
    alignmentElements.each(element => {
        if(target == element || !element.visible){
            return;
        }
    
        let {x, y} = element;
        let ew = element.getWidth();
        let eh = element.getHeight();
        
        let v1 = element.localToStageCoordinates(Tmp.v1.set(0, 0));
        
        let left = v1.x;
        let right = v1.x + ew;
        let bottom = v1.y;
        let top = v1.y + eh;
        
        if(Math.abs(tleft - left) <= alignmentRange){
            target.setPosition(left, ty);
            verticalLines.add(left);
        }else if(Math.abs(tright - left) <= alignmentRange){
            target.setPosition(left - tw, ty);
            verticalLines.add(left);
        }
                
        if(Math.abs(tleft - right) <= alignmentRange){
            target.setPosition(right, ty);
            verticalLines.add(right);
        }else if(Math.abs(tright - right) <= alignmentRange){
            target.setPosition(right - tw, ty);
            verticalLines.add(right);
        }
        
        tx = target.x;
        ty = target.y;
        
        if(Math.abs(ttop - bottom) <= alignmentRange){
            target.setPosition(tx, bottom - th);
            horizontalLines.add(bottom);
        }else if(Math.abs(tbottom - bottom) <= alignmentRange){
            target.setPosition(tx, bottom);
            horizontalLines.add(bottom);
        }
                
        if(Math.abs(ttop - top) <= alignmentRange){
            target.setPosition(tx, top - th);
            horizontalLines.add(top);
        }else if(Math.abs(tbottom - top) <= alignmentRange){
            target.setPosition(tx, top);
            horizontalLines.add(top);
        }
    });
    
    target.keepInStage();
}