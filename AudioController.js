/**
 * AudioController
 * Handles HTML5 audio playing
 * Broadcasts events for playing, paused, status, etc so you can create status bars and the like
 * 
 * @author Jay Contonio - jcontonio@gmail.com
 * @param {String} soundFile A full path to an audio file
 */


/*
	TODO Figure out this addEventListener mess
	TODO Write own custom event class
*/
var AudioController = function(soundFile)
{
	this._sound = soundFile;
	this._positionTimer = 0;
	this._currentTime = 0;
	this._isPlaying = false;
	
	// If this browser doesn't support mp3, mostly likely NO podcast is going to work. So we'll trigger an error event
	// so you can show the user a nice message like "Eat shit Mozilla".
	if (!this.supportsMP3())
	{
		alert("Sorry, this browser doesn't support MP3 audio.");
		if (this.supportsOgg())
		{
			alert('Come on Mozilla you freetards...')
		}
		return false;
	}
	
	// Create the audio element and add listeners
	this._audioElement = new Audio();
	this.load(soundFile);
	
	var that = this;
	this._audioElement.addEventListener('loadedmetadata', function(e)
	{
		that._totalTime = e.target.duration;
		that.play();
	}, false);
	
	this._audioElement.addEventListener('playing', function(e) { that.playHandler(e, that) }, false);
	this._audioElement.addEventListener('pause', function(e) { that.pauseHandler(e, that) }, false);
	this._audioElement.addEventListener('timeupdate', function(e) { that.timerHandler(e, that) }, false);
	this._audioElement.addEventListener('ended', function(e) { that.endedHandler(e, that) }, false);
	this._audioElement.addEventListener('error', function(e) { that.errorHandler(e, that) }, false);
	
}



/* 
 * -- Getters --
 *
 *
 * @returns {String} The path to the current sound file 
 */
AudioController.prototype.sound = function()
{
	return this._sound;
}


/**
 * @returns {Number} The current playhead time 
 */
AudioController.prototype.currentTime = function()
{
	return this._currentTime;
}


/**
 * @returns {Boolean} Whether the audio is current playing or not 
 */
AudioController.prototype.isPlaying = function()
{
	return this._isPlaying;
}



/**
 * Loads a new audio file into _audioElement and plays it
 * 
 * @param {String} soundFile Path to the audio file 
 */
AudioController.prototype.load = function(soundFile)
{
	this._sound = soundFile;
	this._currentTime = 0;
	this._audioElement.setAttribute('src',soundFile);
	this._audioElement.load();
}


/**
 * Plays the audio file
 * Creates a timer to update the status 
 */
AudioController.prototype.play = function()
{
	// Start the timer to update the status of the currently playing track
	var that = this;
	that._isPlaying = true;
	this._audioElement.play(this._currentTime);
}


/**
 * Pauses the audio file
 * Stops the timer
 */
AudioController.prototype.pause = function()
{
	this._isPlaying = false;
	this._audioElement.pause();
}


/**
 * Resets the entire player back to zero 
 */
AudioController.prototype.reset = function()
{
	this._currentTime = 0;
	this._percentage = 0;
	this.updateStatus();
	var completeEvent = new jQuery.Event('AUDIO_COMPLETED');
	$(document).trigger(completeEvent);
}


/**
 * Updates the width of the progressBarID and the text label 
 */
AudioController.prototype.updateStatus = function()
{
	var timeEvent = new jQuery.Event('AUDIO_TIMER_EVENT');
	timeEvent.currentTime = Math.floor(this._currentTime);
	timeEvent.totalTime = Math.floor(this._totalTime);
	timeEvent.percentage = this._percentage;
	$(document).trigger(timeEvent);
}



/* 
 * -- Feature detection --
 */
AudioController.prototype.supportsAudio = function()
{
	return !!document.createElement('audio').canPlayType;
}


AudioController.prototype.supportsMP3 = function()
{
	if (!this.supportsAudio()) { return false; }
	var a = document.createElement('audio');
	return a.canPlayType('audio/mpeg')
}


AudioController.prototype.supportsOgg = function()
{
	if (!this.supportsAudio()) { return false; }
	var a = document.createElement('audio');
	return a.canPlayType('audio/ogg');
}



/* 
 * -- Handlers --
 */
AudioController.prototype.errorHandler = function(e)
{
	throw new Error('Cannot find file ' + e.target.currentSrc);
}

AudioController.prototype.endedHandler = function(e, that)
{
	that.reset();
}

AudioController.prototype.playHandler = function(e, that)
{
	var playEvent = new jQuery.Event('AUDIO_PLAYING');
	$(document).trigger(playEvent);
	var that = this;
}

AudioController.prototype.pauseHandler = function(e, that)
{
	var pauseEvent = new jQuery.Event('AUDIO_PAUSED');
	$(document).trigger(pauseEvent);
}

/**
 * timerHandler for audio scrubber and time text
 */
AudioController.prototype.timerHandler = function(e, that)
{
	that._currentTime = e.target.currentTime;
	that._percentage = ((that._currentTime / that._totalTime) * 100).toFixed(2);
	that.updateStatus();
}