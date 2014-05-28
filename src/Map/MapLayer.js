/**
 * Created by Administrator on 2014/5/24.
 */

var MAP_ITEM_WIDTH = 64
var MAP_ITEM_HEIGHT = 64

var MOVE_DURATION_PER_STEP = 0.5

var MOVE_DIR_NONE = 0;
var MOVE_DIR_FORWARD = 1;
var MOVE_DIR_BACKWARD = 2;
var MOVE_DIR_LEFT = 3;
var MOVE_DIR_RIGHT = 4;

var COMMANDMENU_WIDTH = 2;
var COMMANDMENU_HEIGHT = 3;

var MapLayer = cc.Layer.extend({
    _row: 0,
    _column: 0,

    _enabled: false,

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
    _commandMenu: null,

    _curMovePath: [],
    _curMovingPath: [],
    _curMoveStep: 0,
    _curCost: 0,

    ctor: function( row, column )
    {
        cc.Layer.prototype.ctor.call( this );

        this._row = row;
        this._column = column;
    },

    setEnabled: function( enabled )
    {
        this._enabled = enabled;
    },

    isEnabled: function()
    {
        return this._enabled;
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

//                if( iRow == 2 )
//                {
//                    item.setType( MAP_OBJ_FOREST );
//                }
            }
        }

        this.setEnabled( true );
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

    initChars: function()
    {
        var char1 = new CharSprite();
        char1.initWithFile( s_MainChar );
        char1.setAnchorPoint( 0.5, 0.5 );
        char1.setTeam( 0 );
        char1.initCallBack( this.onCharSelected, this );
        this._mapChars.push( char1 );
        char1.setMapIndex( this._mapChars.length - 1 );

        var char2 = new CharSprite();
        char2.initWithFile( s_MainCharEnemy );
        char2.setAnchorPoint( 0.5, 0.5 );
        char2.setTeam( 1 );
        char2.initCallBack( this.onCharSelected, this );
        this._mapChars.push( char2 );
        char2.setMapIndex( this._mapChars.length - 1 );

        this.addChar( 0, 0, 6 );
        this.addChar( 1, 7, 5 );
    },

    addChar: function( charindex, row, column )
    {
        if( charindex >= this._mapChars.length )
        {
            return;
        }

        if( !this.checkMapRow( row ) || !( this.checkMapColumn( column ) ) )
        {
            return;
        }

        var char = this._mapChars[charindex];
        char.setPosition( this.getMapItemPos( row, column ) );
        char.setEnabled( true );
        this.addChild( char, g_GameZOrder.char );
        this.setCharMapPosition( char, row, column );
        //this._curChar = char;
    },

    clearCharMapPosition: function( char )
    {
        var prerow , precolumn;

        prerow = char.getMapRow();
        precolumn = char.getMapColumn();

        var mapsprite = this.getMapSprite( prerow, precolumn );
        if( mapsprite )
        {
            mapsprite.setMapCharItem( null );
        }
    },

    setCharMapPosition: function( char, row, column )
    {
        var mapsprite = this.getMapSprite( row, column );
        if( mapsprite )
        {
            mapsprite.setMapCharItem( char );
        }

        char.setMapPosition( row, column );
    },

    addCommandMenu: function( row, column )
    {
        if( !this.checkMapRow( row ) || !( this.checkMapColumn( column ) ) )
        {
            return;
        }

        if( this._commandMenu == null )
        {
            this._commandMenu = new CommandLayer();
            this.addChild( this._commandMenu, g_GameZOrder.ui );

            for( var i = 0; i < cmdMenuItems.length; ++i ){
                var tempMenu = new CommandMenuItem(
                    cmdMenuItems[i].title,
                    cmdMenuItems[i].command,
                    this
                )

                this._commandMenu.addCommandItem( tempMenu );
            }
        }
        this._commandMenu.setVisible( true );
        this._commandMenu.setPosition( this.getMapItemPos( row, column ) );
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
        this._curMovePath = [];

        this.addMoveRangeFrom( row, column, true, this._curChar );
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
                if( !this._mapMoveItems[itemidx].isVisible() )
                {
                    continue;
                }

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
        else
        {
            this._curMovePath.push( new cc.Point( row, column ) );
            mapsprite.getMapFlagItem().setPathPoints( this._curMovePath );
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
            var item = new MapItemSprite();
            item.initWithFile( s_MapMoveRange );
            item.initWithItemType( MAP_ITEM_MOVEFLAG );
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
            var item = new MapItemSprite();
            item.initWithFile( s_MapAttackRange );
            item.initWithItemType( MAP_ITEM_ATTACKFLAG );
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
            var item = new MapItemSprite();
            item.initWithFile( s_MapSkillRange );
            item.initWithItemType( MAP_ITEM_SKILLFLAG );
            item.setAnchorPoint( 0.5, 0.5 );
            item.setPosition( this.getMapItemPos( row, column ) );
            item.setMapPosition( row, column );
            this.addChild( item, g_GameZOrder.mapitem );

            this._mapSkillItems.push( item );
        }

        ++this._mapSkillItemIndex;
    },

    onCharSelected: function( targetchar )
    {
        if( targetchar instanceof CharSprite )
        {
            this.clearMapFlags();
            this._curChar = targetchar;

            this.displayCommandMenuForChar();
//            this.displayMoveRangeForChar();
//            this.displayAttackRangeForChar();
        }
    },

    displayCommandMenuForChar: function()
    {
        if( !this._curChar )
        {
            return;
        }

        var charrow = this._curChar.getMapRow();
        var charcolumn = this._curChar.getMapColumn();

        var cmdrow, cmdcolumn;

        if( this._row - charrow - 1 >= COMMANDMENU_HEIGHT )
        {
            cmdrow = charrow + COMMANDMENU_HEIGHT;
        }
        else
        {
            cmdrow = charrow;
        }

        if( this._column - charcolumn - 1 >= COMMANDMENU_WIDTH )
        {
            cmdcolumn = charcolumn + COMMANDMENU_WIDTH;
        }
        else
        {
            cmdcolumn = charcolumn - COMMANDMENU_WIDTH;
        }

        if( this.checkMapRow( cmdrow ) && this.checkMapColumn( cmdcolumn ) )
        {
            this.addCommandMenu( cmdrow, cmdcolumn );
        }
    },

    clearMapFlags: function()
    {
        for( var i = 0; i < this._mapMoveItems.length; ++i )
        {
            var row = this._mapMoveItems[i].getMapRow();
            var column = this._mapMoveItems[i].getMapColumn();

            this._mapMoveItems[i].clearinfo();

            var mapsprite = this.getMapSprite( row, column );
            if( mapsprite )
            {
                mapsprite.setMapFlagItem( null );
            }
        }
        this._mapMoveItemIndex = 0;

        for( var i = 0; i < this._mapAttackItems.length; ++i )
        {
            var mapsprite = this.getMapSprite( this._mapAttackItems[i].getMapRow(), this._mapAttackItems[i].getMapColumn() );
            if( mapsprite )
            {
                mapsprite.setMapFlagItem( null );
            }
            this._mapAttackItems[i].clearinfo();
        }
        this._mapAttackItemIndex = 0;
    },

    onCharMove: function( moveTarget )
    {
        if( moveTarget.getPathPoints().length > 0 )
        {
            this._curMovingPath = [];
            var tempPath = moveTarget.getPathPoints();
            for( var i = 0; i < tempPath.length; ++i )
            {
                this._curMovingPath.push( tempPath[i] );
            }
            this._curMoveStep = 0;

            this.setEnabled( false );
            this.clearMapFlags();
            this.clearCharMapPosition( this._curChar );
            this.schedule( this.onCharMoving, MOVE_DURATION_PER_STEP );
            this.onCharMoving();
        }
    },

    onCharMoving: function()
    {
        var path = this._curMovingPath[this._curMoveStep];

        this._curChar.setRotationToPos( path.x, path.y );
        this._curChar.stopAllActions();
        this._curChar.runAction( cc.MoveTo.create( MOVE_DURATION_PER_STEP, this.getMapItemPos( path.x, path.y ) ) );
        this._curChar.setMapPosition( path.x, path.y );

        ++this._curMoveStep;
        if( this._curMoveStep >= this._curMovingPath.length )
        {
            this.unschedule( this.onCharMoving );
            this._curMovingPath = [];

            this.setCharMapPosition( this._curChar, path.x, path.y );
            this.setEnabled( true );
        }
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
    },

    onMoveCmd: function()
    {
        this._commandMenu.setVisible( false );
        if( this._curChar )
        {
            this.displayMoveRangeForChar();
            //this.displayAttackRangeForChar();
        }
    },

    onAttackCmd: function()
    {
        this._commandMenu.setVisible( false );
    },

    onDefenceCmd: function()
    {
        this._commandMenu.setVisible( false );
    },

    onSkillCmd: function()
    {
        this._commandMenu.setVisible( false );
    },

    onItemCmd: function()
    {
        this._commandMenu.setVisible( false );
    }
})

var cmdMenuItems = [
    {
        title:"移动",
        command:"onMoveCmd"
    },
    {
        title:"攻击",
        command:"onMoveCmd"
    },
    {
        title:"防御",
        command:"onMoveCmd"
    },
    {
        title:"特技",
        command:"onMoveCmd"
    },
    {
        title:"道具",
        command:"onMoveCmd"
    }
]