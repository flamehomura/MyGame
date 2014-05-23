/**
 * Created by Administrator on 2014/5/24.
 */

var MAP_ITEM_WIDTH = 64
var MAP_ITEM_HEIGHT = 64

var MapLayer = cc.Layer.extend({
    _row: 0,
    _column: 0,
    _mapItems: [],
    _mapItemStartX: 0,
    _mapItemStartY: 0,

    ctor: function( row, column )
    {
        cc.Layer.prototype.ctor.call( this );

        this._row = row;
        this._column = column;
    },

    createMap: function()
    {
        if( this._row == 0 || this._column == 0 )
        {
            return;
        }

        var itemX = 0 - MAP_ITEM_WIDTH * ( this._column - 1 ) / 2
        var itemY = 0 - MAP_ITEM_HEIGHT * ( this._row - 1 ) / 2;
        this._mapItemStartX = itemX;
        this._mapItemStartY = itemY;

        for( var iRow = 0; iRow < this._row; ++iRow )
        {
            var itemX = this._mapItemStartX;

            for( var iColumn = 0; iColumn < this._column; ++iColumn )
            {
                var item = cc.Sprite.create( s_MapGrass );
                item.setAnchorPoint( 0.5, 0.5 );
                item.setScale( MAP_ITEM_WIDTH / item.getContentSize().width, MAP_ITEM_HEIGHT / item.getContentSize().height );
                item.setPosition( itemX, itemY );
                this._mapItems.push( item );
                this.addChild( item, g_GameZOrder.bg );

                itemX += MAP_ITEM_WIDTH;
            }

            itemY += MAP_ITEM_HEIGHT;
        }
    },

    addChar: function( row, column )
    {
        if( row > this._row || column > this._column )
        {
            return;
        }

        var PosX = this._mapItemStartX + MAP_ITEM_WIDTH * column;
        var PosY = this._mapItemStartY + MAP_ITEM_HEIGHT * row;

        var char = new CharSprite();
        char.setAnchorPoint( 0.5, 0.5 );
        char.setPosition( PosX, PosY );
        char.setTeam( 1 );
        this.addChild( char, g_GameZOrder.char );
    },

    addCommandBar: function( row, column )
    {
        if( row > this._row || column > this._column )
        {
            return;
        }

        var PosX = this._mapItemStartX + MAP_ITEM_WIDTH * column;
        var PosY = this._mapItemStartY + MAP_ITEM_HEIGHT * row;

        var cmd = new CommandLayer();
        cmd.setPosition( PosX, PosY );
        this.addChild( cmd, g_GameZOrder.ui );

        for( var i = 0; i < cmdMenuItems.length; ++i ){
            var tempMenu = new CommandMenuItem(
                cmdMenuItems[i].title,
                cmdMenuItems[i].command,
                this
            )

            cmd.addCommandItem( tempMenu );
        }
    }
})

var cmdMenuItems = [
    {
        title:"移动",
        command:function(){ cc.log( "Move Cmd" ) }
    },
    {
        title:"攻击",
        command:function(){ cc.log( "Attack Cmd" ) }
    },
    {
        title:"防御",
        command:function(){ cc.log( "Defence Cmd" ) }
    },
    {
        title:"特技",
        command:function(){ cc.log( "Skill Cmd" ) }
    },
    {
        title:"道具",
        command:function(){ cc.log( "Item Cmd" ) }
    }
]