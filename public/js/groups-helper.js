// ========================================
// Sound Groups Helper
// localStorage management for sound groups
// ========================================

const GroupsHelper = {
  STORAGE_KEY: 'soundboard_groups',
  MAX_GROUPS: 1,

  // Get all groups from localStorage
  getGroups: function() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error loading groups:', e);
      return [];
    }
  },

  // Save groups to localStorage
  saveGroups: function(groups) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(groups));
      return true;
    } catch (e) {
      console.error('Error saving groups:', e);
      return false;
    }
  },

  // Create a new group
  createGroup: function(name = '') {
    const groups = this.getGroups();

    if (groups.length >= this.MAX_GROUPS) {
      return null;
    }

    const newGroup = {
      id: 'group_' + Date.now(),
      name: name || `Groep ${groups.length + 1}`,
      sounds: [],
      createdAt: Date.now()
    };

    groups.push(newGroup);
    this.saveGroups(groups);
    return newGroup;
  },

  // Delete a group
  deleteGroup: function(groupId) {
    let groups = this.getGroups();
    groups = groups.filter(g => g.id !== groupId);
    this.saveGroups(groups);
    return true;
  },

  // Update group name
  updateGroupName: function(groupId, newName) {
    const groups = this.getGroups();
    const group = groups.find(g => g.id === groupId);

    if (group) {
      group.name = newName;
      this.saveGroups(groups);
      return true;
    }
    return false;
  },

  // Add sound to group
  addSound: function(groupId, soundData) {
    const groups = this.getGroups();
    const group = groups.find(g => g.id === groupId);

    if (group) {
      // Calculate start time (place at end of timeline)
      const lastSound = group.sounds[group.sounds.length - 1];
      const startTime = lastSound
        ? lastSound.startTime + this.parseDuration(lastSound.duration)
        : 0;

      // Create a unique instance ID for this sound in the group
      const soundInstance = {
        instanceId: 'instance_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        soundId: soundData.id,
        title: soundData.title,
        image: soundData.image,
        duration: soundData.duration,
        audioSrc: soundData.audioSrc,
        waveformData: soundData.waveformData || null,
        startTime: startTime, // Position in seconds on timeline
      };

      group.sounds.push(soundInstance);
      this.saveGroups(groups);
      return soundInstance;
    }
    return null;
  },

  // Helper to parse MM:SS to seconds
  parseDuration: function(duration) {
    const parts = (duration || '0:00').split(':');
    return parseInt(parts[0]) * 60 + parseInt(parts[1] || 0);
  },

  // Remove sound from group
  removeSound: function(groupId, instanceId) {
    const groups = this.getGroups();
    const group = groups.find(g => g.id === groupId);

    if (group) {
      group.sounds = group.sounds.filter(s => s.instanceId !== instanceId);
      this.saveGroups(groups);
      return true;
    }
    return false;
  },

  // Reorder sounds within a group
  reorderSounds: function(groupId, soundsArray) {
    const groups = this.getGroups();
    const group = groups.find(g => g.id === groupId);

    if (group) {
      group.sounds = soundsArray;
      this.saveGroups(groups);
      return true;
    }
    return false;
  },

  // Update sound position on timeline
  updateSoundPosition: function(groupId, instanceId, startTime) {
    const groups = this.getGroups();
    const group = groups.find(g => g.id === groupId);

    if (group) {
      const sound = group.sounds.find(s => s.instanceId === instanceId);
      if (sound) {
        sound.startTime = startTime;
        this.saveGroups(groups);
        return true;
      }
    }
    return false;
  },

  // Get specific group
  getGroup: function(groupId) {
    const groups = this.getGroups();
    return groups.find(g => g.id === groupId) || null;
  },

  // Get total duration of group
  getGroupDuration: function(groupId) {
    const group = this.getGroup(groupId);
    if (!group) return 0;

    return group.sounds.reduce((total, sound) => {
      // Parse duration string (MM:SS) to seconds
      const parts = (sound.duration || '0:00').split(':');
      const seconds = parseInt(parts[0]) * 60 + parseInt(parts[1] || 0);
      return total + seconds;
    }, 0);
  },

  // Format seconds to MM:SS
  formatDuration: function(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  },

  // Clear all groups (for testing)
  clearAll: function() {
    localStorage.removeItem(this.STORAGE_KEY);
  }
};

// Make it globally available
window.GroupsHelper = GroupsHelper;
