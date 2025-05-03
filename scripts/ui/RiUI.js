let theModName = modName;
let iconArray = ["vote"];

function load() {
    loadStyles();
    loadIcons();
}

function infoToast(text, duration) {
    let t = new Table(Styles.black3);
    t.touchable = Touchable.disabled;
    t.margin(16).add(text).style(Styles.outlineLabel).labelAlign(Align.center);

    t.update(() => t.toFront());

    t.pack();

    const y = Core.scene.getHeight() / 2;
    t.actions(
        Actions.moveToAligned(0, y, Align.right),
        Actions.moveToAligned(0, y, Align.left, 1.5, Interp.pow4Out),
        Actions.delay(duration),
        Actions.parallel(
            Actions.moveToAligned(0, y, Align.right, 1.5, Interp.pow4Out),
            Actions.fadeOut(1.5, Interp.fade),
        ),
        Actions.remove(),
    );

    t.act(0.1);
    Core.scene.add(t);
}

function setClipboardText(text) {
    Core.app.setClipboardText(text);

    infoToast(Core.bundle.format("copy.hint", text), 4);
}

function viewImage(image) {
    const dialog = new BaseDialog("$view-image");

    const { cont } = dialog;
    cont.image(image).scaling(Scaling.fit);

    dialog.addCloseButton();
    dialog.show();
}

module.exports = {
    load: load,
    icons: null,
    infoToast: infoToast,
    setClipboardText: setClipboardText,
    viewImage: viewImage,
}

function loadStyles() {
    Object.assign(module.exports, {
        grayPanel: Tex.whiteui.tint(Pal.gray),
    });
}

function loadIcons() {
    let icons = {};

    iconArray.forEach((icon) => {
        icons[icon] = Core.atlas.find(theModName + "-" + icon);
    });

    module.exports.icons = icons;
}