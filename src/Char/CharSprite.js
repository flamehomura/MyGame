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

var DEFAULT_WEAPON_MODIFIER = 10;

var DAMAGE_TYPE_ATTACKDAMAGE = 0;
var DAMAGE_TYPE_ABILITYPOWER = 1;

var PERFECT_DEFENCE_MODIFIER = 0.5;
var PERFECT_DAMAGE_MODIFIER = 2;

var MAX_PERFECT_DEFENCE_DAMAGE = 5;
var MAX_SKILLDAMAGE_REDUCE_PCT = 50;

var CERTAIN_AVOID_MODIFIER = 0.2;
var CERTAIN_HIT_MODIFIER = 2;

var CharSprite = MapItemSprite.extend({
        _state: STATE_UNGRABBED,
        _rect: null,
        _rotangle: 0,

        _teamid: -1,
        _mapindex: -1,
        _charskill: null,
        _misslabel: null,
        _damagelabel: null,

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
        _isDead: false,

        _weapon: null,

        _skilllist: [],
        _curSkillIdx: -1,

        // for ai
        _enemy: null,

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
                if( this._inDefence )
                {
                    this._inDefence = false;
                }
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

        setDead: function( dead )
        {
            this._isDead = dead;
        },

        isDead: function()
        {
            return this._isDead;
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

        setEnemy: function( enemy )
        {
            this._enemy = enemy;
        },

        getEnemy: function()
        {
            return this._enemy;
        },

        addSkill: function( skillid )
        {
            var skill = getCharSkillByID( skillid );
            if( skill != null )
            {
                this._skilllist.push( skill );
            }
        },

        getSkillList: function()
        {
            return this._skilllist;
        },

        getCurrentSkill: function()
        {
            if( this._curSkillIdx >= 0 && this._curSkillIdx < this._skilllist.length )
            {
                return this._skilllist[this._curSkillIdx];
            }

            if( this._skilllist.length > 0 )
            {
                return this._skilllist[0];
            }

            return null;
        },

        getAttackDamageValue: function()
        {
            var weapmodifier;
            var damagevalue;

            if( this._weapon )
            {
                weapmodifier = this._weapon.getWeaponTypeModifier();
            }
            else
            {
                weapmodifier = DEFAULT_WEAPON_MODIFIER;
            }

            damagevalue = Math.random() * ( weapmodifier * 2 ) + this._firepiont - weapmodifier;
            if( damagevalue < 0 )
            {
                damagevalue = 0;
            }

            return Math.round( damagevalue );
        },

        getSkillDamageValue: function()
        {
            var skill = this.getCurrentSkill();
            if( !skill )
            {
                return 0;
            }

            var skillpower = this._thunderpiont * skill.getSkillPowerPct() / 100;

            var minvalue = this._thunderpiont - skill.getSkillPowerModifier();
            var maxvalue = this._thunderpiont + skill.getSkillPowerModifier();

            if( minvalue < 0 )
            {
                minvalue = 0;
            }

            var value = Math.random() * ( maxvalue - minvalue ) + minvalue;

            return ~~value;
        },

        getDefenceValue: function()
        {
            var value;

            value = this._earthpiont;
            if( this._inDefence )
            {
                value *= 1.5;
            }

            return Math.round( value );
        },

        getSkillDefenceValue: function()
        {
            var value;

            value = this._waterpiont;
            if( this._inDefence )
            {
                value *= 1.5;
            }

            return Math.round( value );
        },

        getSpeedValue: function()
        {
            var speed = ACTION_SEQUENCE_MAX_VALUE / this._windpiont;
            speed = ~~speed;

            return speed;
        },

        getDexValue: function()
        {
            return this._windpiont;
        },

        checkHitTarget: function( target, damagetype )
        {
            if( damagetype == DAMAGE_TYPE_ABILITYPOWER )
            {
                return true;
            }

            // from back
            if( cc.pointEqualToPoint( this.getRotationPoint(), target.getRotationPoint() ) )
            {
                return true;
            }

            var certainhitvalue = target.getDexValue() * CERTAIN_HIT_MODIFIER;
            if( this.getDexValue() >= certainhitvalue )
            {
                return true;
            }

            var certainavoidvalue = target.getDexValue() * CERTAIN_AVOID_MODIFIER;
            if( this.getDexValue() <= certainavoidvalue )
            {
                return false;
            }

            var hitpct = ( this.getDexValue() - certainavoidvalue ) / ( certainhitvalue - certainavoidvalue );

            return Math.random() < hitpct;
        },

        takeDamage: function( damage, damagetype, causer )
        {
            if( damagetype == DAMAGE_TYPE_ATTACKDAMAGE )
            {
                return this.takeAttackDamage( damage, causer );
            }
            else if( damagetype == DAMAGE_TYPE_ABILITYPOWER )
            {
                return this.takeSkillDamage( damage, causer );
            }
        },

        takeAttackDamage: function( damage, causer )
        {
            var bPerfectDef = false;
            var mindamage = this.getDefenceValue() * PERFECT_DEFENCE_MODIFIER;
            var maxdamage = this.getDefenceValue() * PERFECT_DAMAGE_MODIFIER;
            if( damage <= mindamage )
            {
                bPerfectDef = true;
            }

            if( bPerfectDef )
            {
                damage = Math.random() * MAX_PERFECT_DEFENCE_DAMAGE;
            }
            else
            {
                damage = ( damage - mindamage ) / ( maxdamage - mindamage ) * damage;
                damage += Math.random() * MAX_PERFECT_DEFENCE_DAMAGE;
            }

            if( damage < 0 )
            {
                damage = 0;
            }
            else
            {
                damage = ~~damage;
            }

            this._healthpiont -= damage;
            if( this._healthpiont < 0 )
            {
                this.died();
            }

            cc.log( "Take Attack Damage " + damage + " " + "Current Health " + this._healthpiont );

            return damage;
        },

        takeSkillDamage: function( damage, causer )
        {
            if( this.getSkillDefenceValue() <= MAX_SKILLDAMAGE_REDUCE_PCT )
            {
                damage = damage * ( 1 - this.getSkillDefenceValue() / 100 );
            }
            else
            {
                damage = damage * ( 1 - MAX_SKILLDAMAGE_REDUCE_PCT / 100 );
                damage -= ( this.getSkillDefenceValue() - MAX_SKILLDAMAGE_REDUCE_PCT );
            }

            if( damage < 0 )
            {
                damage = 0;
            }
            else
            {
                damage = ~~damage;
            }

            this._healthpiont -= damage;
            if( this._healthpiont < 0 )
            {
                this.died();
            }

            cc.log( "Take Skill Damage " + damage + " " + "Current Health " + this._healthpiont );

            return damage;
        },

        died: function()
        {
            this.setDead( true );
        },

        displayMissLabel: function()
        {
            if( this._misslabel == null )
            {
                this._misslabel = cc.LabelTTF.create( "MISS", "微软雅黑", 20 );
                this._misslabel.setColor( cc.color( 255, 255, 0, 255 ) ); // yellow
                this._misslabel.enableStroke( cc.color( 0, 0, 0, 0 ), 2 );
                this.parent.addChild( this._misslabel, g_GameZOrder.charmsg );
            }

            this._misslabel.setPosition( this.getPosition() );
            this._misslabel.opacity = 255;
            var pos = this._misslabel.getPosition();
            var action = cc.Sequence.create(
                cc.MoveTo.create( 0.3, cc.p( pos.x, pos.y + this.height / 2 ) ),
                cc.FadeOut.create( 0.1 )
            );

            this._misslabel.runAction( action );
        },

        displayDamageLabel: function( damage )
        {
            if( this._damagelabel == null )
            {
                this._damagelabel = cc.LabelTTF.create( "MISS", "微软雅黑", 20 );
                this._damagelabel.setColor( cc.color( 255, 255, 255, 255 ) ); // white
                this._damagelabel.enableStroke( cc.color( 0, 0, 0, 0 ), 2 );
                this.parent.addChild( this._damagelabel, g_GameZOrder.charmsg );
            }

            this._damagelabel.setPosition( this.getPosition() );
            this._damagelabel.opacity = 255;
            this._damagelabel.setString( damage );
            var pos = this._damagelabel.getPosition();
            var action = cc.Sequence.create(
                cc.MoveTo.create( 0.3, cc.p( pos.x, pos.y + this.height / 2 ) ),
                cc.FadeOut.create( 0.1 )
            );

            this._damagelabel.runAction( action );
        },

        displayHealLabel: function( heal )
        {
            if( this._damagelabel == null )
            {
                this._damagelabel = cc.LabelTTF.create( "MISS", "微软雅黑", 20 );
                this._damagelabel.setColor( cc.color( 0, 255, 0, 255 ) ); // green
                this._damagelabel.enableStroke( cc.color( 0, 0, 0, 0 ), 2 );
                this.parent.addChild( this._damagelabel, g_GameZOrder.charmsg );
            }

            this._damagelabel.setPosition( this.getPosition() );
            this._damagelabel.opacity = 255;
            this._damagelabel.setString( damage );
            var pos = this._damagelabel.getPosition();
            var action = cc.Sequence.create(
                cc.MoveTo.create( 0.3, cc.p( pos.x, pos.y + this.height / 2 ) ),
                cc.FadeOut.create( 0.1 )
            );

            this._damagelabel.runAction( action );
        },

        doAttackAction: function( actionendcallback, target )
        {
            var pos = this.getPosition();
            var rotPos = this.getRotationPoint();
            pos.x += rotPos.x * this.width * 0.5;
            pos.y += rotPos.y * this.height * 0.5;

            var action;
            if( actionendcallback != null && target != null )
            {
                action = cc.Sequence.create(
                    cc.MoveTo.create( 0.2, pos ),
                    cc.MoveTo.create( 0.2, this.getPosition() ),
                    cc.CallFunc.create( actionendcallback, target )
                );
            }
            else
            {
                action = cc.Sequence.create(
                    cc.MoveTo.create( 0.2, pos ),
                    cc.MoveTo.create( 0.2, this.getPosition() )
                );
            }

            this.runAction( action );
        },

        doInjureAction: function( actionendcallback, target )
        {
            var pos = this.getPosition();
            var rotPos = this.getRotationPoint();
            pos.x -= rotPos.x * this.width * 0.25;
            pos.y -= rotPos.y * this.height * 0.25;

            var action;
            if( actionendcallback != null && target != null )
            {
                action = cc.Sequence.create(
                    cc.DelayTime.create( 0.1 ),
                    cc.MoveTo.create( 0.1, pos ),
                    cc.MoveTo.create( 0.1, this.getPosition() ),
                    cc.DelayTime.create( 0.1 ),
                    cc.CallFunc.create( actionendcallback, target )
                );
            }
            else
            {
                action = cc.Sequence.create(
                    cc.DelayTime.create( 0.1 ),
                    cc.MoveTo.create( 0.1, pos ),
                    cc.MoveTo.create( 0.1, this.getPosition() )
                );
            }

            this.runAction( action );
        },

        doAvoidAction: function( actionendcallback, target )
        {
            var pos = this.getPosition();
            var rotPos = this.getRotationPoint();
            pos.x += rotPos.y * this.width * 0.5;
            pos.y += rotPos.x * this.height * 0.5;

            var action;
            if( actionendcallback != null && target != null )
            {
                action = cc.Sequence.create(
                    cc.MoveTo.create( 0.2, pos ),
                    cc.MoveTo.create( 0.2, this.getPosition() ),
                    cc.CallFunc.create( actionendcallback, target )
                );
            }
            else
            {
                action = cc.Sequence.create(
                    cc.MoveTo.create( 0.2, pos ),
                    cc.MoveTo.create( 0.2, this.getPosition() )
                );
            }

            this.runAction( action );

            this.displayMissLabel();
        },

        doSelectedAction: function( actionendcallback, target )
        {
            var action;
            var color = this.getColor();
            if( actionendcallback != null && target != null )
            {
                action = cc.Sequence.create(
                    cc.TintTo.create( 0.2, 255, 255, 0 ),
                    cc.TintTo.create( 0.2, color.r, color.g, color.b ),
                    cc.DelayTime.create( 0.1 ),
                    cc.CallFunc.create( actionendcallback, target )
                );
            }
            else
            {
                action = cc.Sequence.create(
                    cc.TintTo.create( 0.2, 255, 255, 0 ),
                    cc.TintTo.create( 0.2, color.r, color.g, color.b ),
                    cc.DelayTime.create( 0.1 )
                );
            }

            this.runAction( action );
        },

        doGuardAction: function( actionendcallback, target )
        {
            var action;
            var color = this.getColor();
            if( actionendcallback != null && target != null )
            {
                action = cc.Sequence.create(
                    cc.TintTo.create( 0.2, 0, 127, 0 ),
                    cc.TintTo.create( 0.2, color.r, color.g, color.b ),
                    cc.CallFunc.create( actionendcallback, target )
                );
            }
            else
            {
                action = cc.Sequence.create(
                    cc.TintTo.create( 0.2, 0, 127, 0 ),
                    cc.TintTo.create( 0.2, color.r, color.g, color.b )
                );
            }

            this.runAction( action );
        },

        doSkillAction: function( actionendcallback, target )
        {
            if( this._charskill == null )
            {
                this._charskill = cc.Sprite.create( s_CharSkill );
                this._charskill.setAnchorPoint( 0.5, 0.5 );
                this._charskill.setPosition( this.width / 2, this.height / 2 );
                this.addChild( this._charskill, g_GameZOrder.chareffect );
            }

            var action;

            if( actionendcallback != null && target != null )
            {
                action = cc.Sequence.create(
                    cc.FadeIn.create( 0.2 ),
                    cc.DelayTime.create( 0.1 ),
                    cc.FadeOut.create( 0.1 ),
                    cc.CallFunc.create( actionendcallback, target )
                );
            }
            else
            {
                action = cc.Sequence.create(
                    cc.FadeIn.create( 0.2 ),
                    cc.DelayTime.create( 0.1 ),
                    cc.FadeOut.create( 0.1 )
                );
            }

            this._charskill.opacity = 0;
            this._charskill.runAction( action );
        },

        doSkillDamageAction: function( actionendcallback, target )
        {
            if( this._charskill == null )
            {
                this._charskill = cc.Sprite.create( s_CharSkill );
                this._charskill.setAnchorPoint( 0.5, 0.5 );
                this._charskill.setPosition( this.width / 2, this.height / 2 );
                this.addChild( this._charskill, g_GameZOrder.chareffect );
            }

            var action;

            if( actionendcallback != null && target != null )
            {
                action = cc.Sequence.create(
                    cc.FadeIn.create( 0.2 ),
                    cc.DelayTime.create( 0.1 ),
                    cc.FadeOut.create( 0.1 ),
                    cc.CallFunc.create( actionendcallback, target )
                );
            }
            else
            {
                action = cc.Sequence.create(
                    cc.FadeIn.create( 0.2 ),
                    cc.DelayTime.create( 0.1 ),
                    cc.FadeOut.create( 0.1 )
                );
            }

            this._charskill.setColor( cc.color( 255, 0, 0, 255  ) );
            this._charskill.opacity = 0;
            this._charskill.runAction( action );
        },

        doSkillHealAction: function( actionendcallback, target )
        {
            if( this._charskill == null )
            {
                this._charskill = cc.Sprite.create( s_CharSkill );
                this._charskill.setAnchorPoint( 0.5, 0.5 );
                this._charskill.setPosition( this.width / 2, this.height / 2 );
                this.addChild( this._charskill, g_GameZOrder.chareffect );
            }

            var action;

            if( actionendcallback != null && target != null )
            {
                action = cc.Sequence.create(
                    cc.FadeIn.create( 0.2 ),
                    cc.DelayTime.create( 0.1 ),
                    cc.FadeOut.create( 0.1 ),
                    cc.CallFunc.create( actionendcallback, target )
                );
            }
            else
            {
                action = cc.Sequence.create(
                    cc.FadeIn.create( 0.2 ),
                    cc.DelayTime.create( 0.1 ),
                    cc.FadeOut.create( 0.1 )
                );
            }

            this._charskill.setColor( cc.color( 0, 255, 0, 255 ) );
            this._charskill.opacity = 0;
            this._charskill.runAction( action );
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