/**
 * Created by Administrator on 2014/5/21.
 */

var STATE_GRABBED = 0;
var STATE_UNGRABBED = 1;

var TEAM_BLUE = 0;
var TEAM_RED = 1;
var TEAM_YELLOW = 2;

var CharSprite = MapItemSprite.extend({
        _state: STATE_UNGRABBED,
        _rect: null,

        _teamid: -1,
        _mapindex: -1,

        _moverange: 4,
        _attackrange: 2,

        ctor: function ()
        {
            this._super();
            this.initWithItemType( MAP_ITEM_CHAR );
            this.initWithFile(s_MainChar);
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
                case TEAM_RED:
                    teamImage = s_CharRedTeam;
                    break;
                case TEAM_BLUE:
                    teamImage = s_CharBlueTeam;
                    break;
                case TEAM_YELLOW:
                    teamImage = s_CharYellowTeam;
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
                rot = 180;
            }
            else if( deltarow > 0)
            {
                rot = 0;
            }
            else if( deltacolumn > 0 )
            {
                rot = 90;
            }
            else if( deltacolumn < 0 )
            {
                rot = 270;
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
        },

        onTouchBegan: function (touch, event)
        {
/*            var target = event.getCurrentTarget();
            if (target._state != STATE_UNGRABBED)
            {
                return false;
            }
            if (!target.containsTouchLocation(touch))
            {
                return false;
            }

            target._state = STATE_GRABBED;
            return true;*/
        },

        onTouchMoved: function (touch, event)
        {
/*            var target = event.getCurrentTarget();

            cc.assert(target._state == STATE_GRABBED, "Paddle - Unexpected state!");

            var touchPoint = touch.getLocation();
            //touchPoint = cc.director.convertToGL( touchPoint );

            target.x = touchPoint.x;
            target.y = touchPoint.y;*/
        },

        onTouchEnded: function (touch, event)
        {
            var target = event.getCurrentTarget();
            cc.assert(target._state == STATE_GRABBED, "Paddle - Unexpected state!");
            target._state = STATE_UNGRABBED;
        }
    }
)