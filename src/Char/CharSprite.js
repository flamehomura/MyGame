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
var ROTATION_LEFT = 90;
var ROTATION_RIGHT = 270;

var CharSprite = MapItemSprite.extend({
        _state: STATE_UNGRABBED,
        _rect: null,

        _teamid: -1,
        _mapindex: -1,

        _moverange: 4,
        _attackrange: 1,

        ctor: function ()
        {
            this._super();
            this.initWithItemType( MAP_ITEM_CHAR );
        },

        initWithTexture:function (aTexture) {
            if (this._super(aTexture)) {
                this._state = STATE_UNGRABBED;
            }
            if (aTexture instanceof cc.Texture2D) {
                this._rect = cc.rect(0, 0, aTexture.width, aTexture.height);
            } else if ((aTexture instanceof HTMLImageElement) || (aTexture instanceof HTMLCanvasElement)) {
                this._rect = cc.rect(0, 0, aTexture.width, aTexture.height);
            }
            return true;
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

            var rot = 0;

            if( deltarow < 0 )
            {
                rot = ROTATION_DOWN;
            }
            else if( deltarow > 0)
            {
                rot = ROTATION_UP;
            }
            else if( deltacolumn > 0 )
            {
                rot = ROTATION_LEFT;
            }
            else if( deltacolumn < 0 )
            {
                rot = ROTATION_RIGHT;
            }

            this.setRotation( rot );
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
        }

//        onTouchBegan: function (touch, event)
//        {
//        },
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