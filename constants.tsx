
import React from 'react';
import {
  Github,
  Linkedin,
  Mail,
  Phone,
  FileDown
} from 'lucide-react';
import { Project, Skill } from './types';

export const PROJECTS: Project[] = [
  // ── Star Projects (match CV) ──────────────────────────────────────────
  {
    id: 'ai-combat-sim',
    title: 'AI Tactical Combat Simulation',
    description: 'Four AI unit types (Commander, Warrior, Medic, Supplier) each with distinct FSM-based behavior logic. Pathfinding via A* and BFS across a dynamic map with real-time multi-agent state rendering in OpenGL.',
    tags: ['C++', 'OpenGL', 'AI', 'A*', 'FSM'],
    color: 'from-violet-400 to-purple-700',
    imageUrl: 'https://opengraph.githubassets.com/1/noadanon220/ai-game-simulation',
    githubUrl: 'https://github.com/noadanon220/ai-game-simulation',
    repoName: 'ai-game-simulation',
    featured: true,
  },
  {
    id: 'paws',
    title: 'Paws — Dog Care App',
    description: 'Full-stack Android app built from scratch: Firestore, Firebase Auth, Storage, and Google Maps walk-tracking. Designed the complete data architecture and implemented security rules, auth flows, and API access control.',
    tags: ['Kotlin', 'Firebase', 'Android', 'Google Maps'],
    color: 'from-orange-300 to-rose-400',
    imageUrl: 'https://opengraph.githubassets.com/1/noadanon220/paws-dog-care-android-app',
    githubUrl: 'https://github.com/noadanon220/paws-dog-care-android-app',
    repoName: 'paws-dog-care-android-app',
    featured: true,
  },
  {
    id: 'bank-system',
    title: 'Java Bank System',
    description: 'Console-based multi-account banking system in Java. Clean OOP design with inheritance, interfaces, and encapsulation — plus deliberate input validation and role-based access control logic.',
    tags: ['Java', 'OOP', 'Security', 'RBAC'],
    color: 'from-green-300 to-emerald-500',
    imageUrl: 'https://opengraph.githubassets.com/1/noadanon220/java-oop-final-project-bank-system',
    githubUrl: 'https://github.com/noadanon220/java-oop-final-project-bank-system',
    repoName: 'java-oop-final-project-bank-system',
  },
  // ── Other Projects ────────────────────────────────────────────────────
  {
    id: 'gemini-clone',
    title: 'Gemini Clone',
    description: 'A Google Gemini clone built with React. Replicates the Gemini AI chat interface with a clean, responsive design.',
    tags: ['React', 'JavaScript', 'Google AI'],
    color: 'from-indigo-300 to-purple-500',
    imageUrl: 'https://raw.githubusercontent.com/noadanon220/gemini-clone/main/screenshots/home.png',
    githubUrl: 'https://github.com/noadanon220/gemini-clone',
    repoName: 'gemini-clone',
  },
  {
    id: 'pacman',
    title: 'Pacman Java Game',
    description: 'A classic Pac-Man game built with Java and Swing. Features smooth animations, ghost AI, and faithful recreation of the original arcade experience.',
    tags: ['Java', 'Swing', 'Game Dev'],
    color: 'from-yellow-300 to-amber-500',
    imageUrl: 'https://raw.githubusercontent.com/noadanon220/pacman-java-game/main/res/pacman_logo.png',
    githubUrl: 'https://github.com/noadanon220/pacman-java-game',
    repoName: 'pacman-java-game',
  },
  {
    id: 'dodge-drive',
    title: 'Dodge Drive Game',
    description: 'A simple Android driving game developed as part of the Mobile App Dev course. Dodge incoming obstacles and survive as long as possible.',
    tags: ['Kotlin', 'Android', 'Game Dev'],
    color: 'from-blue-300 to-cyan-400',
    imageUrl: 'https://raw.githubusercontent.com/noadanon220/dodge-drive-game-android-app/main/screenshots/dodgeDrive_title.png',
    githubUrl: 'https://github.com/noadanon220/dodge-drive-game-android-app',
    repoName: 'dodge-drive-game-android-app',
  },
  {
    id: 'rubiks-cube-solver',
    title: "Rubik's Cube Solver",
    description: "A browser-based Rubik's Cube solver built with HTML, CSS, and JavaScript. Visualize and solve the cube step by step.",
    tags: ['JavaScript', 'HTML', 'CSS'],
    color: 'from-red-300 to-rose-500',
    imageUrl: 'https://opengraph.githubassets.com/1/noadanon220/rubiks-cube-solver',
    githubUrl: 'https://github.com/noadanon220/rubiks-cube-solver',
    repoName: 'rubiks-cube-solver',
  },
];

export const SKILLS: Skill[] = [
  // Languages
  { name: 'Java',         icon: 'Cpu',         category: 'backend',   color: 'bg-amber-100 text-amber-600' },
  { name: 'Kotlin',       icon: 'Code2',        category: 'frontend',  color: 'bg-purple-100 text-purple-600' },
  { name: 'JavaScript',   icon: 'Code2',        category: 'frontend',  color: 'bg-yellow-100 text-yellow-600' },
  { name: 'TypeScript',   icon: 'ShieldCheck',  category: 'frontend',  color: 'bg-indigo-100 text-indigo-600' },
  { name: 'C#',           icon: 'Code2',        category: 'backend',   color: 'bg-violet-100 text-violet-600' },
  { name: 'Python',       icon: 'Cpu',          category: 'backend',   color: 'bg-blue-100 text-blue-600' },
  { name: 'C++',          icon: 'Cpu',          category: 'backend',   color: 'bg-slate-100 text-slate-600' },
  { name: 'SQL',          icon: 'Layers',       category: 'backend',   color: 'bg-teal-100 text-teal-600' },
  // Frameworks & Mobile
  { name: 'React',        icon: 'Code2',        category: 'frontend',  color: 'bg-cyan-100 text-cyan-600' },
  { name: 'React Native', icon: 'Layout',       category: 'frontend',  color: 'bg-sky-100 text-sky-600' },
  { name: 'Android SDK',  icon: 'Layout',       category: 'frontend',  color: 'bg-emerald-100 text-emerald-600' },
  // Backend & DB
  { name: 'Firebase',     icon: 'Zap',          category: 'backend',   color: 'bg-rose-100 text-rose-600' },
  // Security
  { name: 'OWASP Top 10', icon: 'ShieldCheck',  category: 'other',     color: 'bg-red-100 text-red-600' },
  { name: 'REST APIs',    icon: 'Zap',          category: 'backend',   color: 'bg-green-100 text-green-600' },
  // Tools
  { name: 'Git / GitHub', icon: 'GitBranch',    category: 'other',     color: 'bg-gray-100 text-gray-600' },
  { name: 'Figma',        icon: 'Layout',       category: 'design',    color: 'bg-pink-100 text-pink-600' },
];

export const COURSES = [
  { name: 'AI for Game Dev',           grade: 100 },
  { name: 'Machine Learning',          grade: 99  },
  { name: 'Mobile App Dev',            grade: 97  },
  { name: 'AI Product Management',     grade: 97  },
  { name: 'Final Project',             grade: 96  },
  { name: 'OOP',                       grade: 94  },
  { name: 'Intro to Cybersecurity',    grade: 91  },
  { name: 'Computer Networks',         grade: 91  },
  { name: 'Algorithms & Complexity',   grade: 87  },
  { name: 'Human-Computer Interaction',grade: 87  },
  { name: 'Operating Systems',         grade: 80  },
];

export const SOCIAL_LINKS = [
  { name: 'GitHub',    icon: <Github />,   url: 'https://github.com/noadanon220' },
  { name: 'LinkedIn',  icon: <Linkedin />, url: 'https://www.linkedin.com/in/noadanon/' },
  { name: 'Email',     icon: <Mail />,     url: 'mailto:noadanon220@gmail.com' },
  { name: 'Phone',     icon: <Phone />,    url: 'tel:+972542392442' },
  { name: 'Resume',    icon: <FileDown />, url: '/noa-danon-resume.pdf' },
];
