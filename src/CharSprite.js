/**
 * Created by Administrator on 2014/5/21.
 */

var STATE_GRABBED = 0;
var STATE_UNGRABBED = 1;

var CharSprite = cc.Sprite.extend({
        _state:STATE_UNGRABBED,
        _rect:null,

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

        containsTouchLocation:function (touch) {
            var getPoint = touch.getLocation();
            var myRect = this.rect();

            myRect.x += this.x;
            myRect.y += this.y;
            return cc.rectContainsPoint(myRect, getPoint);//this.convertTouchToNodeSpaceAR(touch));
        },

        onTouchBegan: function (touch, event) {
            cc.log("onTouchBegan");
            var target = event.getCurrentTarget();
            if (target._state != STATE_UNGRABBED) return false;
            if (!target.containsTouchLocation(touch)) return false;
            cc.log("onTouchBegan true");

            target._state = STATE_GRABBED;
            return true;
        },

        onTouchMoved: function (touch, event) {
            cc.log("onTouchMoved");
            var target = event.getCurrentTarget();
            // If it weren't for the TouchDispatcher, you would need to keep a reference
            // to the touch from touchBegan and check that the current touch is the same
            // as that one.
            // Actually, it would be even more complicated since in the Cocos dispatcher
            // you get Array instead of 1 cc.Touch, so you'd need to loop through the set
            // in each touchXXX method.
            cc.assert(target._state == STATE_GRABBED, "Paddle - Unexpected state!");

            var touchPoint = touch.getLocation();
            //touchPoint = cc.director.convertToGL( touchPoint );

            target.x = touchPoint.x;
            target.y = touchPoint.y;
        },

        onTouchEnded: function (touch, event) {
            cc.log("onTouchEnded");
            var target = event.getCurrentTarget();
            cc.assert(target._state == STATE_GRABBED, "Paddle - Unexpected state!");
            target._state = STATE_UNGRABBED;
        }
    }
)