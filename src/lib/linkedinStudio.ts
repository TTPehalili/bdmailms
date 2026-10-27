import { CadenceLeadRecord, DEMO_CADENCE_LEADS } from './cadenceMaster';

export interface VisualCardConfig {
  type: 'metric_callout' | 'comparison_grid' | 'quote_teardown' | 'process_flow';
  headline: string;
  subheadline?: string;
  metric?: string;
  metricLabel?: string;
  tag: string;
  accentColor?: string;
}

export interface LinkedInPost {
  id: string;
  episodeNumber: number;
  dayLabel: string; // e.g. "Tuesday • Episode 1"
  title: string;
  hook: string; // Scroll-stopping first 2 lines
  body: string; // Worth-reading body, under 90 words
  cta: string; // High-engagement non-salesy question
  wordCount: number;
  estimatedReadSeconds: number;
  hashtags: string[];
  imagePrompt: string; // Rich prompt for Gemini Imagen / Midjourney / Canva
  realisticPhotoPrompt?: string; // Gemini's ultra-realistic and relatable photography prompt
  realisticImageUrl?: string; // High-res photographic image URL
  visualCard: VisualCardConfig;
  injectedComments: string[]; // 2-3 comments for rep to post, strictly NO em dashes, NO emojis
}

export interface LinkedInSeries {
  seriesTitle: string;
  seriesHookRecap: string; // Continuity hook connecting to last week's series
  targetBottleneckSummary: string; // What client pain point this 3-post arc solves
  targetAudience: string;
  posts: LinkedInPost[];
}

export interface ViralCommentDraft {
  id: string;
  angle: 'Counter-Perspective' | 'Consultative Question' | 'Frontline BPO Operator' | 'Punchy 20-Word';
  comment: string; // Strictly NO em dashes, NO emojis, short
  wordCount: number;
  intent: string;
}

export interface ViralPostAnalysis {
  originalSnippet: string;
  coreThesis: string;
  commentDrafts: ViralCommentDraft[];
}

export interface CsvIntelligenceSummary {
  totalLeads: number;
  dominantHeadcount: string;
  topPainPoints: string[];
  topTechStacks: string[];
  topCompetitors: string[];
  targetDepartments: string[];
  summaryNarrative: string;
}

export interface LinkedInFramework {
  id: string;
  name: string;
  tag: string;
  description: string;
  hookPhilosophy: string;
  bodyPhilosophy: string;
  ctaPhilosophy: string;
  sampleHook: string;
}

export const LINKEDIN_FRAMEWORKS: LinkedInFramework[] = [
  {
    id: 'contrarian-truth',
    name: 'Contrarian Truth & Myth Buster',
    tag: 'HIGH VIRALITY',
    description: 'Directly challenges comfortable conventional wisdom in outbound and BPO operations that actually destroys margins.',
    hookPhilosophy: 'State the common belief in sentence 1, then invalidate it with a hard truth in sentence 2.',
    bodyPhilosophy: 'Concise 3-line contrast under 80 words. Contrast the old way vs the new reality.',
    ctaPhilosophy: 'Curiosity-driven question asking if the reader agrees or sees it differently.',
    sampleHook: 'Most BPOs think adding 20 more SDRs solves revenue slumps. It usually just burns your list 3x faster.'
  },
  {
    id: 'under-90-data-teardown',
    name: 'The Under-90-Word Data Teardown',
    tag: 'PROOF DRIVEN',
    description: 'Presents a hard, unvarnished operational metric (margin skims, call hold rates, ramp times) and explains the 1 tweak that shifted it.',
    hookPhilosophy: 'Lead with an exact, non-rounded metric that immediately establishes operational credibility.',
    bodyPhilosophy: 'Strictly under 75 words. Zero corporate jargon. Clear visual spacing with 1-line punchlines.',
    ctaPhilosophy: 'Ask what their floor or team benchmarks are for this exact metric.',
    sampleHook: 'We audited 500k contact center dials last quarter. 98% of lost deals happened in the first 40 seconds.'
  },
  {
    id: 'unspoken-blindspot',
    name: 'The Unspoken Operational Blindspot',
    tag: 'EXECUTIVE MAGNET',
    description: 'Exposes the hidden leak that BPO CROs and VP Ops are aware of privately but rarely discuss publicly.',
    hookPhilosophy: 'Label the hidden cost or uncomfortable friction that executives secretly lose sleep over.',
    bodyPhilosophy: 'Explain why smart leaders tolerate this leak and the exact operational pivot that ends it.',
    ctaPhilosophy: 'Ask how their leadership team is tackling this dilemma this quarter.',
    sampleHook: 'The biggest lie in outbound sales is that junior reps need 3 weeks of classroom roleplay before touching live dials.'
  },
  {
    id: 'frontline-floor-lesson',
    name: 'Frontline Floor Operator Lesson',
    tag: 'AUTHENTIC & RAW',
    description: 'A genuine observation from managing live dials, listening to prospect objections, and fixing sales friction.',
    hookPhilosophy: 'Drop the reader right into the middle of a real scenario from yesterday’s floor production.',
    bodyPhilosophy: 'Under 85 words. No ego, pure diagnostic value on how a specific objection was disassembled.',
    ctaPhilosophy: 'Ask fellow setters and operators how they handle this on their current campaigns.',
    sampleHook: 'Yesterday an enterprise VP said: "We already work with a BPO and hate their shared lists." Here is how we responded without pitching.'
  },
  {
    id: 'two-way-debate',
    name: 'Consultative Two-Way Debate',
    tag: 'MAX ENGAGEMENT',
    description: 'Frames a genuine strategic dilemma facing BPO leaders and invites thoughtful peer-to-peer discourse.',
    hookPhilosophy: 'Present an either/or dilemma where neither conventional answer works.',
    bodyPhilosophy: 'Frame the pros and cons in 60 words, then present the consultative middle path.',
    ctaPhilosophy: 'Invite the community to vote on option A, option B, or share their own playbook.',
    sampleHook: 'Should BPO setters be compensated on dials completed, or exclusively on qualified enterprise sits held?'
  }
];

export const CONTINUITY_SERIES_PRESETS = [
  {
    id: 'broker-margin-continuity',
    title: 'Broker Margin & Shared List Elimination Arc',
    recapHook: 'Last week we broke down why paying brokers 35% margin skims for recycled leads destroys BPO profitability. This week, we go deeper into building direct-to-contract pipelines.',
    theme: 'Direct Enterprise Contracts vs Commodity Broker Dependency'
  },
  {
    id: 'ramp-time-continuity',
    title: '72-Hour Rep Ramp & Sparring Arc',
    recapHook: 'Following up on last week\'s discussion about the "rookie tax" of reps burning 500 client leads during onboarding. This week: the 3-day transition to production.',
    theme: 'Eliminating the 3-Week Classroom Onboarding Tax'
  },
  {
    id: 'objection-stumble-continuity',
    title: 'Sub-180ms Objection Handling Arc',
    recapHook: 'Building on last Friday\'s debate on why script-reading telemarketers fail with North American buyers. This week: consultative peer-to-peer dialogue frameworks.',
    theme: 'Transforming Telemarketers into Trusted BPO Consultants'
  }
];

/**
 * Strips all emojis and replaces em dashes to satisfy strict anti-bot prompt rules
 */
export function sanitizeTextForLinkedIn(text: string): string {
  if (!text) return '';
  // 1. Remove all em dashes and en dashes
  let clean = text
    .replace(/—/g, ', ')
    .replace(/–/g, ', ')
    .replace(/\s*--\s*/g, ', ');

  // 2. Remove all emojis
  clean = clean.replace(
    /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
    ''
  );

  // 3. Clean up double spaces or awkward punctuation
  clean = clean
    .replace(/\s{2,}/g, ' ')
    .replace(/,\s*,/g, ',')
    .replace(/\s+,/g, ',')
    .replace(/\s+\./g, '.')
    .trim();

  return clean;
}

/**
 * Summarizes the active CSV leads dataset to extract aggregate intelligence
 */
export function summarizeCsvLeads(leads: CadenceLeadRecord[] = DEMO_CADENCE_LEADS): CsvIntelligenceSummary {
  const dataset = leads && leads.length > 0 ? leads : DEMO_CADENCE_LEADS;
  const totalLeads = dataset.length;

  // Extract pain points
  const painPointCounts: Record<string, number> = {};
  const techCounts: Record<string, number> = {};
  const competitorCounts: Record<string, number> = {};
  const headcountCounts: Record<string, number> = {};
  const deptCounts: Record<string, number> = {};

  dataset.forEach(l => {
    // Pain point
    const pain = (l.painPoint || 'shared lead list fatigue and margin skims').toLowerCase();
    painPointCounts[pain] = (painPointCounts[pain] || 0) + 1;

    // Tech
    const tech = l.techStack || 'Apollo.io and HubSpot CRM';
    techCounts[tech] = (techCounts[tech] || 0) + 1;

    // Competitor
    const comp = l.outsourcer || 'Titan BPO Solutions';
    competitorCounts[comp] = (competitorCounts[comp] || 0) + 1;

    // Headcount
    const hc = l.headcount || '50-100 seats';
    headcountCounts[hc] = (headcountCounts[hc] || 0) + 1;

    // Department
    const dept = l.department || 'Outbound Operations';
    deptCounts[dept] = (deptCounts[dept] || 0) + 1;
  });

  const topPainPoints = Object.entries(painPointCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([k]) => k);

  const topTechStacks = Object.entries(techCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([k]) => k);

  const topCompetitors = Object.entries(competitorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([k]) => k);

  const topHeadcounts = Object.entries(headcountCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([k]) => k);

  const dominantHeadcount = topHeadcounts[0] || '50-250 Seats';

  const narrative = `Across ${totalLeads} active target accounts, the primary bottleneck is ${topPainPoints[0] || 'objection drop-offs and broker margin pressure'}. Most accounts operate on ${dominantHeadcount} floors utilizing ${topTechStacks[0] || 'Apollo and HubSpot'}, with incumbent friction centered around ${topCompetitors[0] || 'commodity outsourcers'}.`;

  return {
    totalLeads,
    dominantHeadcount,
    topPainPoints: topPainPoints.length > 0 ? topPainPoints : ['Shared lead list fatigue', 'Junior rep objection stumbling', '35% broker margin skims'],
    topTechStacks: topTechStacks.length > 0 ? topTechStacks : ['Apollo.io & HubSpot', 'Salesforce & Outreach'],
    topCompetitors: topCompetitors.length > 0 ? topCompetitors : ['Titan BPO Solutions', 'Apex Outsource Group'],
    targetDepartments: Object.keys(deptCounts).slice(0, 3),
    summaryNarrative: narrative
  };
}

/**
 * Deterministic fallback generator for 3-part LinkedIn Series
 */
export function getDeterministicLinkedInSeries(
  summary: CsvIntelligenceSummary,
  frameworkId: string = 'contrarian-truth',
  presetId: string = 'broker-margin-continuity'
): LinkedInSeries {
  const preset = CONTINUITY_SERIES_PRESETS.find(p => p.id === presetId) || CONTINUITY_SERIES_PRESETS[0];
  const primaryPain = summary.topPainPoints[0] || 'shared lead list fatigue and margin skims';
  const competitor = summary.topCompetitors[0] || 'commodity outsourcers';

  return {
    seriesTitle: `The Autonomous BPO Outbound Series: Part 1-3`,
    seriesHookRecap: preset.recapHook,
    targetBottleneckSummary: `Grounded in ${summary.totalLeads} accounts: Tackling ${primaryPain} across ${summary.dominantHeadcount} floors.`,
    targetAudience: `BPO Founders, Managing Directors, CROs & Outbound Operations Leaders`,
    posts: [
      {
        id: 'post-ep1',
        episodeNumber: 1,
        dayLabel: 'Tuesday • Episode 1',
        title: 'The Bottleneck Unveiled: The Incumbent Lead Trap',
        hook: `Most BPOs think adding 15 more SDRs solves revenue slumps.\nIn reality, it just burns your paid prospect list 3x faster.`,
        body: `When we look at ${summary.dominantHeadcount} contact centers, the bottleneck is rarely rep activity.\n\nIt is lead fatigue. Reps are handed identical directory lists that 4 other BPOs called this morning.\n\nProspects do not hate outbound. They hate answering the same generic script 5 times before lunch.`,
        cta: `Curious: is your floor running private enriched lists right now, or still battling shared directory databases?`,
        wordCount: 68,
        estimatedReadSeconds: 18,
        hashtags: ['#BPOOperations', '#ClientAcquisition', '#SalesDevelopment', '#OutboundStrategy', '#InsideSales'],
        imagePrompt: `Minimalist high-contrast dark graphite infographic showing a 2-way split diagram: Left side labeled "The Shared Lead Trap" with red downward margin curve, Right side labeled "Proprietary Enriched Pipeline" with steady emerald growth line. Clean Swiss typography, zero clutter, 4k editorial graphic.`,
        realisticPhotoPrompt: `A realistic, relatable, candid 35mm photograph of a modern B2B sales development representative or operations lead sitting at a clean minimalist office desk. They are focused on dual monitor screens showing clean data charts, wearing a subtle headset, holding a pen over a notebook with a ceramic coffee mug nearby. Soft natural daylight from an office window, authentic human expression, natural skin texture, Kodak Portra 400 film aesthetic, shallow depth of field, zero cartoon, zero cheesy corporate stock photography, relatable and grounded.`,
        realisticImageUrl: '/images/linkedin/episode-1-realistic.jpg',
        visualCard: {
          type: 'metric_callout',
          headline: 'The Shared Lead Trap vs Proprietary Pipeline',
          subheadline: 'Why adding more reps burns lists faster instead of filling seats',
          metric: '35%',
          metricLabel: 'Average margin skim paid to middlemen',
          tag: 'EPISODE 01 • THE BOTTLENECK'
        },
        injectedComments: [
          'First comment for context: we audited 500k dials across mid-market BPOs and found that 82% of prospect hang-ups occur within the first 15 seconds due to generic script phrasing.',
          'Curious to hear from other floor managers. How often are your reps encountering prospects who were already pitched by a competitor that same morning?'
        ]
      },
      {
        id: 'post-ep2',
        episodeNumber: 2,
        dayLabel: 'Thursday • Episode 2',
        title: 'The Tactical Playbook: 72-Hour Ramp Without Burning Client Leads',
        hook: `The single most expensive tax in outbound is the "rookie ramp."\nLetting new SDRs practice on live client prospects.`,
        body: `Instead of 3 weeks in a classroom reading PDF scripts, high-performing floors run sub-180ms voice AI sparring.\n\nNew hires face 40 simulated hostile calls on Day 1. By Day 3, they hit live dials with zero hesitation and zero list burning.\n\nConfidence is not taught in a slide deck. It is built through reps.`,
        cta: `How many days does it take your new hires to book their first verified sit?`,
        wordCount: 71,
        estimatedReadSeconds: 19,
        hashtags: ['#SalesEnablement', '#SDRTraining', '#BPOLeadership', '#ContactCenter', '#OutboundSales'],
        imagePrompt: `Clean modern editorial diagram on dark zinc backdrop showing a 3-day timeline: Day 1 (AI Voice Sparring 40+ drills), Day 2 (Live Teleprompter Context), Day 3 (Production Dials). Modern tech aesthetic, sleek data points, 8k resolution.`,
        realisticPhotoPrompt: `A candid, authentic 35mm photograph of two professionals in a modern glass office discussing strategy. An energetic sales coach or operations leader is pointing to a laptop screen while explaining a conversation tactic, and a colleague with a notepad is smiling thoughtfully and nodding. Warm daylight, modern contemporary startup office, natural unposed expressions, authentic depth of field, Fujicolor Pro 400H tone, zero corporate stock cliché, genuine human connection.`,
        realisticImageUrl: '/images/linkedin/episode-2-realistic.jpg',
        visualCard: {
          type: 'process_flow',
          headline: 'The 72-Hour Production Ramp Framework',
          subheadline: 'Day 1 Sparring -> Day 2 Teleprompter -> Day 3 Production',
          metric: '72 hrs',
          metricLabel: 'Time to live production without burning leads',
          tag: 'EPISODE 02 • THE PLAYBOOK'
        },
        injectedComments: [
          'Dropping a quick operational stat here: floors that practice objection sparring prior to live dials report a 40% reduction in first-week agent churn.',
          'Would love to hear how operations teams currently evaluate whether a new setter is truly ready for live dials.'
        ]
      },
      {
        id: 'post-ep3',
        episodeNumber: 3,
        dayLabel: 'Friday • Episode 3',
        title: 'The Unspoken Dilemma & Series Bridge: Direct Contracts vs Broker Commissions',
        hook: `Next week we are diving into billable seat economics.\nBefore we do, I want to pose an uncomfortable question to BPO leaders:`,
        body: `Why are so many floors still content surrendering 30% to 35% of their revenue to lead brokers and middlemen?\n\nDirect US and European enterprise contracts exist. The hurdle is not quality of delivery. It is having an internal client acquisition engine you control.\n\nWhen you own your pipeline, you own your pricing.`,
        cta: `Would you rather have 10 seats filled through a broker at $14/hr, or 6 seats filled direct at $24/hr?`,
        wordCount: 74,
        estimatedReadSeconds: 20,
        hashtags: ['#BPOStrategy', '#BusinessDevelopment', '#RevenueGrowth', '#OutsourcingLeadership', '#DealEconomics'],
        imagePrompt: `High-resolution executive comparison card comparing two margin models on dark charcoal background: Model A (Broker Skim) vs Model B (Direct Contract Margin). Clean geometric design, crisp white and gold typography.`,
        realisticPhotoPrompt: `A candid, relatable 35mm photograph of a confident professional standing by a glass whiteboard with handwritten outbound performance metrics and a seat economics diagram. Holding a dry erase marker, turning with a thoughtful, engaging expression towards a client or team member. Sunlight filtering into a modern high-rise office, natural depth of field, authentic photojournalism style, Kodak Portra 800 tone, completely realistic, non-staged, relatable B2B thought leadership style.`,
        realisticImageUrl: '/images/linkedin/episode-3-realistic.jpg',
        visualCard: {
          type: 'comparison_grid',
          headline: 'Broker Dependency vs Direct Pipeline Ownership',
          subheadline: 'Comparing billable rates and margin retention',
          metric: '$24/hr',
          metricLabel: 'Direct enterprise contract billable rate',
          tag: 'EPISODE 03 • THE DEBATE'
        },
        injectedComments: [
          'To clarify, brokers have their place for immediate floor fill, but over-relying on them leaves BPOs vulnerable to sudden margin cuts.',
          'Next Tuesday we will break down the exact list-building filters top BDM teams use to bypass middlemen entirely.'
        ]
      }
    ]
  };
}

/**
 * Deterministic fallback for viral post engagement comments
 * Strictly NO em dashes, NO emojis, shorter comments
 */
export function getDeterministicViralComments(viralPostText: string): ViralCommentDraft[] {
  const snippet = viralPostText.slice(0, 100);

  return [
    {
      id: 'viral-cmt-1',
      angle: 'Counter-Perspective',
      comment: 'Interesting take, but in BPO operations we usually see the opposite. Activity numbers mean nothing if the list has already been fatigued by three other agencies. List exclusivity beats call volume every time.',
      wordCount: 33,
      intent: 'Challenges conventional wisdom respectfully with operational reality.'
    },
    {
      id: 'viral-cmt-2',
      angle: 'Consultative Question',
      comment: 'Curious how you track this across junior versus senior reps. We find newer reps stumble on objections in the first 20 seconds, which skews the whole data set. What is your benchmark for call hold time?',
      wordCount: 36,
      intent: 'Prompts the creator and other executives to reply by asking a sharp operational question.'
    },
    {
      id: 'viral-cmt-3',
      angle: 'Frontline BPO Operator',
      comment: 'Spot on. On our outbound floors, once reps stopped reading rigid PDF scripts and treated calls as diagnostic conversations, qualified sits increased significantly. The script is usually the real bottleneck.',
      wordCount: 30,
      intent: 'Shares verified frontline experience without promoting or selling.'
    },
    {
      id: 'viral-cmt-4',
      angle: 'Punchy 20-Word',
      comment: 'Execution always trumps script length. When reps sound like consultants instead of telemarketers, gatekeepers let their guard down immediately.',
      wordCount: 19,
      intent: 'Under 20 words. Clean, punchy agreement that gets pinned by the author.'
    }
  ];
}

export interface ThreadFollowUpDraft {
  id: string;
  stage: 'Deepen Dialogue' | 'Nuanced Counter' | 'Relationship Bridge to DM';
  reply: string; // Strictly NO em dashes, NO emojis, short
  wordCount: number;
  strategicGoal: string;
}

/**
 * Deterministic fallback for continuing a LinkedIn comment thread with an author or prospect
 * Strictly NO em dashes, NO emojis, shorter comments
 */
export function getDeterministicThreadFollowUps(authorReplyText: string): ThreadFollowUpDraft[] {
  return [
    {
      id: 'thread-reply-1',
      stage: 'Deepen Dialogue',
      reply: 'Fair point on that distinction. We noticed that when reps switch to permission openers, conversion doubles even on the same headcount. Have you tested varying the first fifteen seconds?',
      wordCount: 30,
      strategicGoal: 'Validates their reply while introducing a specific operational test.'
    },
    {
      id: 'thread-reply-2',
      stage: 'Nuanced Counter',
      reply: 'Completely agree on the quality side. The dilemma most founders face is balancing lead volume against rep idle time. How does your floor protect against burning fresh accounts during ramp?',
      wordCount: 30,
      strategicGoal: 'Keeps the public dialogue thought-provoking and positions you as a peer.'
    },
    {
      id: 'thread-reply-3',
      stage: 'Relationship Bridge to DM',
      reply: 'Appreciate the thoughtful exchange on this. Sent you a connection request so we can stay in touch as the Q3 outbound landscape evolves.',
      wordCount: 23,
      strategicGoal: 'Natural, zero-pressure invitation to connect and transition into direct messaging.'
    }
  ];
}

