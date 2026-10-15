import React from 'react';
import { motion } from 'motion/react';
import {
  Shield,
  UserCheck,
  Cpu,
  Activity,
  Sparkles,
  GitMerge,
  FileText,
  Hash,
  Clock,
} from 'lucide-react';
import { StageCard } from './StageCard';
import {
  BranchingConnector,
  ConvergingConnector,
  VerticalStemConnector,
} from './PipelineConnectors';
import { OutcomeCard } from './OutcomeCard';
import { PipelineStepDetail, AnalyzePaymentResponse } from '../../types';

interface WorkflowGraphProps {
  steps: Record<string, PipelineStepDetail>;
  isAnalyzing: boolean;
  overallProgress: number; // 0 to 100
  elapsedMs: number;
  analysisResult: AnalyzePaymentResponse | null;
  recipientName: string;
  upiId: string;
  amount: number;
  onConfirm: (confirmed: boolean) => Promise<void>;
  onReset: () => void;
  onOpenExplainability: () => void;
  onOpenAuditTrail: () => void;
}

export const WorkflowGraph: React.FC<WorkflowGraphProps> = ({
  steps,
  isAnalyzing,
  overallProgress,
  elapsedMs,
  analysisResult,
  recipientName,
  upiId,
  amount,
  onConfirm,
  onReset,
  onOpenExplainability,
  onOpenAuditTrail,
}) => {
  const isParallelActive =
    steps.transaction?.status === 'running' ||
    steps.velocity?.status === 'running' ||
    steps.behavior?.status === 'running' ||
    steps.mule?.status === 'running' ||
    steps.aml?.status === 'running';

  const isParallelDone =
    (steps.transaction?.status !== 'idle' && steps.transaction?.status !== 'running') ||
    (steps.velocity?.status !== 'idle' && steps.velocity?.status !== 'running') ||
    (steps.behavior?.status !== 'idle' && steps.behavior?.status !== 'running') ||
    (steps.mule?.status !== 'idle' && steps.mule?.status !== 'running') ||
    (steps.aml?.status !== 'idle' && steps.aml?.status !== 'running');

  return (
    <div className="relative mx-auto w-full max-w-6xl">
      {/* Top Pipeline Status & Elapsed Counter Ribbon */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800/80 bg-[#0B101D] p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600/15 border border-blue-500/30 text-blue-400 shrink-0">
            <Activity className="h-4.5 w-4.5" />
          </div>
          <div>
            <span className="text-xs sm:text-sm font-semibold text-slate-100 block">
              AgentGuard Multi-Agent Pipeline
            </span>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className={isAnalyzing ? 'text-blue-300 animate-pulse font-medium' : 'text-slate-400'}>
                Status: {isAnalyzing ? 'Active Multi-Agent Inference' : analysisResult ? 'Evaluation Complete' : 'Standing By'}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 tabular-nums text-slate-400">
                <Clock className="h-3 w-3 text-slate-500" />
                {elapsedMs} ms
              </span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-3 w-full sm:w-64">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-800/90 border border-slate-700/50">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-600 to-cyan-400"
              initial={{ width: 0 }}
              animate={{ width: `${overallProgress}%` }}
              transition={{ ease: 'easeOut', duration: 0.25 }}
            />
          </div>
          <span className="font-mono text-xs font-bold text-slate-200 w-12 text-right tabular-nums">
            {Math.round(overallProgress)}%
          </span>
        </div>
      </div>

      {/* STAGE 2: PARALLEL FAN-OUT (5 Parallel Specialized AgentGuard Agents) */}
      <div id="stage-parallel-agents" className="my-3 scroll-mt-24">
        {/* Fan-out section header banner */}
        <div className="mb-1.5 flex items-center justify-between px-1">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-slate-300 font-semibold">
            <span
              className={`h-2 w-2 rounded-full transition-colors ${
                isParallelActive
                  ? 'bg-blue-400 shadow-sm shadow-blue-400'
                  : isParallelDone
                  ? 'bg-emerald-400'
                  : 'bg-slate-600'
              }`}
            />
            Parallel Fan-Out Execution · 5 Specialist AI Agents
          </div>
          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
            Non-blocking multi-agent risk inference
          </span>
        </div>

        {/* Branching SVG Connector: flows directly down into the 5 cards */}
        <BranchingConnector active={isParallelActive} completed={isParallelDone} />

        {/* 5 Parallel Cards Grid */}
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-5 items-stretch">
          {/* 2A: Transaction Agent */}
          <StageCard
            id="stage-transaction"
            stepNumber="AGENT 2A"
            name="Transaction Agent"
            icon={<Cpu className="h-4 w-4" />}
            status={steps.transaction?.status || 'idle'}
            summary={steps.transaction?.summary}
            metric={steps.transaction?.metric}
            subtitle="Statistical anomaly detection & spend deviation."
          />

          {/* 2B: Velocity Agent */}
          <StageCard
            id="stage-velocity"
            stepNumber="AGENT 2B"
            name="Velocity Agent"
            icon={<Clock className="h-4 w-4" />}
            status={steps.velocity?.status || 'idle'}
            summary={steps.velocity?.summary}
            metric={steps.velocity?.metric}
            subtitle="Burst frequency & micro-probing detector."
          />

          {/* 2C: Behavioral Agent */}
          <StageCard
            id="stage-behavior"
            stepNumber="AGENT 2C"
            name="Behavioral Agent"
            icon={<Activity className="h-4 w-4" />}
            status={steps.behavior?.status || 'idle'}
            summary={steps.behavior?.summary}
            metric={steps.behavior?.metric}
            subtitle="Device consistency, geo-travel & off-hour habits."
          />

          {/* 2D: Mule Account Agent */}
          <StageCard
            id="stage-mule"
            stepNumber="AGENT 2D"
            name="Mule Account Agent"
            icon={<UserCheck className="h-4 w-4" />}
            status={steps.mule?.status || 'idle'}
            summary={steps.mule?.summary}
            metric={steps.mule?.metric}
            subtitle="Graph centrality, community pass-through & sinkhole flags."
          />

          {/* 2E: AML Compliance Agent */}
          <StageCard
            id="stage-aml"
            stepNumber="AGENT 2E"
            name="AML Compliance Agent"
            icon={<Shield className="h-4 w-4" />}
            status={steps.aml?.status || 'idle'}
            summary={steps.aml?.summary}
            metric={steps.aml?.metric}
            subtitle="Smurfing, ₹50k threshold evasion & sanctions."
          />
        </div>
      </div>

      {/* Converging SVG Connector: starts from the 5 cards and converges into Stage 3 */}
      <ConvergingConnector
        active={steps.aggregation?.status === 'running'}
        completed={
          steps.aggregation?.status === 'completed' ||
          steps.aggregation?.status === 'flagged' ||
          steps.aggregation?.status === 'blocked'
        }
      />

      {/* STAGE 3: DECISION & POLICY AGGREGATION */}
      <div id="stage-aggregation-container" className="mx-auto max-w-3xl scroll-mt-24">
        <StageCard
          id="stage-aggregation"
          stepNumber="STAGE 3"
          name="Decision & Policy Aggregator"
          icon={<GitMerge className="h-4.5 w-4.5" />}
          status={steps.aggregation?.status || 'idle'}
          summary={steps.aggregation?.summary}
          metric={steps.aggregation?.metric}
          subtitle="Synthesizes parallel agent vectors into a composite 0–100 risk score and policy mapping."
        />
      </div>

      {/* Vertical Stem into Stage 4 */}
      <VerticalStemConnector
        active={steps.explainability?.status === 'running'}
        completed={steps.explainability?.status === 'completed'}
        color="#3B82F6"
        label="EXPLAIN"
      />

      {/* STAGE 4: EXPLAINABILITY */}
      <div id="stage-explainability-container" className="mx-auto max-w-3xl scroll-mt-24">
        <StageCard
          id="stage-explainability"
          stepNumber="STAGE 4"
          name="Plain-English Explainability Engine"
          icon={<FileText className="h-4.5 w-4.5" />}
          status={steps.explainability?.status || 'idle'}
          summary={steps.explainability?.summary}
          metric={steps.explainability?.metric}
          subtitle="Formulates clear, plain-language bullet rationales explaining the AI decision."
          onActionClick={onOpenExplainability}
          actionLabel="Explainability Matrix"
        />
      </div>

      {/* Vertical Stem into Stage 5 */}
      <VerticalStemConnector
        active={steps.audit?.status === 'running'}
        completed={steps.audit?.status === 'completed'}
        color="#3B82F6"
        label="AUDIT"
      />

      {/* STAGE 5: CRYPTOGRAPHIC AUDIT LOG */}
      <div id="stage-audit-container" className="mx-auto max-w-3xl scroll-mt-24">
        <StageCard
          id="stage-audit"
          stepNumber="STAGE 5"
          name="Cryptographic SHA-256 Audit Trail"
          icon={<Hash className="h-4.5 w-4.5" />}
          status={steps.audit?.status || 'idle'}
          summary={steps.audit?.summary}
          metric={steps.audit?.metric}
          subtitle="Chains decision hash into tamper-evident ledger for mathematical non-repudiation."
          onActionClick={onOpenAuditTrail}
          actionLabel="Audit Ledger"
        />
      </div>

      {/* Vertical Stem into final outcome */}
      {steps.outcome?.status !== 'idle' && (
        <VerticalStemConnector
          active={steps.outcome?.status === 'running'}
          completed={steps.outcome?.status === 'completed'}
          color={
            analysisResult?.action === 'SAFE'
              ? '#10B981'
              : analysisResult?.action === 'BLOCKED'
              ? '#EF4444'
              : '#F59E0B'
          }
          label="OUTCOME"
        />
      )}

      {/* STAGE 6: FINAL OUTCOME HERO CARD */}
      {analysisResult && steps.outcome?.status === 'completed' && (
        <div id="stage-outcome-wrapper" className="mt-4 scroll-mt-24 max-w-4xl mx-auto">
          <OutcomeCard
            id="stage-outcome"
            status={analysisResult.action}
            riskScore={analysisResult.risk_score}
            riskLevel={analysisResult.risk_level}
            recipientName={recipientName}
            upiId={upiId}
            amount={amount}
            transactionId={analysisResult.transaction_id}
            reasons={analysisResult.reasons}
            onConfirm={onConfirm}
            onReset={onReset}
            onOpenExplainability={onOpenExplainability}
            onOpenAuditTrail={onOpenAuditTrail}
          />
        </div>
      )}
    </div>
  );
};
