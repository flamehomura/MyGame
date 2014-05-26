/**
 * Created by Administrator on 2014/5/26.
 */

var MAP_OBJ_GRASS = 0;
var MAP_OBJ_FOREST = 1;
var MAP_OBJ_RIVER = 2;
var MAP_OBJ_WALL = 3;

var g_MapObjInfo = [
    {
        // MAP_OBJ_GRASS
        movepasscost:1,
        attackpasscost:1
    },
    {
        // MAP_OBJ_FOREST
        movepasscost:2,
        attackpasscost:1
    },
    {
        // MAP_OBJ_RIVER
        movepasscost:-1,
        attackpasscost:1
    },
    {
        // MAP_OBJ_WALL
        movepasscost:-1,
        attackpasscost:-1
    },
]

var MapSprite = cc.Sprite.extend({
    _mappos: null,
    _objtype: 0,

    _mapflagitem: null,
    _mapcharitem: null,

    setMapPosition: function( row, column )
    {
        this._mappos = new cc.Point( row, column );
    },

    setType: function( type )
    {
        this._objtype = type;
    },

    getMovePassCost: function()
    {
        if( this._objtype >= 0 && this._objtype < g_MapObjInfo.length )
        {
            return g_MapObjInfo[this._objtype].movepasscost;
        }

        return 0;
    },

    getAttackPassCost: function()
    {
        if( this._objtype >= 0 && this._objtype < g_MapObjInfo.length )
        {
            return g_MapObjInfo[this._objtype].attackpasscost;
        }

        return 0;
    },

    setMapFlagItem: function( flag )
    {
        this._mapflagitem = flag;
    },

    getMapFlagItem: function()
    {
        return this._mapflagitem;
    },

    setMapCharItem: function( char )
    {
        this._mapcharitem = char;
    },

    getMapCharItem: function()
    {
        return this._mapcharitem;
    }
})
