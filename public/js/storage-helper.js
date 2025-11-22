// public/js/storage-helper.js
// LocalStorage helper voor soundboard features

const StorageHelper = {
  // Keys voor verschillende features
  KEYS: {
    FAVORITES: 'soundboard_favorites',
    HIDDEN: 'soundboard_hidden',
    CUSTOM_ORDER: 'soundboard_custom_order'
  },

  /**
   * Get favorites from localStorage
   * @returns {Array<string>} Array of sound IDs
   */
  getFavorites: function() {
    try {
      const favorites = localStorage.getItem(this.KEYS.FAVORITES);
      return favorites ? JSON.parse(favorites) : [];
    } catch (e) {
      console.error('Error loading favorites:', e);
      return [];
    }
  },

  /**
   * Add sound to favorites
   * @param {string} soundId - The sound ID
   * @returns {boolean} Success
   */
  addFavorite: function(soundId) {
    try {
      const favorites = this.getFavorites();
      if (!favorites.includes(soundId)) {
        favorites.push(soundId);
        localStorage.setItem(this.KEYS.FAVORITES, JSON.stringify(favorites));
        return true;
      }
      return false;
    } catch (e) {
      console.error('Error adding favorite:', e);
      return false;
    }
  },

  /**
   * Remove sound from favorites
   * @param {string} soundId - The sound ID
   * @returns {boolean} Success
   */
  removeFavorite: function(soundId) {
    try {
      let favorites = this.getFavorites();
      const index = favorites.indexOf(soundId);
      if (index > -1) {
        favorites.splice(index, 1);
        localStorage.setItem(this.KEYS.FAVORITES, JSON.stringify(favorites));
        return true;
      }
      return false;
    } catch (e) {
      console.error('Error removing favorite:', e);
      return false;
    }
  },

  /**
   * Check if sound is favorited
   * @param {string} soundId - The sound ID
   * @returns {boolean}
   */
  isFavorite: function(soundId) {
    const favorites = this.getFavorites();
    return favorites.includes(soundId);
  },

  /**
   * Toggle favorite status
   * @param {string} soundId - The sound ID
   * @returns {boolean} New favorite status
   */
  toggleFavorite: function(soundId) {
    if (this.isFavorite(soundId)) {
      this.removeFavorite(soundId);
      return false;
    } else {
      this.addFavorite(soundId);
      return true;
    }
  },

  /**
   * Get hidden sounds
   * @returns {Array<string>} Array of hidden sound IDs
   */
  getHidden: function() {
    try {
      const hidden = localStorage.getItem(this.KEYS.HIDDEN);
      return hidden ? JSON.parse(hidden) : [];
    } catch (e) {
      console.error('Error loading hidden sounds:', e);
      return [];
    }
  },

  /**
   * Check if sound is hidden
   * @param {string} soundId - The sound ID
   * @returns {boolean}
   */
  isHidden: function(soundId) {
    const hidden = this.getHidden();
    return hidden.includes(soundId);
  },

  /**
   * Toggle hidden status
   * @param {string} soundId - The sound ID
   * @returns {boolean} New hidden status
   */
  toggleHidden: function(soundId) {
    try {
      let hidden = this.getHidden();
      const index = hidden.indexOf(soundId);

      if (index > -1) {
        hidden.splice(index, 1);
        localStorage.setItem(this.KEYS.HIDDEN, JSON.stringify(hidden));
        return false;
      } else {
        hidden.push(soundId);
        localStorage.setItem(this.KEYS.HIDDEN, JSON.stringify(hidden));
        return true;
      }
    } catch (e) {
      console.error('Error toggling hidden:', e);
      return false;
    }
  },

  /**
   * Get custom order
   * @returns {Array<string>} Array of sound IDs in custom order
   */
  getCustomOrder: function() {
    try {
      const order = localStorage.getItem(this.KEYS.CUSTOM_ORDER);
      return order ? JSON.parse(order) : [];
    } catch (e) {
      console.error('Error loading custom order:', e);
      return [];
    }
  },

  /**
   * Save custom order
   * @param {Array<string>} order - Array of sound IDs
   * @returns {boolean} Success
   */
  saveCustomOrder: function(order) {
    try {
      localStorage.setItem(this.KEYS.CUSTOM_ORDER, JSON.stringify(order));
      return true;
    } catch (e) {
      console.error('Error saving custom order:', e);
      return false;
    }
  },

  /**
   * Clear all soundboard data (for debugging/reset)
   */
  clearAll: function() {
    Object.values(this.KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    console.log('All soundboard data cleared');
  }
};

// Make available globally
window.StorageHelper = StorageHelper;
