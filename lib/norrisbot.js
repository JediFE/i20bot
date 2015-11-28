'use strict';

var util = require('util');
var path = require('path');
var fs = require('fs');
var SQLite = require('sqlite3').verbose();
var Bot = require('slackbots');

var I20bot = function Constructor(settings) {
    this.settings = settings;
};

// inherits methods and properties from the Bot constructor
util.inherits(I20bot, Bot);

I20bot.prototype.run = function () {
    I20bot.super_.call(this, this.settings);

    this.on('start', this._onStart);
    this.on('message', this._onMessage);
};

I20bot.prototype._onStart = function () {
    var channel = this.channels[0];

    this._replyToChanel(channel, "Hello everybody, I'm I20bot. I can help you send a star, just send a message in next format: '@user: 5 :star: because he is cool!!!'");
};

I20bot.prototype._onMessage = function (message) {
    if (this._isChatMessage(message) &&
        this._isChannelConversation(message) &&
        !this._isFromI20bot(message) &&
        this._isStar(message)
    ) {
        this._parseMessage(message);
    }
};

I20bot.prototype._replyToChanel = function (channel, text) {
    var self = this;
    self.postMessageToChannel(channel.name, text, {as_user: true});
};

I20bot.prototype._isChatMessage = function (message) {
    return message.type === 'message' && Boolean(message.text);
};

I20bot.prototype._isChannelConversation = function (message) {
    return typeof message.channel === 'string' &&
        message.channel[0] === 'C';
};

I20bot.prototype._isStar = function (message) {
    return message.text.toLowerCase().indexOf(':star:') > -1;
};

I20bot.prototype._isFromI20bot = function (message) {
    return message.user === this.self.id;
};

I20bot.prototype._getChannelById = function (channelId) {
    return this.channels.filter(function (item) {
        return item.id === channelId;
    })[0];
};

I20bot.prototype._parseMessage = function (message) {
    var self = this,
        channel = self._getChannelById(message.channel),
        messageRegEx =  /<@(\w+)>: +?(\d) +?:star: +?(.+)/gi,
        messageArr = [];

    messageArr = messageRegEx.exec(message.text);

    if (messageArr) {
        var gcs = {
            donor: message.user,
            recipient: messageArr[1],
            count: messageArr[2],
            description: messageArr[3]
        };
        self._replyToChanel(channel, 'Success');
    }
    else {
        self._replyToChanel(channel, 'Error');
    }
};

module.exports = I20bot;
