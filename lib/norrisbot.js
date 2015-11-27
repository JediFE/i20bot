'use strict';

var util = require('util');
var path = require('path');
var fs = require('fs');
var SQLite = require('sqlite3').verbose();
var Bot = require('slackbots');

var I20bot = function Constructor(settings) {
    this.settings = settings;
    //this.settings.name = this.settings.name;
    this.dbPath = path.resolve(__dirname, '..', 'data', 'norrisbot.db');

    this.db = null;
};

// inherits methods and properties from the Bot constructor
util.inherits(I20bot, Bot);

I20bot.prototype.run = function () {
    I20bot.super_.call(this, this.settings);

    this.on('start', this._onStart);
    this.on('message', this._onMessage);
};

I20bot.prototype._onStart = function () {
    this._connectDb();
    this._firstRunCheck();
};

I20bot.prototype._onMessage = function (message) {
    if (this._isChatMessage(message) &&
        this._isChannelConversation(message) &&
        !this._isFromI20bot(message) &&
        this._isStar(message)
    ) {
        this._parseMessage(message);
        this._replyWithRandomJoke(message);
    }
};

I20bot.prototype._replyWithRandomJoke = function (originalMessage) {
    var self = this;
    self.db.get('SELECT id, joke FROM jokes ORDER BY used ASC, RANDOM() LIMIT 1', function (err, record) {
        if (err) {
            return console.error('DATABASE ERROR:', err);
        }

        var channel = self._getChannelById(originalMessage.channel);
        self.postMessageToChannel(channel.name, record.joke, {as_user: true});
        self.db.run('UPDATE jokes SET used = used + 1 WHERE id = ?', record.id);
    });
};

I20bot.prototype._connectDb = function () {
    if (!fs.existsSync(this.dbPath)) {
        console.error('Database path ' + '"' + this.dbPath + '" does not exists or it\'s not readable.');
        process.exit(1);
    }

    this.db = new SQLite.Database(this.dbPath);
};

I20bot.prototype._firstRunCheck = function () {
    var self = this;
    self.db.get('SELECT val FROM info WHERE name = "lastrun" LIMIT 1', function (err, record) {
        if (err) {
            return console.error('DATABASE ERROR:', err);
        }

        var currentTime = (new Date()).toJSON();

        // this is a first run
        if (!record) {
            self._welcomeMessage();
            return self.db.run('INSERT INTO info(name, val) VALUES("lastrun", ?)', currentTime);
        }

        // updates with new last running time
        self.db.run('UPDATE info SET val = ? WHERE name = "lastrun"', currentTime);
    });
};

I20bot.prototype._welcomeMessage = function () {
    this.postMessageToChannel(this.channels[0].name, 'Hi guys, roundhouse-kick anyone?' +
        '\n I can tell jokes, but very honest ones. Just say `Chuck Norris` or `' + this.name + '` to invoke me!',
        {as_user: true});
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
    console.log(message);

    var messageBody = message.text;

    var gcs = {
        from: message.user,
        count: messageBody.substring(messageBody.indexOf(">:")+2,messageBody.indexOf(":star:")),
        recipient: messageBody.substring(messageBody.indexOf("<@")+2,messageBody.indexOf(">:")),
        description: messageBody.substring(messageBody.indexOf(":star:")+6)
    };

    console.log(gcs);
};

module.exports = I20bot;
