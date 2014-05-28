/**
 * Created by Administrator on 2014/5/22.
 */

var CMD_STATE_DISABLED = 0;
var CMD_STATE_ENABLE = 1;

var CommandMenuItem = cc.MenuItemLabel.extend({
    _bgsprite: null,
    _bgwidth: 0,
    _bgheight: 0,

    ctor: function ( string, selector, target ){
        this._bgsprite = cc.Sprite.create( s_CommandMenuItemBg );
        this._bgwidth = this._bgsprite.width;
        this._bgheight = this._bgsprite.height;

        var label = cc.LabelTTF.create( string, "微软雅黑", 24 );
        cc.MenuItemLabel.prototype.ctor.call( this, label, selector, target );

        this._bgsprite.setAnchorPoint( 0.5, 0.5 );
        this._bgsprite.setPosition( this.width / 2, this.height / 2 );
        this.addChild( this._bgsprite, g_GameZOrder.bg );
    },

    setLabel: function( label ) {
        if( label ) {
            this.addChild( label, g_GameZOrder.ui );
            label.setAnchorPoint( 0.5, 0.5 );
            this.width = this._bgwidth;
            this.height = this._bgheight;
            label.setPosition( this.width / 2, this.height / 2 )
        }

        if (this._label) {
            this.removeChild(this._label, true);
        }

        this._label = label;
    },

    selected: function ()
    {
        if( this._enabled )
        {
            cc.MenuItem.prototype.selected.call(this);
        }
    },

    activate: function ()
    {
        if( this._enabled )
        {
            cc.MenuItem.prototype.activate.call(this);
        }
    }
})