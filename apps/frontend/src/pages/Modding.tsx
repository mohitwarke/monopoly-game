// Modding Page
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Puzzle, Plus, Search, Download, Upload, Settings, Shield, Palette, Bot, Layout, ExternalLink, Trash2, Edit, Eye } from 'lucide-react';
import { Button, Input, Select, Badge, Card, Tabs, Modal } from '@monopoly/ui-components';

const mockPlugins = [
  {
    id: '1',
    name: 'Cyberpunk Board',
    version: '1.2.0',
    author: 'NeonDev',
    description: 'A futuristic cyberpunk-themed board skin with neon glow effects and animated properties.',
    type: 'boardSkin',
    downloads: 15420,
    rating: 4.8,
    tags: ['cyberpunk', 'neon', 'animated', 'futuristic'],
    isInstalled: true,
    isPublic: true,
  },
  {
    id: '2',
    name: 'Speed Rules Pack',
    version: '2.0.1',
    author: 'QuickPlay',
    description: 'Collection of house rules for faster games: 30-min time limit, wealth victory at $3000, double GO salary.',
    type: 'rulePack',
    downloads: 8930,
    rating: 4.5,
    tags: ['speed', 'house-rules', 'competitive'],
    isInstalled: false,
    isPublic: true,
  },
  {
    id: '3',
    name: 'Retro Token Set',
    version: '1.0.0',
    author: 'PixelArt',
    description: 'Classic Monopoly tokens reimagined in 16-bit pixel art style with unique animations.',
    type: 'pieceSet',
    downloads: 5670,
    rating: 4.9,
    tags: ['retro', 'pixel-art', 'nostalgic'],
    isInstalled: true,
    isPublic: true,
  },
  {
    id: '4',
    name: 'Aggressive AI Personality',
    version: '1.1.0',
    author: 'AIResearcher',
    description: 'High-risk, high-reward AI that prioritizes property acquisition and early development.',
    type: 'aiPersonality',
    downloads: 3210,
    rating: 4.3,
    tags: ['ai', 'aggressive', 'expert'],
    isInstalled: false,
    isPublic: true,
  },
  {
    id: '5',
    name: 'Team Monopoly Mode',
    version: '1.0.0',
    author: 'TeamPlay',
    description: '2v2 team variant with shared resources, coordinated strategies, and team victory conditions.',
    type: 'gameMode',
    downloads: 2100,
    rating: 4.6,
    tags: ['team', 'cooperative', 'multiplayer'],
    isInstalled: false,
    isPublic: true,
  },
];

const typeInfo = {
  boardSkin: { label: 'Board Skin', icon: Palette, color: 'purple' },
  rulePack: { label: 'Rule Pack', icon: Settings, color: 'blue' },
  pieceSet: { label: 'Piece Set', icon: Layout, color: 'green' },
  aiPersonality: { label: 'AI Personality', icon: Bot, color: 'orange' },
  gameMode: { label: 'Game Mode', icon: Puzzle, color: 'red' },
};

export function Modding() {
  const [activeTab, setActiveTab] = useState<'browse' | 'installed' | 'create'>('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState<typeof mockPlugins[0] | null>(null);

  const filteredPlugins = mockPlugins.filter(plugin => {
    if (filterType !== 'all' && plugin.type !== filterType) return false;
    if (searchQuery && !plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !plugin.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !plugin.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))) return false;
    if (activeTab === 'installed' && !plugin.isInstalled) return false;
    return true;
  });

  const handleInstall = (plugin: typeof mockPlugins[0]) => {
    setShowInstallModal(plugin);
  };

  const handleConfirmInstall = () => {
    if (showInstallModal) {
      // Install logic here
      setShowInstallModal(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Puzzle className="w-6 h-6 text-white" />
              </div>
              <h1 className="font-display text-2xl font-bold text-white">Modding</h1>
            </div>
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Plugin
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-800">
          <Tabs
            tabs={[
              { id: 'browse', label: 'Browse', icon: Puzzle },
              { id: 'installed', label: 'Installed', icon: Download },
              { id: 'create', label: 'Create', icon: Plus },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
            variant="line"
            fullWidth
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'browse' && (
          <>
            {/* Search & Filters */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  placeholder="Search plugins..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="w-5 h-5" />}
                />
              </div>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                options={[
                  { value: 'all', label: 'All Types' },
                  { value: 'boardSkin', label: 'Board Skins' },
                  { value: 'rulePack', label: 'Rule Packs' },
                  { value: 'pieceSet', label: 'Piece Sets' },
                  { value: 'aiPersonality', label: 'AI Personalities' },
                  { value: 'gameMode', label: 'Game Modes' },
                ]}
                className="w-48"
              />
            </motion.div>

            {/* Plugin Grid */}
            {filteredPlugins.length === 0 ? (
              <motion.div className="text-center py-16" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Puzzle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No plugins found</h3>
                <p className="text-gray-400 mb-6">Try adjusting your search or filters</p>
              </motion.div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredPlugins.map((plugin, index) => (
                  <motion.article
                    key={plugin.id}
                    className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-purple-500/50 hover:bg-gray-900 transition-all duration-300"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${typeInfo[plugin.type].color}-500/20`}>
                          <typeInfo[plugin.type].icon className={`w-6 h-6 text-${typeInfo[plugin.type].color}-400`} />
                        </div>
                        <div>
                          <Badge variant="default" size="sm" className="text-xs">
                            {typeInfo[plugin.type].label}
                          </Badge>
                        </div>
                      </div>
                      {plugin.isInstalled && (
                        <Badge variant="success" size="sm">Installed</Badge>
                      )}
                    </div>

                    <h3 className="font-semibold text-white text-lg mb-2">{plugin.name}</h3>
                    <p className="text-sm text-gray-400 mb-4 line-clamp-2">{plugin.description}</p>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {plugin.tags.map(tag => (
                        <Badge key={tag} variant="outline" size="sm">{tag}</Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                      <div className="flex items-center gap-3 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Download className="w-4 h-4" />
                          {plugin.downloads.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Shield className="w-4 h-4" />
                          {plugin.rating}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {plugin.isInstalled ? (
                          <Button variant="outline" size="sm" onClick={() => {}}>
                            <Trash2 className="w-4 h-4 mr-1" />
                            Uninstall
                          </Button>
                        ) : (
                          <Button variant="primary" size="sm" onClick={() => handleInstall(plugin)}>
                            <Download className="w-4 h-4 mr-1" />
                            Install
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'installed' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-xl font-semibold text-white mb-6">Installed Plugins</h2>
            {mockPlugins.filter(p => p.isInstalled).length === 0 ? (
              <div className="text-center py-16">
                <Puzzle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No plugins installed</h3>
                <p className="text-gray-400 mb-6">Browse the marketplace to find plugins</p>
                <Button variant="primary" onClick={() => setActiveTab('browse')}>
                  Browse Plugins
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {mockPlugins.filter(p => p.isInstalled).map((plugin, index) => (
                  <motion.article
                    key={plugin.id}
                    className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-purple-500/50 hover:bg-gray-900 transition-all duration-300"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${typeInfo[plugin.type].color}-500/20`}>
                          <typeInfo[plugin.type].icon className={`w-6 h-6 text-${typeInfo[plugin.type].color}-400`} />
                        </div>
                        <div>
                          <Badge variant="default" size="sm" className="text-xs">
                            {typeInfo[plugin.type].label}
                          </Badge>
                        </div>
                      </div>
                      <Badge variant="success" size="sm">Installed</Badge>
                    </div>

                    <h3 className="font-semibold text-white text-lg mb-2">{plugin.name}</h3>
                    <p className="text-sm text-gray-400 mb-4 line-clamp-2">{plugin.description}</p>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {plugin.tags.map(tag => (
                        <Badge key={tag} variant="outline" size="sm">{tag}</Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                      <div className="flex items-center gap-3 text-sm text-gray-400">
                        <span>v{plugin.version}</span>
                        <span>by {plugin.author}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => {}}>
                          <Settings className="w-4 h-4 mr-1" />
                          Configure
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => {}}>
                          <Trash2 className="w-4 h-4 mr-1" />
                          Uninstall
                        </Button>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'create' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Create New Plugin</h2>
                <p className="text-gray-400">Build custom board skins, rule packs, piece sets, AI personalities, or game modes</p>
              </div>

              <Card variant="outlined" padding="lg">
                <form className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Plugin Name</label>
                    <Input placeholder="My Awesome Plugin" />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <Select
                      label="Plugin Type"
                      value="boardSkin"
                      options={[
                        { value: 'boardSkin', label: 'Board Skin' },
                        { value: 'rulePack', label: 'Rule Pack' },
                        { value: 'pieceSet', label: 'Piece Set' },
                        { value: 'aiPersonality', label: 'AI Personality' },
                        { value: 'gameMode', label: 'Game Mode' },
                      ]}
                    />
                    <Select
                      label="API Version"
                      value="1.0"
                      options={[
                        { value: '1.0', label: '1.0' },
                        { value: '1.1', label: '1.1 (Beta)' },
                      ]}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                    <textarea
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      rows={4}
                      placeholder="Describe what your plugin does..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Entry Point</label>
                    <Input placeholder="index.js" />
                    <p className="text-sm text-gray-500 mt-1">Main JavaScript file that exports the plugin</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Permissions</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {[
                        'board:render', 'board:modify',
                        'pieces:render', 'pieces:modify',
                        'rules:read', 'rules:modify',
                        'ai:read', 'ai:modify',
                        'assets:load',
                        'storage:read', 'storage:write',
                        'network:request',
                      ].map(perm => (
                        <label key={perm} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-purple-500 focus:ring-purple-500" />
                          <span className="text-sm text-gray-300">{perm}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-gray-800">
                    <Button variant="outline">Cancel</Button>
                    <Button variant="primary" type="submit">
                      <Plus className="w-4 h-4 mr-1" />
                      Create Plugin
                    </Button>
                  </div>
                </form>
              </Card>

              {/* Documentation */}
              <div className="mt-8 space-y-6">
                <Card variant="outlined" padding="lg">
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <ExternalLink className="w-5 h-5" />
                    Resources
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <a href="#" className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg hover:border-purple-500 transition-colors">
                      <h4 className="font-medium text-white mb-1">Plugin API Reference</h4>
                      <p className="text-sm text-gray-400">Complete API documentation with examples</p>
                    </a>
                    <a href="#" className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg hover:border-purple-500 transition-colors">
                      <h4 className="font-medium text-white mb-1">Manifest Schema</h4>
                      <p className="text-sm text-gray-400">JSON schema for plugin manifest validation</p>
                    </a>
                    <a href="#" className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg hover:border-purple-500 transition-colors">
                      <h4 className="font-medium text-white mb-1">Example Plugins</h4>
                      <p className="text-sm text-gray-400">Reference implementations to learn from</p>
                    </a>
                    <a href="#" className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg hover:border-purple-500 transition-colors">
                      <h4 className="font-medium text-white mb-1">Publishing Guide</h4>
                      <p className="text-sm text-gray-400">How to publish your plugin to the marketplace</p>
                    </a>
                  </div>
                </Card>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Install Confirmation Modal */}
      <motion.div
        className={showInstallModal ? 'fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4' : 'hidden'}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setShowInstallModal(null)}
      >
        <motion.div
          className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${typeInfo[showInstallModal?.type || 'boardSkin'].color}-500/20`}>
              <typeInfo[showInstallModal?.type || 'boardSkin'].icon className={`w-6 h-6 text-${typeInfo[showInstallModal?.type || 'boardSkin'].color}-400`} />
            </div>
            <div>
              <h3 className="font-semibold text-white">{showInstallModal?.name}</h3>
              <p className="text-sm text-gray-400">{typeInfo[showInstallModal?.type || 'boardSkin'].label} by {showInstallModal?.author}</p>
            </div>
          </div>
          <p className="text-gray-300 mb-6">This plugin will be installed and available in your games. You can manage installed plugins from the Installed tab.</p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setShowInstallModal(null)}>Cancel</Button>
            <Button variant="primary" className="flex-1" onClick={handleConfirmInstall}>Install</Button>
          </div>
        </motion.div>
      </motion.div>

      {/* Create Plugin Modal */}
      <motion.div
        className={showCreateModal ? 'fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4' : 'hidden'}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setShowCreateModal(false)}
      >
        <motion.div
          className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Create New Plugin</h2>
            <button className="p-1 text-gray-400 hover:text-white" onClick={() => setShowCreateModal(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-gray-400 mb-6">Fill in the form on the Create tab to build your plugin. This modal is a shortcut.</p>
          <Button variant="primary" className="w-full" onClick={() => { setShowCreateModal(false); setActiveTab('create'); }}>
            Go to Create Page
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}