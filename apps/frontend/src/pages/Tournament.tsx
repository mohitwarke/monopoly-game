// Tournament Page
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Users, Calendar, Clock, ChevronRight, Filter, Plus, Search } from 'lucide-react';
import { Button, Input, Select, Badge, Card } from '@monopoly/ui-components';
import { formatDistanceToNow } from 'date-fns';

const mockTournaments = [
  {
    id: '1',
    name: 'Monopoly Masters Championship',
    format: 'swiss',
    status: 'registration',
    maxPlayers: 64,
    currentPlayers: 42,
    startDate: new Date(Date.now() + 86400000 * 3),
    entryFee: 0,
    prizePool: 1000,
  },
  {
    id: '2',
    name: 'Weekend Speed Tournament',
    format: 'elimination',
    status: 'inProgress',
    maxPlayers: 16,
    currentPlayers: 16,
    startDate: new Date(Date.now() - 86400000),
    entryFee: 0,
    prizePool: 500,
  },
  {
    id: '3',
    name: 'Community Classic',
    format: 'roundRobin',
    status: 'completed',
    maxPlayers: 8,
    currentPlayers: 8,
    startDate: new Date(Date.now() - 86400000 * 7),
    entryFee: 0,
    prizePool: 200,
  },
];

export function Tournament() {
  const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'registration' | 'inProgress' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTournaments = mockTournaments.filter(t => {
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    if (searchQuery && !t.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <h1 className="font-display text-2xl font-bold text-white">Tournaments</h1>
            </div>
            <Button variant="primary">
              <Plus className="w-4 h-4 mr-2" />
              Create Tournament
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="px-4 sm:px-6 lg:px-8 py-4 border-b border-gray-800">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <Input
                placeholder="Search tournaments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-5 h-5" />}
              />
            </div>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              options={[
                { value: 'all', label: 'All' },
                { value: 'registration', label: 'Registration' },
                { value: 'inProgress', label: 'In Progress' },
                { value: 'completed', label: 'Completed' },
              ]}
              className="w-48"
            />
          </div>
        </div>
      </div>

      {/* Tournament List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredTournaments.length === 0 ? (
          <motion.div className="text-center py-16" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No tournaments found</h3>
            <p className="text-gray-400 mb-6">Try adjusting your filters or check back later</p>
          </motion.div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTournaments.map((tournament, index) => (
              <motion.article
                key={tournament.id}
                className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-yellow-500/50 hover:bg-gray-900 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-white text-lg">{tournament.name}</h3>
                    <p className="text-sm text-gray-400 mt-1">{tournament.format} format</p>
                  </div>
                  <Badge
                    variant={
                      tournament.status === 'registration' ? 'success' :
                      tournament.status === 'inProgress' ? 'info' :
                      tournament.status === 'completed' ? 'default' : 'warning'
                    }
                    size="sm"
                  >
                    {tournament.status}
                  </Badge>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Users className="w-4 h-4" />
                    <span>{tournament.currentPlayers}/{tournament.maxPlayers} players</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>Starts {formatDistanceToNow(tournament.startDate, { addSuffix: true })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>Est. {tournament.format === 'swiss' ? '3-4 hours' : tournament.format === 'elimination' ? '2-3 hours' : '4-5 hours'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-yellow-400">${tournament.prizePool}</span>
                    <span className="text-gray-500">Prize Pool</span>
                  </div>
                  <Button
                    variant={tournament.status === 'registration' ? 'primary' : 'outline'}
                    size="sm"
                    disabled={tournament.status !== 'registration'}
                  >
                    {tournament.status === 'registration' ? 'Register' :
                     tournament.status === 'inProgress' ? 'Spectate' : 'View Results'}
                  </Button>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}