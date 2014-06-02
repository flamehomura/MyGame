/**
 * Created by Administrator on 2014/6/2.
 */

var SKILLTYPE_DAMAGE = 0;
var SKILLTYPE_HEAL = 1;
var SKILLTYPE_BUFF = 2;
var SKILLTYPE_DEBUFF = 3;

var CharSkill = cc.Class.extend({
    _skillid: 0,
    _skillname: "",
    _skillpowerpct: 100,
    _skillpowermodifier: 0,
    _skilltype: 0,

    getSkillId: function()
    {
        return this._skillid;
    },

    getSkillName: function()
    {
        return this._skillname;
    },

    getSkillType: function()
    {
        return this._skilltype;
    },

    getSkillPowerPct: function()
    {
        return this._skillpowerpct;
    },

    getSkillPowerModifier: function()
    {
        return this._skillpowermodifier;
    }
});

var g_skilllist = [];

var g_skillinfolist = [
    {
        id: 1,
        name: "魔矢",
        type: SKILLTYPE_DAMAGE,
        powerpct: 100,
        powermod: 10
    }
];

var initCharSkillList = function()
{
    for( var i = 0; i < g_skillinfolist.length; ++i )
    {
        var skill = new CharSkill();
        skill._skillid = g_skillinfolist[i].id;
        skill._skillname = g_skillinfolist[i].name;
        skill._skilltype = g_skillinfolist[i].type;
        skill._skillpowerpct = g_skillinfolist[i].powerpct;
        skill._skillpowermodifier = g_skillinfolist[i].powermod;

        g_skilllist.push( skill );
    }
}

var getCharSkillByID = function( id )
{
    for( var i = 0; i < g_skilllist.length; ++i )
    {
        if( g_skilllist[i].getSkillId() == id )
        {
            return g_skilllist[i];
        }
    }

    return null;
}