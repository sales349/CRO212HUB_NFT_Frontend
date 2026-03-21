'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';

const features = [
  {
    title: 'AI Generation',
    description: 'Generate unique NFTs with our Intelligent Layer V1 engine. Customize traits, preview rarity, and mint directly on Cronos.',
    icon: '🎨',
  },
  {
    title: 'Marketplace',
    description: 'Buy and sell NFTs with transparent fees. 3% buyer service fee, 3% seller deduction. No hidden costs.',
    icon: '🏪',
  },
  {
    title: 'Vault & Remix',
    description: 'Save your favorite presets, remix traits, build custom avatars. Your creative workspace on-chain.',
    icon: '💎',
  },
  {
    title: 'Low Fees on Cronos',
    description: 'Mint and trade on Cronos blockchain. Fast transactions, minimal gas costs, EIP-2981 royalties.',
    icon: '⚡',
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function HomePage() {
  const { open } = useAppKit();
  const { isConnected } = useAppKitAccount();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      {/* Hero */}
      <section className="flex flex-col items-center py-20 text-center sm:py-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            <span className="text-gradient">Create, Mint & Trade</span>
            <br />
            <span className="text-foreground">NFTs on Cronos</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            AI-powered generation, transparent marketplace fees, and a creative vault —
            all on Cronos blockchain with low gas costs.
          </p>
        </motion.div>

        <motion.div
          className="mt-10 flex flex-wrap justify-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {isConnected ? (
            <Link
              href="/mint"
              className="glow-hover rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
            >
              Start Creating
            </Link>
          ) : (
            <button
              onClick={() => open()}
              className="glow-hover rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
            >
              Connect Wallet to Start
            </button>
          )}
          <Link
            href="/marketplace"
            className="rounded-full border border-border px-8 py-3 text-sm font-semibold text-foreground transition-all hover:border-primary/50 hover:bg-muted"
          >
            Browse Marketplace
          </Link>
        </motion.div>

        {/* Trust signal */}
        <motion.div
          className="mt-8 flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-2 text-xs text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <span className="h-2 w-2 rounded-full bg-green-500" />
          Mint on Cronos — Low Fees, Fast Transactions
        </motion.div>
      </section>

      {/* Feature Cards */}
      <section className="pb-20">
        <motion.div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={item}
              className="group rounded-xl border border-border bg-background-secondary p-6 transition-all hover:border-primary/30 glow-hover"
            >
              <div className="mb-4 text-3xl">{feature.icon}</div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Fee Transparency Section */}
      <section className="border-t border-border pb-20 pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
            Transparent Fee Model
          </h2>
          <p className="mt-4 text-muted-foreground">
            No hidden costs. Every fee is visible before you transact.
          </p>
        </div>
        <div className="mx-auto mt-10 grid max-w-4xl gap-6 sm:grid-cols-2">
          {/* Primary */}
          <div className="rounded-xl border border-border bg-background-secondary p-6">
            <div className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
              Primary Mints
            </div>
            <div className="text-3xl font-bold text-foreground">2%</div>
            <p className="mt-2 text-sm text-muted-foreground">
              Platform fee deducted from creator proceeds. Buyers pay the clean listed price.
            </p>
          </div>
          {/* Secondary */}
          <div className="rounded-xl border border-border bg-background-secondary p-6">
            <div className="mb-3 text-sm font-semibold uppercase tracking-wider text-secondary">
              Secondary Sales
            </div>
            <div className="text-3xl font-bold text-foreground">6%</div>
            <p className="mt-2 text-sm text-muted-foreground">
              3% buyer service fee (added at checkout) + 3% seller deduction.
              Supports liquidity 2%, treasury/yield vault 2%, $HUB buybacks 2%.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}