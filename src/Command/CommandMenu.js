/**
 * Created by Administrator on 2014/5/22.
 */

var CMD_STATE_DISABLED = 0;
var CMD_STATE_ENABLE = 1;

var CommandLayer = cc.Layer.extend({
    _headSprite:null,
    _tailSprite:null,

    ctor: function ( menuItems ) {
        this._super( menuItems );
        cc.log("CommandMenu ctor");
        this._headSprite = cc.Sprite.create( s_CommandMenuHead );
        this._tailSprite = cc.Sprite.create( s_CommandMenuTail );

        this._headSprite.setAnchorPoint( 0.5, 0 );
        this._tailSprite.setAnchorPoint( 0.5, 1 );
        this._headSprite.setPosition( 0, 0 );
        this._tailSprite.setPosition( 0, 0 );

        this.addChild( this._headSprite, 0 );
        this.addChild( this._tailSprite, 0 );
    }
})