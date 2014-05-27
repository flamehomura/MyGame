/**
 * Created by Administrator on 2014/5/25.
 */

var MAP_ITEM_MOVEFLAG = 0;
var MAP_ITEM_ATTACKFLAG = 1;
var MAP_ITEM_SKILLFLAG = 2;
var MAP_ITEM_CHAR = 10;

var MapItemSprite = cc.Sprite.extend({
    _maprow: -1,
    _mapcolumn: -1,
    _enabled: false,
    _itemtype: -1,
    _pathpoints: [],

    _itemcallback: null,
    _itemcallbacktarget: null,

/*    ctor: function()
    {
        this._pathpoints = new Array();
    },*/

    rect:function ()
    {
        return cc.rect( 0, 0, this._rect.width, this._rect.height );
    },

    clear: function()
    {
        _maprow = -1;
        _mapcolumn = -1;
        _enabled = false;
        _pathpoints = [];
    },

    setMapPosition: function( row, column )
    {
        this._maprow = row;
        this._mapcolumn = column;
    },

    initCallBack: function( callback, target )
    {
        this._itemcallback = callback;
        this._itemcallbacktarget = target;

        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: this.onTouchBegan,
            onTouchMoved: this.onTouchMoved,
            onTouchEnded: this.onTouchEnded
        }, this);
    },

    setEnabled: function( enable )
    {
        this._enabled = enable;
    },

    isEnabled: function()
    {
        return this._enabled;
    },

    initWithItemType: function( type )
    {
        this._itemtype = type;

        this._pathpoints = new Array();
    },

    getItemType: function()
    {
        return this._itemtype;
    },

    getMapRow: function()
    {
        return this._maprow;
    },

    getMapColumn: function()
    {
        return this._mapcolumn;
    },

    getMapPosition: function()
    {
        return new cc.Point( this._maprow, this._mapcolumn );
    },

    setPathPoints: function( path )
    {
        if( this._pathpoints.length > 0 && path.length < this._pathpoints.length )
        {
            this._pathpoints = [];
        }

        for( var i = 0; i < path.length; ++i )
        {
            for( var j = 0; j < this._pathpoints.length; ++j )
            {
                if( this._pathpoints[j].x == path[i].x && this._pathpoints[j].y == path[i].y )
                {
                    this._pathpoints.splice( j, this._pathpoints.length - j );
                }
            }
            this._pathpoints.push( path[i] );
        }
    },

    getPathPoints: function()
    {
        return this._pathpoints;
    },

    activate: function()
    {
        if( this.isEnabled() )
        {
            var locTarget = this._itemcallbacktarget;
            var locCallback = this._itemcallback;

            if( !locCallback )
            {
                return;
            }

            if( locTarget && ( typeof(locCallback) == "string" ) )
            {
                locTarget[locCallback]( this );
            }
            else if ( locTarget && ( typeof( locCallback ) == "function" ) )
            {
                locCallback.call( locTarget, this );
            }
            else
            {
                locCallback( this );
            }
        }
    },

    containsTouchLocation:function( touch )
    {
        var getPoint = touch.getLocation();
        getPoint = this.convertToNodeSpace( getPoint );

        var myRect = this.rect();

        return cc.rectContainsPoint( myRect, getPoint );
    },

    onTouchBegan: function( touch, event )
    {
        var target = event.getCurrentTarget();
        if( !target.isVisible() )
        {
            return false;
        }

        if( !target.containsTouchLocation( touch ) )
        {
            return false;
        }

        target.activate();

        return true;
    },

    onTouchMoved: function( touch, event )
    {

    },

    onTouchEnded: function( touch, event )
    {

    }
})