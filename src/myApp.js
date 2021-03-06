var g_GameZOrder =
{
    bg: 0,

    map:10,
    mapitem:11,

    ui: 100,

    char: 1000,
    charteam:1001,
    chareffect:2000,
    charmsg:2500,

    actionchar: 3000,

    menu: 5000,

    font: 10000
}

var MyGameLayer = cc.Layer.extend({
    bgsprite: null,
    char:null,
    cmd:null,

    onEnter: function(){
        this._super();

        var size = cc.director.getWinSize();

        this.bgsprite = cc.Sprite.create(s_DemoBackGround);
        this.bgsprite.setAnchorPoint( 0.5, 0.5 );
        this.bgsprite.setPosition( size.width / 2, size.height / 2 );
        this.bgsprite.setScale( size.height/this.bgsprite.getContentSize().height );
        this.addChild( this.bgsprite, g_GameZOrder.bg );

        this.char = new CharSprite();
        this.char.setAnchorPoint( 0.5, 0.5 );
        this.char.setPosition( size.width / 2, this.char.getContentSize().height / 2 );
        this.addChild( this.char, g_GameZOrder.char );

        this.cmd = new CommandLayer();
        this.cmd.setPosition( size.width - 100, size.height / 2 );
        this.addChild( this.cmd, g_GameZOrder.ui );
    }
})

var MyLayer = cc.Layer.extend({
    helloLabel:null,
    versionLabel:null,
    sprite:null,

    init:function () {

        //////////////////////////////
        // 1. super init first
        this._super();

        /////////////////////////////
        // 2. add a menu item with "X" image, which is clicked to quit the program
        //    you may modify it.
        // ask director the window size
        var size = cc.director.getWinSize();

        // add a "close" icon to exit the progress. it's an autorelease object
        var StartBtn = cc.MenuItemImage.create(
            s_StartBtn,
            s_StartBtn,
            this.onStartGame,
            this);
        StartBtn.setAnchorPoint(0.5, 0.5);

        var menu = cc.Menu.create(StartBtn);
        menu.setPosition(0, 0);
        this.addChild(menu, g_GameZOrder.ui);
        StartBtn.setPosition(size.width / 2, 100);

        /////////////////////////////
        // 3. add your codes below...
        // add a label shows "Hello World"
        // create and initialize a label
        this.helloLabel = cc.LabelTTF.create("Moe Moe 乱战纪", "黑体", 38);
        // position the label on the center of the screen
        this.helloLabel.setPosition(size.width / 2, size.height - 100);
        this.helloLabel.setColor( cc.color( 0, 255, 0 ) );
        this.helloLabel.enableStroke( cc.color( 0, 0, 0, 0 ), 5 );
        // add the label as a child to this layer
        this.addChild(this.helloLabel, g_GameZOrder.font);

        this.versionLabel = cc.LabelTTF.create("Version 0.0.0.0.1 By 芙蕾穆黑兹", "微软雅黑", 18);
        this.versionLabel.setPosition(size.width / 2, 40);
        this.versionLabel.setColor( cc.color.RED );
        this.addChild(this.versionLabel, g_GameZOrder.font);

        // add "Helloworld" splash screen"
        this.sprite = cc.Sprite.create(s_BackGround);
        this.sprite.setAnchorPoint(0.5, 0.5);
        this.sprite.setPosition(size.width / 2, size.height / 2);
        this.sprite.setScale(size.height/this.sprite.getContentSize().height);
        this.addChild(this.sprite, g_GameZOrder.bg);
    },

    onStartGame: function() {
        var scene = cc.Scene.create();
        var size = cc.director.getWinSize();

        var layer = new MapLayer( 8, 12 );
        layer.setPosition( size.width / 2, size.height / 2 );
        layer.createMap();
        layer.initChars();
        layer.gameStart();

        scene.addChild( layer );
        var transition = cc.TransitionProgressRadialCCW.create( 0.5,scene );
        cc.director.runScene( transition );
    }
});

var MyScene = cc.Scene.extend({
    onEnter:function () {
        this._super();

        // initial
        initCharSkillList();

        var layer = new MyLayer();
        this.addChild(layer);
        layer.init();
    }
});
