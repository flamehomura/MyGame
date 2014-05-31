/**
 * Created by Administrator on 2014/5/22.
 */

var CommandLayer = cc.Layer.extend({
    _headSprite: null,
    _tailSprite: null,
    _curItemHeight: 0,
    _touchListener: null,
    _selectedItem: null,
    _state: -1,
    enabled: false,
    _conmmanditems: [],

    ctor: function () {
        this._super();
        this._headSprite = cc.Sprite.create( s_CommandMenuHead );
        this._tailSprite = cc.Sprite.create( s_CommandMenuTail );

        this._headSprite.setAnchorPoint( 0.5, 0 );
        this._tailSprite.setAnchorPoint( 0.5, 1 );

        this.addChild( this._headSprite, g_GameZOrder.bg );
        this.addChild( this._tailSprite, g_GameZOrder.bg );

        this._touchListener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: this._onTouchBegan,
            onTouchMoved: this._onTouchMoved,
            onTouchEnded: this._onTouchEnded,
            onTouchCancelled: this._onTouchCancelled
        });
    },

    onEnter: function()
    {
        var locListener = this._touchListener;
        if( !locListener._isRegistered() )
        {
            cc.eventManager.addListener( locListener, this );
        }

        cc.Node.prototype.onEnter.call( this );
    },

    isEnabled: function()
    {
        return this.enabled;
    },

    setEnabled: function( enabled )
    {
        this.enabled = enabled;
        if( this.enabled == true )
        {
            this._state = cc.MENU_STATE_WAITING;
        }
    },

    addCommandItem: function( cmditem )
    {
        if( !( cmditem instanceof CommandMenuItem ) )
            throw "CommandLayer.addCommandItem() : only supports CommandMenuItem objects";
        cmditem.setAnchorPoint( 0.5, 0.5 );
        cmditem.setPosition( 0, this._curItemHeight - cmditem.height / 2 );
        this.addChild( cmditem, g_GameZOrder.ui );
        this._conmmanditems.push( cmditem );

        this._curItemHeight -= cmditem.height;
        this._tailSprite.setPosition( this._tailSprite.getPosition().x, this._curItemHeight );

        this.setEnabled( true );
    },

    getCommandItem: function( itemidx )
    {
        if( itemidx >= 0 && itemidx < this._conmmanditems.length )
        {
            return this._conmmanditems[itemidx];
        }

        return null;
    },

    setCommandItemEnabled: function( itemidx, enabled )
    {
        if( itemidx >= 0 && itemidx < this._conmmanditems.length  )
        {
            this._conmmanditems[itemidx].setEnabled( enabled );
        }
    },

    _onTouchBegan: function (touch, event)
    {
        var target = event.getCurrentTarget();
        if( !target.isVisible() || !target.isEnabled() || target._state != cc.MENU_STATE_WAITING )
        {
            return false;
        }

        for( var c = target.parent; c != null; c = c.parent )
        {
            if( !c.isVisible() )
            {
                return false;
            }
        }

        target._selectedItem = target._itemForTouch( touch );
        if( target._selectedItem )
        {
            target._state = cc.MENU_STATE_TRACKING_TOUCH;
            target._selectedItem.selected();
            return true;
        }

        return false;
    },

    _onTouchEnded: function( touch, event )
    {
        var target = event.getCurrentTarget();
        if( target._state !== cc.MENU_STATE_TRACKING_TOUCH )
        {
            cc.log("cc.Menu.onTouchEnded(): invalid state");
            return;
        }
        if( target._selectedItem )
        {
            target._selectedItem.unselected();
            target._selectedItem.activate();
        }
        target._state = cc.MENU_STATE_WAITING;
    },

    _onTouchCancelled: function (touch, event)
    {
        var target = event.getCurrentTarget();
        if (target._state !== cc.MENU_STATE_TRACKING_TOUCH)
        {
            cc.log("cc.Menu.onTouchCancelled(): invalid state");
            return;
        }
        if( this._selectedItem )
        {
            target._selectedItem.unselected();
        }
        target._state = cc.MENU_STATE_WAITING;
    },

    _onTouchMoved: function (touch, event)
    {
/*        var target = event.getCurrentTarget();
        if (target._state !== cc.MENU_STATE_TRACKING_TOUCH)
        {
            cc.log("cc.Menu.onTouchMoved(): invalid state");
            return;
        }
        var currentItem = target._itemForTouch( touch );
        if (currentItem != target._selectedItem)
        {
            if (target._selectedItem)
                target._selectedItem.unselected();
            target._selectedItem = currentItem;
            if (target._selectedItem)
                target._selectedItem.selected();
        }*/
    },

    _itemForTouch: function( touch )
    {
        var touchLocation = touch.getLocation();
        var itemChildren = this._children, locItemChild;
        if( itemChildren && itemChildren.length > 0 )
        {
            for( var i = 0; i < itemChildren.length; i++ )
            {
                if( !( itemChildren[i] instanceof CommandMenuItem ) )
                {
                    continue;
                }

                locItemChild = itemChildren[i];
                if( locItemChild.isVisible() && locItemChild.isEnabled() )
                {
                    var local = locItemChild.convertToNodeSpace( touchLocation );
                    var r = locItemChild.rect();
                    r.x = 0;
                    r.y = 0;
                    if( cc.rectContainsPoint( r, local ) )
                    {
                        return locItemChild;
                    }
                }
            }
        }
        return null;
    },

    /**
     * custom on exit
     */
    onExit: function () {
/*        if (this._state == cc.MENU_STATE_TRACKING_TOUCH) {
            if (this._selectedItem) {
                this._selectedItem.unselected();
                this._selectedItem = null;
            }
            this._state = cc.MENU_STATE_WAITING;
        }*/
        cc.Node.prototype.onExit.call(this);
    }
})