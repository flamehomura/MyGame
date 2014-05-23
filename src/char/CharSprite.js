/**
 * Created by Administrator on 2014/5/21.
 */

var STATE_GRABBED = 0;
var STATE_UNGRABBED = 1;

var TEAM_BLUE = 0;
var TEAM_RED = 1;
var TEAM_YELLOW = 2;

var CharSprite = cc.Sprite.extend({
        _state:STATE_UNGRABBED,
        _rect:null,

        _teamid: -1,

        ctor: function () {
            this._super();
            this.initWithFile(s_MainChar);
            cc.eventManager.addListener({
                event: cc.EventListener.TOUCH_ONE_BY_ONE,
                swallowTouches: true,
                onTouchBegan: this.onTouchBegan,
                onTouchMoved: this.onTouchMoved,
                onTouchEnded: this.onTouchEnded
            }, this);
        },

        rect:function () {
            return cc.rect( -this._rect.width / 2, -this._rect.height / 2, this._rect.width, this._rect.height );
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

        containsTouchLocation:function (touch) {
            var getPoint = touch.getLocation();
            getPoint = this.convertToNodeSpace( getPoint );

            var myRect = this.rect();
            myRect.x = 0;
            myRect.y = 0;

            return cc.rectContainsPoint(myRect, getPoint);//this.convertTouchToNodeSpaceAR(touch));
        },

        onTouchBegan: function (touch, event)
        {
            var target = event.getCurrentTarget();
            if (target._state != STATE_UNGRABBED)
            {
                return false;
            }
            if (!target.containsTouchLocation(touch))
            {
                return false;
            }

            target._state = STATE_GRABBED;
            return true;
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