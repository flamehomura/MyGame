/**
 * Created by Administrator on 2014/5/21.
 */

var STATE_GRABBED = 0;
var STATE_UNGRABBED = 1;

var TEAM_BLUE = 0;
var TEAM_RED = 1;
var TEAM_YELLOW = 2;

var ROTATION_UP = 0;
var ROTATION_DOWN = 180;
var ROTATION_LEFT = 270;
var ROTATION_RIGHT = 90;

var ACTION_INIT = 0;
var ACTION_MOVED = 1;
var ACTION_ATTACKED = 2;

var ACTION_SEQUENCE_MAX_VALUE = 10000;

var CharSprite = MapItemSprite.extend({
        _state: STATE_UNGRABBED,
        _rect: null,
        _rotangle: 0,

        _teamid: -1,
        _mapindex: -1,

        _moverange: 4,
        _attackrange: 1,

        _actionstate: ACTION_INIT,

        _healthpiont: 0,
        _magicpiont: 0,
        _firepiont: 0,
        _earthpiont: 0,
        _windpiont: 0,
        _waterpiont: 0,
        _thunderpiont: 0,

        _inDefence: false,

        ctor: function ()
        {
            this._super();
            this.initWithItemType( MAP_ITEM_CHAR );
        },

        setTeam: function( teamid )
        {
            this._teamid = teamid;

            var teamImage;
            switch( this._teamid )
            {
                case TEAM_BLUE:
                    teamImage = s_CharBlueTeam;
                    this.setRotation( ROTATION_UP );
                    break;
                case TEAM_RED:
                    teamImage = s_CharRedTeam;
                    this.setRotation( ROTATION_DOWN );
                    break;
                case TEAM_YELLOW:
                    teamImage = s_CharYellowTeam;
                    break;
                default:
                    return;
            }

            var teamSprite = cc.Sprite.create( teamImage );
            teamSprite.setAnchorPoint( 0.5, 0.5 );
            teamSprite.setPosition( this.width / 2, this.height / 2 );
            this.addChild( teamSprite, g_GameZOrder.charteam );
        },

        setRotationToPos: function( row, column )
        {
            var deltarow = row - this._maprow;
            var deltacolumn = column - this._mapcolumn;

            if( Math.abs( deltarow ) >= Math.abs( deltacolumn ) )
            {
                if( deltarow < 0 )
                {
                    this._rotangle = ROTATION_DOWN;
                }
                else if( deltarow > 0)
                {
                    this._rotangle = ROTATION_UP;
                }
            }
            else
            {
                if( deltacolumn > 0 )
                {
                    this._rotangle = ROTATION_RIGHT;
                }
                else if( deltacolumn < 0 )
                {
                    this._rotangle = ROTATION_LEFT;
                }
            }



            this.setRotation( this._rotangle );
        },

        getRotationPoint: function()
        {
            var posX = 0, posY = 0;
            if( this._rotangle == ROTATION_UP )
            {
                posY = 1;
            }
            else if( this._rotangle == ROTATION_DOWN )
            {
                posY = -1;
            }
            else if( this._rotangle == ROTATION_LEFT )
            {
                posX = -1;
            }
            else if( this._rotangle == ROTATION_RIGHT )
            {
                posX = 1;
            }

            return cc.p( posX, posY );
        },

        getTeam: function()
        {
            return this._teamid;
        },

        setMapIndex: function( index )
        {
            this._mapindex = index;
        },

        getMapIndex: function()
        {
            return this._mapindex;
        },

        setMoveRange: function( range )
        {
            this._moverange = range;
        },

        getMoveRange: function()
        {
            return this._moverange;
        },

        setAttackRange: function( range )
        {
            this._attackrange = range;
        },

        getAttackRange: function()
        {
            return this._attackrange;
        },

        setActionState: function( action )
        {
            this._actionstate = action;
        },

        getActionState: function()
        {
            return  this._actionstate;
        },

        setEnabled: function( enabled )
        {
            this._super( enabled );

            if( this._enabled )
            {
                this.setColor( cc.color( 255, 255, 255, 255 ) );
            }
            else
            {
                if( !this._inDefence )
                {
                    this.setColor( cc.color( 127, 127, 127, 255 ) );
                }
            }
        },

        setDefence: function()
        {
            this.setColor( cc.color( 0, 127, 0, 255 ) );
            this._inDefence = true;
        },

        touchStateCheck: function()
        {
            if( this._teamid != 0 )
            {
                return false;
            }

            var map = this.parent;

            var mapscript = map.getMapSprite( this._maprow, this._mapcolumn );
            if( mapscript )
            {
                var mapflag = mapscript.getMapFlagItem();
                if( mapflag )
                {
                    if( mapflag.getItemType() == MAP_ITEM_ATTACKFLAG )
                    {
                        return false;
                    }
                }
            }

            return true;
        },

        // battle value
        setHealthPoint: function( point )
        {
            this._healthpiont = point;
        },

        getHealthPoint: function()
        {
            return this._healthpiont;
        },

        setMagicPoint: function( point )
        {
            this._magicpiont = point;
        },

        getMagicPoint: function()
        {
            return this._magicpiont;
        },

        setFirePoint: function( point )
        {
            this._firepiont = point;
        },

        getFirePoint: function()
        {
            return this._firepiont;
        },

        setEarthPoint: function( point )
        {
            this._earthpiont = point;
        },

        getEarthPoint: function()
        {
            return this._earthpiont;
        },

        setWindPoint: function( point )
        {
            this._windpiont = point;
        },

        getWindPoint: function()
        {
            return this._windpiont;
        },

        setWaterPoint: function( point )
        {
            this._waterpiont = point;
        },

        getWaterPoint: function()
        {
            return this._waterpiont;
        },

        setThunderPoint: function( point )
        {
            this._thunderpiont = point;
        },

        getThunderPoint: function()
        {
            return this._thunderpiont;
        },

        getSpeedValue: function()
        {
            var speed = ACTION_SEQUENCE_MAX_VALUE / this._windpiont;
            speed = ~~speed;

            return speed;
        }

//        onTouchBegan: function (touch, event)
//        {
//        }
//
//        onTouchMoved: function (touch, event)
//        {
//        },
//
//        onTouchEnded: function (touch, event)
//        {
//        }
    }
)