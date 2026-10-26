// Landing Page
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Dice1, Dice2, Dice3, Users, Trophy, Bot, Puzzle, Shield, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@monopoly/ui-components';

export function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-monopoly-red/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-monopoly-blue/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-[90vh] flex items-center justify-center px-4 py-20">
          <div className="max-w-6xl w-full text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Logo */}
              <div className="inline-flex items-center gap-3 mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-monopoly-red to-red-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-monopoly-red/25">
                  <span className="font-bold text-white text-3xl">M</span>
                </div>
                <div className="text-left">
                  <h1 className="font-display text-5xl lg:text-7xl font-bold text-white tracking-tight">
                    Monopoly
                  </h1>
                  <p className="text-monopoly-red font-medium">Advanced Edition</p>
                </div>
              </div>

              <motion.p
                className="text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                Experience the classic board game reimagined with real-time multiplayer,
                custom rules, AI opponents, tournaments, and a powerful modding system.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <Button size="xl" asChild>
                  <Link to="/register">
                    <span className="flex items-center gap-2">
                      Start Playing Free
                      <ArrowRight size={20} />
                    </span>
                  </Link>
                </Button>
                <Button variant="outline" size="xl" asChild>
                  <Link to="/lobbies">Watch Live Games</Link>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-4xl lg:text-5xl font-bold text-white mb-4">
                Everything You Love, <span className="text-monopoly-red">Evolved</span>
              </h2>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                Built from the ground up with modern technology for the best Monopoly experience.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <motion.article
                  key={feature.title}
                  className="group p-6 bg-gray-900/50 border border-gray-800 rounded-2xl hover:border-monopoly-red/50 hover:bg-gray-900 transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="w-12 h-12 bg-monopoly-red/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-monopoly-red/40 transition-colors">
                    <feature.icon className="w-6 h-6 text-monopoly-red" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* Tech Stack */}
        <section className="py-20 px-4 bg-gray-900/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display text-4xl font-bold text-white mb-4">Built with Modern Tech</h2>
              <p className="text-gray-400">A robust, scalable architecture for seamless gameplay</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-8 text-gray-400">
              {techStack.map((tech) => (
                <span key={tech} className="text-lg font-medium hover:text-white transition-colors cursor-default">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              className="p-8 lg:p-12 bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-3xl"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center justify-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-monopoly-red" />
                <h2 className="font-display text-3xl lg:text-4xl font-bold text-white">
                  Ready to Play?
                </h2>
                <Sparkles className="w-6 h-6 text-monopoly-red" />
              </div>
              <p className="text-lg text-gray-300 mb-8 max-w-xl mx-auto">
                Join thousands of players in the most advanced Monopoly experience ever created.
                Free to play, no download required.
              </p>
              <Button size="xl" asChild className="w-full sm:w-auto">
                <Link to="/register">
                  <span className="flex items-center gap-2 justify-center">
                    Create Free Account
                    <ArrowRight size={20} />
                  </span>
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-gray-500 text-sm">
          <p>© 2026 Monopoly Game. Built with ❤️ for board game enthusiasts.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">GitHub</a>
            <a href="#" className="hover:text-white transition-colors">Discord</a>
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    title: 'Real-time Multiplayer',
    description: 'Play with friends worldwide using WebSocket-powered real-time gameplay with reconnection support.',
    icon: Users,
  },
  {
    title: 'Smart AI Opponents',
    description: 'Four difficulty levels powered by Minimax + MCTS algorithms with configurable personalities.',
    icon: Bot,
  },
  {
    title: 'Custom Rules Engine',
    description: '25+ built-in house rules plus a visual DSL to create your own rule variations.',
    icon: Puzzle,
  },
  {
    title: 'Tournaments & Leagues',
    description: 'Swiss, elimination, and round-robin formats with Glicko-2 ratings and seasonal leaderboards.',
    icon: Trophy,
  },
  {
    title: 'Modding Platform',
    description: 'Secure plugin sandbox for board skins, piece sets, rule packs, and custom game modes.',
    icon: Shield,
  },
  {
    title: 'Cross-Platform Sync',
    description: 'Cloud saves with offline-first IndexedDB, conflict resolution, and device management.',
    icon: Dice1,
  },
];

const techStack = [
  'React 18', 'TypeScript', 'Vite', 'Tailwind CSS',
  'Node.js', 'Fastify', 'Socket.io', 'PostgreSQL',
  'Prisma', 'Redis', 'Turborepo', 'Vitest', 'Playwright'
];