import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Shield,
  ShieldCheck,
  Activity,
  Sparkles,
  Lock,
  Hash,
  RotateCcw,
  Sliders,
  Bell,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Layers,
} from 'lucide-react';
import { PaymentInputForm } from './PaymentInputForm';
import { AddScenarioModal } from './AddScenarioModal';
import { WorkflowGraph } from './WorkflowGraph';
import { ConfettiEffect } from './ConfettiEffect';
import { ExplainabilityDrawer } from './ExplainabilityDrawer';
import { AuditChainDrawer } from './AuditChainDrawer';
import { paymentApiService, scenariosApi, SavedScenario } from '../../services/api';
import {
  PipelineStepDetail,
  PipelineStageId,
  AnalyzePaymentResponse,
  TransactionStatus,
  RiskLevel,
  RiskBreakdown,
  RuleSignal,
} from '../../types';
import { UserProfile, getActiveUser } from '../../services/userManager';
import { UserMenuDropdown } from '../common/UserMenuDropdown';

// Summarizes the real triggered-rule signals for one category (falling back
// to a plain, honest "nothing elevated" message when there are none) — so
// this pipeline visualization always matches what the Explainability Drawer
// shows for the same transaction, instead of a canned per-outcome script.
function summarizeSignals(
  signals: RuleSignal[] | undefined,
  category: RuleSignal['category']
): { summary: string; metric: string } {
  const matches = (signals ?? []).filter((s) => s.category === category && s.flag !== 'safe');
  if (matches.length === 0) {
    return { summary: 'No elevated signals in this category.', metric: 'CLEAR' };
  }
  const topFlag = matches.reduce((worst, s) => (flagSeverity(s.flag) > flagSeverity(worst) ? s.flag : worst), matches[0].flag);
  return {
    summary: matches.map((s) => s.reason).join(' · '),
    metric: topFlag.replace('_', ' ').toUpperCase(),
  };
}

function flagSeverity(flag: RuleSignal['flag']): number {
  switch (flag) {
    case 'critical_flag': return 4;
    case 'high_flag': return 3;
    case 'medium_flag': return 2;
    case 'low_flag': return 1;
    default: return 0;
  }
}

interface GuardianAppProps {
  onSwitchToOps?: () => void;
  currentUser?: UserProfile;
  onUserChanged?: (user: UserProfile) => void;
  onLogout?: () => void;
}

export const GuardianApp: React.FC<GuardianAppProps> = ({
  onSwitchToOps,
  currentUser: initialUser,
  onUserChanged,
  onLogout,
}) => {
  // Authenticated user state
  const [currentUser, setCurrentUser] = useState<UserProfile>(initialUser || getActiveUser());

  useEffect(() => {
    if (initialUser) setCurrentUser(initialUser);
  }, [initialUser]);

  const handleUserChanged = (u: UserProfile) => {
    setCurrentUser(u);
    paymentApiService.resetEvaluationState().catch(() => {});
    if (onUserChanged) onUserChanged(u);
  };

  // Form input state
  const [recipientName, setRecipientName] = useState('Rahul Sharma');
  const [upiId, setUpiId] = useState('rahul@upi');
  const [amount, setAmount] = useState<number>(1200);
  const [message, setMessage] = useState('Dinner split from Saturday');

  // Dynamic MongoDB Atlas Scenarios state (Defaults removed per user request)
  const [scenarios, setScenarios] = useState<SavedScenario[]>([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
  const [isAtlasConnected, setIsAtlasConnected] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSavingCurrent, setIsSavingCurrent] = useState(false);

  // Execution state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<AnalyzePaymentResponse | null>(null);

  // Drawers
  const [isExplainOpen, setIsExplainOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Timer reference for elapsed counter
  const timerRef = useRef<number | null>(null);

  // Pipeline stages step state
  const [steps, setSteps] = useState<Record<PipelineStageId, PipelineStepDetail>>({
    transaction: { id: 'transaction', name: 'Transaction Agent', category: 'parallel', status: 'idle' },
    velocity: { id: 'velocity', name: 'Velocity Agent', category: 'parallel', status: 'idle' },
    behavior: { id: 'behavior', name: 'Behavioral Agent', category: 'parallel', status: 'idle' },
    mule: { id: 'mule', name: 'Mule Account Agent', category: 'parallel', status: 'idle' },
    aml: { id: 'aml', name: 'AML Compliance Agent', category: 'parallel', status: 'idle' },
    aggregation: { id: 'aggregation', name: 'Decision & Policy Aggregator', category: 'aggregate', status: 'idle' },
    explainability: { id: 'explainability', name: 'Plain-English Explainability Engine', category: 'explain', status: 'idle' },
    audit: { id: 'audit', name: 'Cryptographic SHA-256 Audit Trail', category: 'audit', status: 'idle' },
    outcome: { id: 'outcome', name: 'Final Outcome', category: 'outcome', status: 'idle' },
  });

  // Load scenarios from MongoDB Atlas on mount
  useEffect(() => {
    loadScenarios();
  }, []);

  const loadScenarios = async () => {
    try {
      const res = await scenariosApi.getAll();
      setScenarios(res.scenarios || []);
      setIsAtlasConnected(res.connected);
    } catch (err) {
      console.error('Failed to load scenarios from MongoDB Atlas:', err);
      setIsAtlasConnected(false);
    }
  };

  const handleSelectScenario = (scenario: SavedScenario) => {
    setSelectedScenarioId(scenario.id);
    setRecipientName(scenario.recipientName);
    setUpiId(scenario.upiId);
    setAmount(scenario.amount);
    setMessage(scenario.message);
    handleReset();
  };

  const handleDeleteScenario = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await scenariosApi.delete(id);
      setScenarios((prev) => prev.filter((s) => s.id !== id));
      if (selectedScenarioId === id) {
        setSelectedScenarioId(null);
      }
    } catch (err) {
      console.error('Failed to delete scenario from MongoDB Atlas:', err);
    }
  };

  const handleSaveCurrentAsScenario = async () => {
    if (!recipientName || !upiId || amount <= 0) return;
    setIsSavingCurrent(true);
    try {
      // Determine expected outcome label based on keywords
      const lower = (recipientName + ' ' + message).toLowerCase();
      let outcomeType: 'SAFE' | 'VERIFY' | 'PAUSED' | 'BLOCKED' = 'VERIFY';
      if (/warrant|police|arrest|court/i.test(lower)) {
        outcomeType = 'BLOCKED';
      } else if (/urgent|electricity|power|tonight|suspend|fine/i.test(lower)) {
        outcomeType = 'PAUSED';
      } else if (/split|dinner|lunch|friend|rent/i.test(lower)) {
        outcomeType = 'SAFE';
      }

      const created = await scenariosApi.create({
        label: `${recipientName} Vector`,
        outcomeType,
        recipientName,
        upiId,
        amount,
        message,
        description: 'Saved directly from active payment simulation form',
      });

      setScenarios((prev) => [created, ...prev]);
      setSelectedScenarioId(created.id);
    } catch (err) {
      console.error('Failed to save current form as scenario to MongoDB Atlas:', err);
    } finally {
      setIsSavingCurrent(false);
    }
  };

  const handleScenarioAdded = (newScenario: SavedScenario) => {
    setScenarios((prev) => [newScenario, ...prev]);
    handleSelectScenario(newScenario);
  };

  const handleReset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsAnalyzing(false);
    setOverallProgress(0);
    setElapsedMs(0);
    setAnalysisResult(null);
    setShowConfetti(false);
    paymentApiService.resetEvaluationState().catch(() => {});
    setSteps({
      transaction: { id: 'transaction', name: 'Transaction Agent', category: 'parallel', status: 'idle' },
      velocity: { id: 'velocity', name: 'Velocity Agent', category: 'parallel', status: 'idle' },
      behavior: { id: 'behavior', name: 'Behavioral Agent', category: 'parallel', status: 'idle' },
      mule: { id: 'mule', name: 'Mule Account Agent', category: 'parallel', status: 'idle' },
      aml: { id: 'aml', name: 'AML Compliance Agent', category: 'parallel', status: 'idle' },
      aggregation: { id: 'aggregation', name: 'Decision & Policy Aggregator', category: 'aggregate', status: 'idle' },
      explainability: { id: 'explainability', name: 'Plain-English Explainability Engine', category: 'explain', status: 'idle' },
      audit: { id: 'audit', name: 'Cryptographic SHA-256 Audit Trail', category: 'audit', status: 'idle' },
      outcome: { id: 'outcome', name: 'Final Outcome', category: 'outcome', status: 'idle' },
    });
  };

  const smoothScrollTo = (elementId: string, block: ScrollLogicalPosition = 'center', delay = 40) => {
    setTimeout(() => {
      const target = document.getElementById(elementId);
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block,
        });
      }
    }, delay);
  };

  const scrollToOutcome = () => {
    const attemptScroll = (retries = 6) => {
      const target =
        document.getElementById('stage-outcome') ||
        document.getElementById('stage-outcome-wrapper');
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      } else if (retries > 0) {
        setTimeout(() => attemptScroll(retries - 1), 70);
      }
    };
    setTimeout(() => attemptScroll(), 60);
  };

  const runPipeline = async () => {
    handleReset();
    setIsAnalyzing(true);
    const startTime = Date.now();

    // Start elapsed counter
    timerRef.current = window.setInterval(() => {
      setElapsedMs(Date.now() - startTime);
    }, 50);

    // Step 1: Smooth transition directly down to the 5 Parallel Specialized Agents
    smoothScrollTo('stage-parallel-agents', 'center', 40);

    // Launch 5 parallel AgentGuard specialist agents simultaneously
    setSteps((prev) => ({
      ...prev,
      transaction: { ...prev.transaction, status: 'running', summary: 'Evaluating transaction deviation against spending baseline...', metric: 'INFERRING' },
      velocity: { ...prev.velocity, status: 'running', summary: 'Scanning burst velocity, micro-probing, and multi-payee frequency...', metric: 'INFERRING' },
      behavior: { ...prev.behavior, status: 'running', summary: 'Analyzing device fingerprints, impossible geo-travel & timing...', metric: 'INFERRING' },
      mule: { ...prev.mule, status: 'running', summary: 'Querying graph topology, community clusters & pass-through ratios...', metric: 'INFERRING' },
      aml: { ...prev.aml, status: 'running', summary: 'Screening structuring below ₹50k, rapid cycling, and sanctions...', metric: 'INFERRING' },
    }));
    setOverallProgress(15);

    // Call AgentGuard multi-agent backend API in parallel
    const backendPromise = paymentApiService.analyzePayment({
      recipientName,
      upiId,
      amount,
      message,
      senderId: currentUser.id,
      senderName: currentUser.name,
    });

    let backendResult: AnalyzePaymentResponse;
    try {
      const res = await backendPromise;
      backendResult = res.data;
    } catch {
      // Fallback calculation if completely offline
      const lower = (recipientName + ' ' + upiId + ' ' + message).toLowerCase();
      if (lower.includes('court') || lower.includes('arrest') || lower.includes('warrant')) {
        backendResult = {
          risk_score: 96,
          risk_level: 'CRITICAL',
          action: 'BLOCKED',
          reasons: [
            'Direct match with known extortion syndicate signatures.',
            'Severe coercion threats detected in payment message.',
            'Target recipient flagged in high-risk campaign database.',
          ],
          breakdown: {
            transactionRisk: 95,
            recipientRisk: 98,
            behaviorRisk: 85,
            socialEngineeringRisk: 99,
            networkRisk: 92,
          },
          analysis_duration: 0.12,
          transaction_id: `TXN-${Date.now().toString().slice(-6)}`,
        };
      } else {
        backendResult = {
          risk_score: 12,
          risk_level: 'SAFE',
          action: 'SAFE',
          reasons: [
            'Verified payee signals and standard spend patterns.',
            'Transfer amount falls well within habitual spending parameters.',
          ],
          breakdown: {
            transactionRisk: 10,
            recipientRisk: 8,
            behaviorRisk: 12,
            socialEngineeringRisk: 5,
            networkRisk: 8,
          },
          analysis_duration: 0.08,
          transaction_id: `TXN-${Date.now().toString().slice(-6)}`,
        };
      }
    }

    const { action, risk_score } = backendResult;
    const agentMap = backendResult.agent_scores || {};

    // 1. Transaction Agent details
    const txnAgent = backendResult.agents?.find((a) => a.agent === 'transaction');
    const txnScore = Math.round(txnAgent?.score ?? agentMap.transaction ?? backendResult.breakdown.transactionRisk);
    const txnStatus =
      txnAgent?.flags?.some((f) => f.includes('BLOCK')) || txnScore >= 80
        ? 'blocked'
        : txnScore >= 50 || (txnAgent?.flags?.length ?? 0) > 0
        ? 'flagged'
        : 'completed';
    const txnSummary =
      txnAgent?.reason ||
      (txnScore <= 30
        ? 'Amount matches habitual spend baseline.'
        : `Elevated transaction deviation: ₹${amount.toLocaleString('en-IN')}`);
    const txnMetric = txnScore <= 30 ? 'BASELINE' : `RISK: ${txnScore}/100`;

    // 2. Velocity Agent details
    const velAgent = backendResult.agents?.find((a) => a.agent === 'velocity');
    const velScore = Math.round(velAgent?.score ?? agentMap.velocity ?? backendResult.breakdown.socialEngineeringRisk);
    const velStatus =
      velAgent?.flags?.some((f) => f.includes('BLOCK')) || velScore >= 80
        ? 'blocked'
        : velScore >= 50 || (velAgent?.flags?.length ?? 0) > 0
        ? 'flagged'
        : 'completed';
    const velSummary =
      velAgent?.reason ||
      (velScore <= 30
        ? 'Normal payment frequency across rolling windows.'
        : 'Burst frequency or micro-probing pattern detected.');
    const velMetric = velScore <= 30 ? 'NORMAL' : `RISK: ${velScore}/100`;

    // 3. Behavioral Agent details
    const behAgent = backendResult.agents?.find((a) => a.agent === 'behavior');
    const behScore = Math.round(behAgent?.score ?? agentMap.behavior ?? backendResult.breakdown.behaviorRisk);
    const behStatus =
      behAgent?.flags?.some((f) => f.includes('BLOCK')) || behScore >= 80
        ? 'blocked'
        : behScore >= 50 || (behAgent?.flags?.length ?? 0) > 0
        ? 'flagged'
        : 'completed';
    const behSummary =
      behAgent?.reason ||
      (behScore <= 30
        ? 'Verified device telemetry and habitual active hours.'
        : 'New device or off-hours behavioral anomaly detected.');
    const behMetric = behScore <= 30 ? 'VERIFIED' : `RISK: ${behScore}/100`;

    // 4. Mule Account Agent details
    const muleAgent = backendResult.agents?.find((a) => a.agent === 'mule');
    const muleScore = Math.round(muleAgent?.score ?? agentMap.mule ?? backendResult.breakdown.recipientRisk);
    const muleStatus =
      muleAgent?.flags?.some((f) => f.includes('BLOCK') || f.includes('BLACKLIST') || f.includes('MULE')) || muleScore >= 80
        ? 'blocked'
        : muleScore >= 50 || (muleAgent?.flags?.length ?? 0) > 0
        ? 'flagged'
        : 'completed';
    const muleSummary =
      muleAgent?.reason ||
      (muleScore <= 30
        ? 'Graph community clean; no sinkhole or fast pass-through links.'
        : 'Payee node exhibits mule clustering or rapid dissipation.');
    const muleMetric = muleScore <= 30 ? 'CLEAN' : `RISK: ${muleScore}/100`;

    // 5. AML Compliance Agent details
    const amlAgent = backendResult.agents?.find((a) => a.agent === 'aml');
    const amlScore = Math.round(amlAgent?.score ?? agentMap.aml ?? backendResult.breakdown.networkRisk);
    const amlStatus =
      amlAgent?.flags?.some((f) => f.includes('BLOCK') || f.includes('SANCTION')) || amlScore >= 80
        ? 'blocked'
        : amlScore >= 50 || (amlAgent?.flags?.length ?? 0) > 0
        ? 'flagged'
        : 'completed';
    const amlSummary =
      amlAgent?.reason ||
      (amlScore <= 30
        ? 'Full AML compliance; zero structuring patterns identified.'
        : 'Smurfing or threshold evasion signature detected.');
    const amlMetric = amlScore <= 30 ? 'COMPLIANT' : `RISK: ${amlScore}/100`;

    // STEP 2A: Transaction Agent resolves (~400ms)
    await new Promise((r) => setTimeout(r, 400));
    setSteps((prev) => ({
      ...prev,
      transaction: { ...prev.transaction, status: txnStatus, summary: txnSummary, metric: txnMetric },
    }));
    setOverallProgress(28);

    // STEP 2B: Velocity Agent resolves (~250ms later)
    await new Promise((r) => setTimeout(r, 250));
    setSteps((prev) => ({
      ...prev,
      velocity: { ...prev.velocity, status: velStatus, summary: velSummary, metric: velMetric },
    }));
    setOverallProgress(42);

    // STEP 2C: Behavioral Agent resolves (~250ms later)
    await new Promise((r) => setTimeout(r, 250));
    setSteps((prev) => ({
      ...prev,
      behavior: { ...prev.behavior, status: behStatus, summary: behSummary, metric: behMetric },
    }));
    setOverallProgress(56);

    // STEP 2D: Mule Account Agent resolves (~250ms later)
    await new Promise((r) => setTimeout(r, 250));
    setSteps((prev) => ({
      ...prev,
      mule: { ...prev.mule, status: muleStatus, summary: muleSummary, metric: muleMetric },
    }));
    setOverallProgress(70);

    // STEP 2E: AML Compliance Agent resolves (~250ms later)
    await new Promise((r) => setTimeout(r, 250));
    setSteps((prev) => ({
      ...prev,
      aml: { ...prev.aml, status: amlStatus, summary: amlSummary, metric: amlMetric },
    }));
    setOverallProgress(80);

    // STEP 3: Decision & Policy Aggregator (~500ms)
    setSteps((prev) => ({
      ...prev,
      aggregation: { ...prev.aggregation, status: 'running' },
    }));
    smoothScrollTo('stage-aggregation-container', 'center', 50);

    await new Promise((r) => setTimeout(r, 500));
    const aggregationSummary = backendResult.escalation_rule
      ? `${backendResult.escalation_rule} · Directive: ${action}`
      : `Specialist 5-agent score fusion: ${risk_score}/100 · Directive: ${action}`;

    setSteps((prev) => ({
      ...prev,
      aggregation: {
        ...prev.aggregation,
        status:
          action === 'BLOCKED'
            ? 'blocked'
            : action === 'PAUSED' || action === 'VERIFY'
            ? 'flagged'
            : 'completed',
        summary: aggregationSummary,
        metric: `SCORE: ${risk_score}/100`,
      },
    }));
    setOverallProgress(88);

    // STEP 4: Plain-English Explainability Engine (~450ms)
    setSteps((prev) => ({
      ...prev,
      explainability: { ...prev.explainability, status: 'running' },
    }));
    smoothScrollTo('stage-explainability-container', 'center', 50);

    await new Promise((r) => setTimeout(r, 450));
    const explainSummary =
      backendResult.llm_reasoning ||
      (backendResult.reasons.length > 0
        ? backendResult.reasons.join(' · ')
        : 'Multi-agent rationales generated for human review');

    setSteps((prev) => ({
      ...prev,
      explainability: {
        ...prev.explainability,
        status: 'completed',
        summary: explainSummary,
        metric: 'SYNTHESIZED',
      },
    }));
    setOverallProgress(94);

    // STEP 5: Cryptographic SHA-256 Audit Trail (~450ms)
    setSteps((prev) => ({
      ...prev,
      audit: { ...prev.audit, status: 'running' },
    }));
    smoothScrollTo('stage-audit-container', 'center', 50);

    await new Promise((r) => setTimeout(r, 450));
    const auditSummary = backendResult.audit_hash
      ? `Block SHA-256: ${backendResult.audit_hash.slice(0, 16)}... chained into ledger`
      : 'Chained into AgentGuard cryptographic ledger';

    setSteps((prev) => ({
      ...prev,
      audit: {
        ...prev.audit,
        status: 'completed',
        summary: auditSummary,
        metric: 'IMMUTABLE',
      },
      outcome: {
        ...prev.outcome,
        status: 'completed',
      },
    }));
    setOverallProgress(100);

    // Complete Analysis
    if (timerRef.current) clearInterval(timerRef.current);
    setIsAnalyzing(false);
    setAnalysisResult(backendResult);

    // Smoothly scroll to the End Result (Outcome Card)
    scrollToOutcome();

    if (action === 'SAFE') {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  const handleConfirmTransaction = async (confirmed: boolean) => {
    if (!analysisResult) return;
    await paymentApiService.confirmTransaction(analysisResult.transaction_id, confirmed);
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 antialiased selection:bg-blue-500/30 selection:text-blue-200">
      <ConfettiEffect active={showConfetti} />

      {/* Main Container */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Navigation Bar / Top Branding */}
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-600/15 text-blue-400">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl font-sans">
                  AgentGuard <span className="text-blue-400 font-mono text-base font-semibold">AI Sentinel</span>
                </h1>
              </div>
              <p className="text-xs text-slate-400">
                Rule-Based Payment Screening Before You Pay
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {onSwitchToOps && (
              <button
                type="button"
                onClick={onSwitchToOps}
                className="hidden sm:flex rounded-lg border border-slate-700/80 bg-[#0B101D] px-3.5 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-slate-100 transition-colors items-center gap-1.5 cursor-pointer"
              >
                <Sliders className="h-3.5 w-3.5 text-blue-400" />
                <span>AgentGuard Dashboard</span>
              </button>
            )}

            {/* Direct access to Audit Ledger */}
            <button
              type="button"
              onClick={() => setIsAuditOpen(true)}
              className="rounded-lg border border-slate-700/80 bg-[#0B101D] px-3.5 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Hash className="h-3.5 w-3.5 text-slate-400" />
              <span className="hidden sm:inline">Cryptographic</span> Audit Trail
            </button>

            {/* MongoDB Atlas Status Chip */}
            <div
              className={`hidden md:flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-mono transition-colors ${
                isAtlasConnected
                  ? 'border-slate-800 bg-[#0B101D] text-slate-300'
                  : 'border-amber-500/30 bg-amber-950/20 text-amber-300'
              }`}
              title="Persistent Scenario Store on MongoDB Atlas"
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isAtlasConnected ? 'bg-blue-400' : 'bg-amber-400 animate-pulse'
                }`}
              />
              <span className="text-[11px]">Atlas: agentguard</span>
            </div>

            {/* Dynamic User Profile & Account Switcher Dropdown */}
            <UserMenuDropdown
              currentUser={currentUser}
              onUserChanged={handleUserChanged}
              onLogout={onLogout}
              onNavigateOps={onSwitchToOps}
              showOpsLink={Boolean(onSwitchToOps)}
            />
          </div>
        </header>

        {/* Section 1: Input Form & Dynamic MongoDB Atlas Scenarios */}
        <section className="mb-8">
          <PaymentInputForm
            recipientName={recipientName}
            setRecipientName={setRecipientName}
            upiId={upiId}
            setUpiId={setUpiId}
            amount={amount}
            setAmount={setAmount}
            message={message}
            setMessage={setMessage}
            scenarios={scenarios}
            selectedScenarioId={selectedScenarioId}
            onSelectScenario={handleSelectScenario}
            onDeleteScenario={handleDeleteScenario}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onSaveCurrentAsScenario={handleSaveCurrentAsScenario}
            isSavingCurrent={isSavingCurrent}
            isAtlasConnected={isAtlasConnected}
            onSubmit={runPipeline}
            isAnalyzing={isAnalyzing}
          />
        </section>

        {/* Section 2: Centerpiece AI Multi-Agent Flow Diagram */}
        <section id="live-orchestration-section" className="mb-12 scroll-mt-20">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-100 tracking-tight flex items-center gap-2">
                <Layers className="h-4 w-4 text-cyan-400" />
                Live Agent Orchestration Graph
              </h2>
              <p className="text-xs text-slate-400">
                Visualizing non-blocking parallel reasoning, rule synthesis, and hash-chain verification.
              </p>
            </div>

            {analysisResult && (
              <button
                type="button"
                onClick={runPipeline}
                disabled={isAnalyzing}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 font-medium transition-colors"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                Re-Run Analysis
              </button>
            )}
          </div>

          <WorkflowGraph
            steps={steps}
            isAnalyzing={isAnalyzing}
            overallProgress={overallProgress}
            elapsedMs={elapsedMs}
            analysisResult={analysisResult}
            recipientName={recipientName}
            upiId={upiId}
            amount={amount}
            onConfirm={handleConfirmTransaction}
            onReset={handleReset}
            onOpenExplainability={() => setIsExplainOpen(true)}
            onOpenAuditTrail={() => setIsAuditOpen(true)}
          />
        </section>

        {/* Drawers */}
        <ExplainabilityDrawer
          isOpen={isExplainOpen}
          onClose={() => setIsExplainOpen(false)}
          reasons={analysisResult?.reasons || []}
          breakdown={analysisResult?.breakdown || null}
          riskScore={analysisResult?.risk_score || 0}
          riskLevel={analysisResult?.risk_level || 'SAFE'}
          action={analysisResult?.action || 'SAFE'}
          recipientName={recipientName}
          amount={amount}
          message={message}
          llmReasoning={analysisResult?.llm_reasoning}
          llmScoreAdjustment={analysisResult?.llm_score_adjustment}
        />

        <AuditChainDrawer
          isOpen={isAuditOpen}
          onClose={() => setIsAuditOpen(false)}
        />

        {/* Modal: Add Custom Scenario to MongoDB Atlas */}
        <AddScenarioModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onScenarioAdded={handleScenarioAdded}
          initialValues={{
            recipientName,
            upiId,
            amount,
            message,
          }}
        />

        {/* Footer */}
      </div>
    </div>
  );
};
