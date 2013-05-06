// RESOLUTIONS
// Resolutions are selectable sources for alternate bitrate material
// Player Resolution Functions - Functions add to the player object for easier access to resolutions

vjs.Player.prototype.changeResolution = function(new_source, new_resolution){
    // has the exact same source been chosen?
    if (this.options_['resoution'] === new_resolution){
        this.trigger('resolutionchange');
        return this; // basically a no-op
    }

    this.pause();

    // remember our position in the current stream
    var curTime = this.currentTime();

    // reload the new tech and the new source (mostly used to re-fire
    // the events we want)
    this.src(new_source);

    // when the technology is re-started, kick off the new stream
    this.ready(function() {
      this.one('loadeddata', vjs.bind(this, function() {
        this.currentTime(curTime);
      }));
      this.trigger('resolutionchange');
      this.load();
      this.play();
      // remember this selection
      vjs.setLocalStorage('videojs_preferred_res', parseInt(new_source.index, 10));
    });
};

/**
 * Resolution Class
 * Contains resolution methods for loading and parsing of resoltuions
 * @param {vjs.Player|Object} player
 * @param {Object=} options
 * @constructor
 */
vjs.Resolution = vjs.Component.extend({
  init: function(player, options, ready){
    vjs.Component.call(this, player, options);
    // Apply resolution info to resolution object
    // Options will often be a resolution element

    // Build ID if one doesn't exist
    this.id_ = options['id'] || ('vjs_' + options['kind'] + '_' + options['language'] + '_' + vjs.guid++);
    this.src_ = options['src'];
    // 'default' is a reserved keyword in js so we use an abbreviated version
    this.dflt_ = options['default'] || options['dflt'];
    this.title_ = options['title'];
    this.label_ = options['label'];
  }
});

/**
 * Resoltuion kind value.
 * @private
 */
vjs.Resolution.prototype.kind_;

/**
 * Get the track kind value
 * @return {String}
 */
vjs.Resolution.prototype.kind = function(){
  return this.kind_;
};

/**
 * Resolution src value
 * @private
 */
vjs.Resolution.prototype.src_;

/**
 * Get the resolution src value
 * @return {String}
 */
vjs.Resolution.prototype.src = function(){
  return this.src_;
};

/**
 * Resolution default value
 * If default is used, resoltuion to show
 * @private
 */
vjs.Resolution.prototype.dflt_;

/**
 * Get the resoltuion default value
 * 'default' is a reserved keyword
 * @return {Boolean}
 */
vjs.Resolution.prototype.dflt = function(){
  return this.dflt_;
};

/**
 * Resoltuion title value
 * @private
 */
vjs.Resolution.prototype.title_;

/**
 * Get the resolution title value
 * @return {String}
 */
vjs.Resolution.prototype.title = function(){
  return this.title_;
};

/* Resolution Menu Items
================================================================================ */
vjs.ResolutionMenuItem = vjs.MenuItem.extend({
  init: function(player, options){
    // Modify options for parent MenuItem class's init.
    options['label'] = options.source['data-res'];
    vjs.MenuItem.call(this, player, options);

    this.source = options.source['src'];
    this.resolution = options.source['data-res'];

    this.player_.one('loadstart', vjs.bind(this, this.update));
    this.player_.on('resolutionchange', vjs.bind(this, this.update));
  }
});

vjs.ResolutionMenuItem.prototype.onClick = function(){
  vjs.MenuItem.prototype.onClick.call(this);
  this.player_.changeResolution(this.source, this.resolution);
};

vjs.ResolutionMenuItem.prototype.update = function(){
  var player = this.player_;
  if ((player.cache_['src'] === this.source)) {
    this.selected(true);
  } else {
    this.selected(false);
  }
};

/* Resolutions Button
================================================================================ */
vjs.ResolutionButton = vjs.MenuButton.extend({
  init: function(player, options) {
    vjs.MenuButton.call(this, player, options);

    if (this.items.length <= 1) {
      this.hide();
    }
  }
});

vjs.ResolutionButton.prototype.sourceResolutions_;

vjs.ResolutionButton.prototype.sourceResolutions = function() {
  return this.sourceResolutions_;
}

vjs.ResolutionButton.prototype.createItems = function(){
  var resolutions = this.sourceResolutions_ = this.player_.options_['sourceResolutions'];
  var items = [];
  for (var i = 0; i < resolutions.length; i++) {
    items.push(new vjs.ResolutionMenuItem(this.player_, {
      'source': this.sourceResolutions_[i]
    }));
  }
  return items;
};

/**
 * @constructor
 */
vjs.ResolutionsButton = vjs.ResolutionButton.extend({
  /** @constructor */
  init: function(player, options, ready){
    vjs.ResolutionButton.call(this, player, options, ready);
    this.el_.setAttribute('aria-label','Resolutions Menu');
  }
});
vjs.ResolutionsButton.prototype.kind_ = 'resolutions';
vjs.ResolutionsButton.prototype.buttonText = 'Resolutions';
vjs.ResolutionsButton.prototype.className = 'vjs-resolutions-button';

// Add Button to controlBar
vjs.obj.merge(vjs.ControlBar.prototype.options_['children'], {
  'resolutionsButton': {}
});