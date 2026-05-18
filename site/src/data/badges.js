export const GUIDE_KEY = 'wireshark'

const CHAPTERS = [
  'intro', 'capture', 'filters', 'dissectors', 'modbus',
  'dnp3', 'opcua', 'security', 'advanced', 'lab',
]

export { CHAPTERS as BADGE_CHAPTERS }

export const BADGE_DEFS = [
  {
    id: 'first_spark',
    name: 'First Spark',
    desc: 'Passed your first quiz in this course.',
    flavor: 'Every circuit starts with one spark.',
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.55)',
    icon: 'zap',
    condition: (p) => CHAPTERS.some(id => p[id]?.level1Passed || p[id]?.quizPassed),
  },
  {
    id: 'foundations_laid',
    name: 'Foundations Laid',
    desc: 'Passed Level 1 across every chapter.',
    flavor: 'An engineer who skips foundations is a liability.',
    color: '#3b82f6',
    glow: 'rgba(59,130,246,0.55)',
    icon: 'layers',
    condition: (p) => CHAPTERS.every(id => p[id]?.level1Passed || p[id]?.quizPassed),
  },
  {
    id: 'field_technician',
    name: 'Field Technician',
    desc: 'Passed Level 2 across every chapter.',
    flavor: 'Level 2 is where textbooks meet terminals.',
    color: '#f97316',
    glow: 'rgba(249,115,22,0.55)',
    icon: 'wrench',
    condition: (p) => CHAPTERS.every(id => p[id]?.level2Passed),
  },
  {
    id: 'scholar',
    name: 'Scholar',
    desc: 'Cracked Level 3 in at least one chapter.',
    flavor: 'Graduate-level. Chapter and page cited.',
    color: '#a855f7',
    glow: 'rgba(168,85,247,0.55)',
    icon: 'book',
    condition: (p) => CHAPTERS.some(id => p[id]?.level3Passed),
  },
  {
    id: 'war_stories',
    name: 'War Stories',
    desc: 'Completed Field Scenarios in at least one chapter.',
    flavor: 'Real incidents. Real decisions. Real consequences.',
    color: '#22c55e',
    glow: 'rgba(34,197,94,0.55)',
    icon: 'flame',
    condition: (p) => CHAPTERS.some(id => p[id]?.level4Passed),
  },
  {
    id: 'packet_detective',
    name: 'Packet Detective',
    desc: 'Passed all three levels across every chapter.',
    flavor: 'You can read a pcap like a book.',
    color: '#fbbf24',
    glow: 'rgba(251,191,36,0.65)',
    icon: 'shield',
    condition: (p) => CHAPTERS.every(id =>
      (p[id]?.level1Passed || p[id]?.quizPassed) &&
      p[id]?.level2Passed &&
      p[id]?.level3Passed
    ),
  },
]
