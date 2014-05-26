/**
 * Created by Administrator on 2014/5/24.
 */

var MAP_ITEM_WIDTH = 64
var MAP_ITEM_HEIGHT = 64

var MapLayer = cc.Layer.extend({
    _row: 0,
    _column: 0,

    _mapItems: [],
    _mapChars: [],
    _mapItemStartX: 0,
    _mapItemStartY: 0,
    _mapMoveItems: [],
    _mapMoveItemIndex: 0,
    _mapAttackItems: [],
    _mapAttackItemIndex: 0,
    _mapSkillItems: [],
    _mapSkillItemIndex: 0,

    _curChar: null,

    _curMovePath: [],
    _curCost: 0,

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

        this._mapItemStartX =  0 - MAP_ITEM_WIDTH * ( this._column - 1 ) / 2;
        this._mapItemStartY = 0 - MAP_ITEM_HEIGHT * ( this._row - 1 ) / 2;

        for( var iRow = 0; iRow < this._row; ++iRow )
        {
            for( var iColumn = 0; iColumn < this._column; ++iColumn )
            {
                var item = new MapSprite( s_MapGrass );
                item.setAnchorPoint( 0.5, 0.5 );
                item.setScale( MAP_ITEM_WIDTH / item.getContentSize().width, MAP_ITEM_HEIGHT / item.getContentSize().height );
                item.setPosition( this.getMapItemPos( iRow, iColumn ) );
                this._mapItems.push( item );
                this.addChild( item, g_GameZOrder.map );

                item.setMapPosition( iRow, iColumn );
                item.setType( MAP_OBJ_GRASS );

                if( iRow == 2 )
                {
                    item.setType( MAP_OBJ_FOREST );
                }
            }
        }
    },

    getMapSprite: function( row, column )
    {
        if( this.checkMapRow( row ) && this.checkMapColumn( column ) )
        {
            if( this._mapItems.length > row * this._column + column )
            {
                return this._mapItems[row * this._column + column];
            }
        }

        return null;
    },

    checkMapRow: function( row )
    {
        return row >= 0 && row < this._row;
    },

    checkMapColumn: function( column )
    {
        return column >= 0 && column < this._column;
    },

    addChar: function( row, column )
    {
        if( !this.checkMapRow( row ) || !( this.checkMapColumn( column ) ) )
        {
            return;
        }

        var char = new CharSprite();
        char.setAnchorPoint( 0.5, 0.5 );
        char.setPosition( this.getMapItemPos( row, column ) );
        this.addChild( char, g_GameZOrder.char );

        this._mapChars.push( char );
        char.setMapIndex( this._mapChars.length - 1 );
        char.setTeam( 0 );

        this.setCharMapPosition( char, row, column );
        this._curChar = char;
    },

    setCharMapPosition: function( char, row, column )
    {
        var prerow , precolumn;

        prerow = char.getMapRow();
        precolumn = char.getMapColumn();

        var mapsprite = this.getMapSprite( prerow, precolumn );
        if( mapsprite )
        {
            mapsprite.setMapCharItem( null );
        }

        mapsprite = this.getMapSprite( row, column );
        if( mapsprite )
        {
            mapsprite.setMapCharItem( char );
        }

        char.setMapPosition( row, column );
    },

    addCommandBar: function( row, column )
    {
        if( !this.checkMapRow( row ) || !( this.checkMapColumn( column ) ) )
        {
            return;
        }

        var cmd = new CommandLayer();
        cmd.setPosition( this.getMapItemPos( row, column ) );
        this.addChild( cmd, g_GameZOrder.ui );

        for( var i = 0; i < cmdMenuItems.length; ++i ){
            var tempMenu = new CommandMenuItem(
                cmdMenuItems[i].title,
                cmdMenuItems[i].command,
                this
            )

            cmd.addCommandItem( tempMenu );
        }
    },

    displayMoveRangeForChar: function()
    {
        if( !this._curChar )
        {
            return;
        }

        this._curCost = 0;
        var row = this._curChar.getMapRow();
        var column = this._curChar.getMapColumn();

        this.addMoveRangeFrom( row, column, true, this._curChar  );
    },

    displayAttackRangeForChar: function()
    {
        if( !this._curChar )
        {
            return;
        }

        if( this._mapMoveItems.length > 0 )
        {
            for( var itemidx = 0; itemidx < this._mapMoveItems.length; ++itemidx )
            {
                this._curCost = 0;
                this.addAttackRangeFrom( this._mapMoveItems[itemidx].getMapRow(),
                    this._mapMoveItems[itemidx].getMapColumn(),
                    true,
                    this._curChar,
                    this._mapMoveItems[itemidx] );
            }
        }
        else
        {
            this._curCost = 0;
            this.addAttackRangeFrom( this._curChar.getMapRow(), this._curChar.getMapColumn(), true, this._curChar, null );
        }
    },

    addMoveRangeFrom: function( row, column, firststep, char )
    {
        if( !this.checkMapRow( row ) || !this.checkMapColumn( column ) )
        {
            return;
        }

        var mapsprite = this.getMapSprite( row, column );
        var passcost = mapsprite.getMovePassCost();
        if( passcost < 0 )
        {
            return;
        }

        var anotherchar = mapsprite.getMapCharItem();
        if( anotherchar && anotherchar.getTeam() != char.getTeam() )
        {
            return;
        }

        if( !firststep && row == this._curChar.getMapRow() && column == this._curChar.getMapColumn() )
        {
            return;
        }

        if( !mapsprite.getMapFlagItem() )
        {
            if( row != this._curChar.getMapRow() || column != this._curChar.getMapColumn() )
            {
                this._curMovePath.push( new cc.Point( row, column ) );
                this.addMoveRangeAt( row, column );
            }
        }

        this._curCost += passcost;
        if( this._curCost > char.getMoveRange() )
        {
            return;
        }

        // 4 dir
        var tempcost = this._curCost;
        var temppathlength = this._curMovePath.length;
        this.addMoveRangeFrom( row + 1, column, false, char );

        this._curCost = tempcost;
        if( this._curMovePath.length > temppathlength )
        {
            this._curMovePath.splice( temppathlength, this._curMovePath.length - temppathlength );
        }
        this.addMoveRangeFrom( row - 1, column, false, char );

        this._curCost = tempcost;
        if( this._curMovePath.length > temppathlength )
        {
            this._curMovePath.splice( temppathlength, this._curMovePath.length - temppathlength );
        }
        this.addMoveRangeFrom( row, column + 1, false, char );

        this._curCost = tempcost;
        if( this._curMovePath.length > temppathlength )
        {
            this._curMovePath.splice( temppathlength, this._curMovePath.length - temppathlength );
        }
        this.addMoveRangeFrom( row, column - 1, false, char );
    },

    addMoveRangeAt: function( row, column )
    {
        if( !this.checkMapRow( row ) || !( this.checkMapColumn( column ) ) )
        {
            return;
        }

        if( this._mapMoveItemIndex >= this._mapMoveItems.length )
        {
            var item = new MapItemSprite( s_MapMoveRange );
            item.setItemType( MAP_ITEM_MOVEFLAG );
            item.setAnchorPoint( 0.5, 0.5 );
            item.initCallBack( this.onCharMove, this );
            this.addChild( item, g_GameZOrder.mapitem );

            this._mapMoveItems.push( item );
        }

        this._mapMoveItems[this._mapMoveItemIndex].setPosition( this.getMapItemPos( row, column ) );
        this._mapMoveItems[this._mapMoveItemIndex].setMapPosition( row, column );
        this._mapMoveItems[this._mapMoveItemIndex].setVisible( true );
        this._mapMoveItems[this._mapMoveItemIndex].setEnabled( true );
        this._mapMoveItems[this._mapMoveItemIndex].setPathPoints( this._curMovePath );

        var mapsprite = this.getMapSprite( row, column );
        if( mapsprite )
        {
            mapsprite.setMapFlagItem( this._mapMoveItems[this._mapMoveItemIndex] );
        }

        ++this._mapMoveItemIndex;
    },

    addAttackRangeFrom: function( row, column, firststep, char, moveflag )
    {
        if( !this.checkMapRow( row ) || !this.checkMapColumn( column ) )
        {
            return;
        }

        var mapsprite = this.getMapSprite( row, column );
        var passcost = mapsprite.getAttackPassCost();
        if( passcost < 0 )
        {
            return;
        }

        var anotherchar = mapsprite.getMapCharItem();
        if( anotherchar && anotherchar.getTeam() == char.getTeam() )
        {
            return;
        }

        if( !firststep && row == this._curChar.getMapRow() && column == this._curChar.getMapColumn() )
        {
            return;
        }

        if( !mapsprite.getMapFlagItem() )
        {
            if( row != this._curChar.getMapRow() || column != this._curChar.getMapColumn() )
            {
                this.addAttackRangeAt( row, column, moveflag );
            }
        }

        this._curCost += passcost;
        if( this._curCost > char.getAttackRange() )
        {
            return;
        }

        // 4 dir
        var tempcost = this._curCost;
        this.addAttackRangeFrom( row + 1, column, false, char, moveflag );
        this._curCost = tempcost;
        this.addAttackRangeFrom( row - 1, column, false, char, moveflag );
        this._curCost = tempcost;
        this.addAttackRangeFrom( row, column + 1, false, char, moveflag );
        this._curCost = tempcost;
        this.addAttackRangeFrom( row, column - 1, false, char, moveflag );
    },

    addAttackRangeAt: function( row, column, moveflag )
    {
        if( !this.checkMapRow( row ) || !( this.checkMapColumn( column ) ) )
        {
            return;
        }

        if( this._mapAttackItemIndex >= this._mapAttackItems.length )
        {
            var item = new MapItemSprite( s_MapAttackRange );
            item.setItemType( MAP_ITEM_ATTACKFLAG );
            item.setAnchorPoint( 0.5, 0.5 );
            this.addChild( item, g_GameZOrder.mapitem );

            this._mapAttackItems.push( item );
        }

        this._mapAttackItems[this._mapAttackItemIndex].setPosition( this.getMapItemPos( row, column ) );
        this._mapAttackItems[this._mapAttackItemIndex].setMapPosition( row, column );
        this._mapAttackItems[this._mapAttackItemIndex].setVisible( true );
        this._mapAttackItems[this._mapAttackItemIndex].setEnabled( true );
        if( moveflag )
        {
            this._mapAttackItems[this._mapAttackItemIndex].setPathPoints( moveflag.getPathPoints() );
        }

        var mapsprite = this.getMapSprite( row, column );
        if( mapsprite )
        {
            mapsprite.setMapFlagItem( this._mapAttackItems[this._mapAttackItemIndex] );
        }

        ++this._mapAttackItemIndex;
    },

    addSkillRangeAt: function( row, column )
    {
        if( !this.checkMapRow( row ) || !( this.checkMapColumn( column ) ) )
        {
            return;
        }

        if( this._mapSkillItemIndex < this._mapSkillItems.length )
        {
            this._mapSkillItems[this._mapSkillItemIndex].setPosition( this.getMapItemPos( row, column ) );
            this._mapSkillItems[this._mapSkillItemIndex].setMapPosition( row, column );
            this._mapSkillItems[this._mapSkillItemIndex].setVisible( true );
        }
        else
        {
            var item = new MapItemSprite( s_MapSkillRange );
            item.setAnchorPoint( 0.5, 0.5 );
            item.setPosition( this.getMapItemPos( row, column ) );
            item.setMapPosition( row, column );
            this.addChild( item, g_GameZOrder.mapitem );

            this._mapSkillItems.push( item );
        }

        ++this._mapSkillItemIndex;
    },

    onCharMove: function( moveTarget )
    {
        //moveTarget.setVisible( false );

        //this._curChar.stopAllActions();
        //this._curChar.runAction( cc.MoveTo.create( 1, this.getMapItemPos( moveTarget.getMapRow(), moveTarget.getMapColumn() ) ) );
        var temp = 0;
        //temp.setPosition( 1, 3 );
        cc.log( temp );
        this.tempfunc( temp );
        cc.log( temp );

    },

    tempfunc: function( temp )
    {
        temp = 3;
    },

    getMovePath: function( rowfrom, columnfrom, rowto, columnto )
    {
        _curMovePath = [];

        var bRowPrior = true;
        if( Math.abs( columnto - columnfrom ) > Math.abs( rowto - rowfrom ) )
        {
            bRowPrior = false;
        }


    },

    checkMovePath: function( row, column, rowgoal, columngoal, rowprior )
    {
        if( this.checkMovePass( row, column ) )
        {
            var pos = new cc.Point( row, column );
            var prepos;
            if( this._curMovePath.length > 0 )
            {
                prepos = this._curMovePath[this._curMovePath.length - 1];
            }

            if( this._curMovePath.length >= 2 )
            {
                if( cc.pointEqualToPoint( pos, this._curMovePath[this._curMovePath.length - 2] ) )
                {
                    this._curMovePath.pop();
                }
                else
                {
                    this._curMovePath.push( pos );
                }
            }
            else
            {
                this._curMovePath.push( pos );
            }

            if( row == rowgoal && column == columngoal )
            {
                return true;
            }

            var rowdir = ( rowgoal - row ) / Math.abs( rowgoal - row );
            var columedir = ( columngoal - column ) / Math.abs( columngoal - column );
            if( rowprior )
            {
                pos.x = row + rowdir;
                pos.y = column;
                if( !cc.pointEqualToPoint( pos, prepos ) &&
                    this.checkMovePath( row + rowdir, column, rowgoal, columngoal, rowprior ) )
                {
                    return true;
                }

                pos.x = row;
                pos.y = column + columedir;
                if( !cc.pointEqualToPoint( pos, prepos ) &&
                    this.checkMovePath( row, column + columedir, rowgoal, columngoal, rowprior ) )
                {
                    return true;
                }

                pos.x = row;
                pos.y = column - columedir;
                if( !cc.pointEqualToPoint( pos, prepos ) &&
                    this.checkMovePath( row, column - columedir, rowgoal, columngoal, rowprior ) )
                {
                    return true;
                }

                pos.x = row - rowdir;
                pos.y = column;
                if( !cc.pointEqualToPoint( pos, prepos ) &&
                    this.checkMovePath( row - rowdir, column, rowgoal, columngoal, rowprior ) )
                {
                    return true;
                }
            }
        }

        return false;
    },

    checkMovePass: function( row, column )
    {
        return true;
    },

    getMapItemPos: function( row, column )
    {
        var pos = new cc.Point();

        if( !this.checkMapRow( row ) || !( this.checkMapColumn( column ) ) )
        {
            return pos;
        }

        pos.x = this._mapItemStartX + MAP_ITEM_WIDTH * column;
        pos.y = this._mapItemStartY + MAP_ITEM_HEIGHT * row;

        return pos;
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