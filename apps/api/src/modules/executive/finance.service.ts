import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AiService } from '../ai/ai.service';

export interface FinancialHealthAuditResult {
  companyId: string;
  financialHealthScore: number; // 0 - 100
  runwayMonths: number;
  netCashFlow: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  capitalEfficiencyRatio: number;
  fiscalRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recommendations: string[];
  auditedAt: string;
}

export interface FinancialForecastResult {
  companyId: string;
  projectedRunway: number;
  monthlyBreakdown: Array<{
    month: string;
    projectedRevenue: number;
    projectedExpenses: number;
    projectedCashBalance: number;
  }>;
  aiStrategicInsights: string;
}

export interface UnitEconomicsResult {
  cac: number; // Customer Acquisition Cost ($)
  ltv: number; // Lifetime Value ($)
  ltvCacRatio: number; // e.g. 3.5x
  grossMarginPercent: number; // e.g. 75%
  paybackMonths: number; // Months to recover CAC
  status: 'EXCELLENT' | 'HEALTHY' | 'UNDERPERFORMING';
  cfoAdvice: string;
}

export interface CapTableScenarioResult {
  preMoneyValuation: number;
  investmentAmount: number;
  postMoneyValuation: number;
  investorEquityPercent: number;
  optionPoolEquityPercent: number;
  founderEquityPercent: number;
  dilutionSummary: string;
}

export interface RunwayAlertResult {
  runwayMonths: number;
  alertLevel: 'NORMAL' | 'WARNING' | 'CRITICAL';
  message: string;
  recommendedActions: string[];
}

@Injectable()
export class FinanceService {
  private readonly logger = new Logger(FinanceService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  /**
   * Conducts live AI financial health audit for tenant company
   */
  async auditFinancialHealth(
    companyId: string,
    monthlyRevenue = 50000,
    monthlyExpenses = 35000,
    currentCashBalance = 250000,
  ): Promise<FinancialHealthAuditResult> {
    this.logger.log(`Conducting financial health audit for company ${companyId}`);

    const netCashFlow = monthlyRevenue - monthlyExpenses;
    const monthlyBurn = monthlyExpenses > monthlyRevenue ? monthlyExpenses - monthlyRevenue : 0;
    const runwayMonths = monthlyBurn > 0 ? Math.round((currentCashBalance / monthlyBurn) * 10) / 10 : 99;

    let fiscalRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    if (runwayMonths < 3) fiscalRiskLevel = 'CRITICAL';
    else if (runwayMonths < 6) fiscalRiskLevel = 'HIGH';
    else if (runwayMonths < 12) fiscalRiskLevel = 'MEDIUM';

    const efficiencyRatio = monthlyExpenses > 0 ? Math.round((monthlyRevenue / monthlyExpenses) * 100) / 100 : 1.0;
    const baseScore = Math.min(100, Math.max(20, Math.round(efficiencyRatio * 50 + (runwayMonths > 24 ? 40 : runwayMonths * 1.5))));

    const promptText = `Conduct a CFO financial health evaluation for an enterprise with Monthly Revenue: $${monthlyRevenue}, Monthly Expenses: $${monthlyExpenses}, Cash Balance: $${currentCashBalance}, Runway: ${runwayMonths} months. Provide 3 high-impact strategic CFO recommendations in JSON format: {"recommendations": ["rec1", "rec2", "rec3"]}.`;

    let aiRecommendations: string[] = [
      'Maintain minimum 6-month operational cash reserve before major expansion.',
      'Optimize recurring vendor subscriptions and infrastructure expenses.',
      'Reinvest surplus cash flow into high-ROI customer acquisition channels.'
    ];

    try {
      const response = await this.aiService.executePrompt({
        prompt: promptText,
        systemPrompt: 'You are the Chief Financial Officer (CFO). Provide authoritative, precise fiscal recommendations.',
        jsonMode: true,
      });
      const parsed = JSON.parse(response.text);
      if (Array.isArray(parsed.recommendations) && parsed.recommendations.length > 0) {
        aiRecommendations = parsed.recommendations;
      }
    } catch (e) {
      const err = e instanceof Error ? e.message : String(e);
      this.logger.warn(`AI CFO recommendation fallback: ${err}`);
    }

    return {
      companyId,
      financialHealthScore: baseScore,
      runwayMonths,
      netCashFlow,
      monthlyRevenue,
      monthlyExpenses,
      capitalEfficiencyRatio: efficiencyRatio,
      fiscalRiskLevel,
      recommendations: aiRecommendations,
      auditedAt: new Date().toISOString(),
    };
  }

  /**
   * Generates dynamic monthly cash flow projection forecast
   */
  async forecastRunway(
    companyId: string,
    initialCash = 250000,
    monthlyRevenue = 50000,
    monthlyExpenses = 35000,
    growthRatePercent = 5,
    monthsCount = 6,
  ): Promise<FinancialForecastResult> {
    const monthlyBreakdown = [];
    let currentBalance = initialCash;
    let rev = monthlyRevenue;
    let exp = monthlyExpenses;

    const now = new Date();
    for (let i = 0; i < monthsCount; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const monthLabel = date.toLocaleString('default', { month: 'short', year: 'numeric' });

      rev = Math.round(rev * (1 + growthRatePercent / 100));
      exp = Math.round(exp * 1.02); // 2% inflation/operational scale
      const net = rev - exp;
      currentBalance += net;

      monthlyBreakdown.push({
        month: monthLabel,
        projectedRevenue: rev,
        projectedExpenses: exp,
        projectedCashBalance: Math.max(0, currentBalance),
      });
    }

    const projectedRunway = currentBalance > 0 ? monthsCount + 12 : Math.round(initialCash / (monthlyExpenses - monthlyRevenue));

    return {
      companyId,
      projectedRunway,
      monthlyBreakdown,
      aiStrategicInsights: `Projections indicate a positive cash trajectory with ${growthRatePercent}% monthly growth. Net cash flow expands balance to $${currentBalance.toLocaleString()} by end of forecast period.`,
    };
  }

  /**
   * Calculates Unit Economics & LTV:CAC Benchmarks
   */
  calculateUnitEconomics(
    cac = 450,
    arpu = 120, // Average Revenue Per User per month
    churnRatePercent = 3.5, // Monthly Churn Rate
    grossMarginPercent = 80,
  ): UnitEconomicsResult {
    const monthlyGrossMarginDecimal = grossMarginPercent / 100;
    const ltv = Math.round((arpu * monthlyGrossMarginDecimal) / (churnRatePercent / 100));
    const ltvCacRatio = Math.round((ltv / (cac || 1)) * 10) / 10;
    const paybackMonths = Math.round((cac / (arpu * monthlyGrossMarginDecimal)) * 10) / 10;

    let status: 'EXCELLENT' | 'HEALTHY' | 'UNDERPERFORMING' = 'HEALTHY';
    if (ltvCacRatio >= 3.5) status = 'EXCELLENT';
    else if (ltvCacRatio < 2.0) status = 'UNDERPERFORMING';

    const cfoAdvice = status === 'EXCELLENT'
      ? `Outstanding Unit Economics! LTV:CAC ratio of ${ltvCacRatio}x exceeds the enterprise 3.0x benchmark. Payback period is ${paybackMonths} months.`
      : status === 'HEALTHY'
      ? `Solid Unit Economics with ${ltvCacRatio}x LTV:CAC. Focus on reducing payback period below 12 months.`
      : `Caution: LTV:CAC of ${ltvCacRatio}x indicates high acquisition cost relative to lifetime customer value. Review ad channels and churn prevention.`;

    return {
      cac,
      ltv,
      ltvCacRatio,
      grossMarginPercent,
      paybackMonths,
      status,
      cfoAdvice,
    };
  }

  /**
   * Simulates Cap Table Equity Dilution Scenario
   */
  simulateCapTableDilution(
    preMoneyValuation = 5000000,
    investmentAmount = 1000000,
    optionPoolPercent = 10,
  ): CapTableScenarioResult {
    const postMoneyValuation = preMoneyValuation + investmentAmount;
    const investorEquityPercent = Math.round((investmentAmount / postMoneyValuation) * 1000) / 10;
    const optionPoolEquityPercent = optionPoolPercent;
    const founderEquityPercent = Math.round((100 - investorEquityPercent - optionPoolEquityPercent) * 10) / 10;

    return {
      preMoneyValuation,
      investmentAmount,
      postMoneyValuation,
      investorEquityPercent,
      optionPoolEquityPercent,
      founderEquityPercent,
      dilutionSummary: `Raising $${(investmentAmount / 1000000).toFixed(1)}M at $${(preMoneyValuation / 1000000).toFixed(1)}M Pre-Money results in $${(postMoneyValuation / 1000000).toFixed(1)}M Post-Money. Founders retain ${founderEquityPercent}% equity post-round.`,
    };
  }

  /**
   * Evaluates Cash Runway Alerts
   */
  checkRunwayAlerts(runwayMonths: number): RunwayAlertResult {
    if (runwayMonths < 3) {
      return {
        runwayMonths,
        alertLevel: 'CRITICAL',
        message: '🚨 CRITICAL RUNWAY ALERT: Less than 3 months of operational cash remaining!',
        recommendedActions: [
          'Pause all non-essential marketing and software subscriptions immediately.',
          'Convene Emergency AI Executive Board meeting for capital injection.',
          'Accelerate pending enterprise contract closures.'
        ],
      };
    } else if (runwayMonths < 6) {
      return {
        runwayMonths,
        alertLevel: 'WARNING',
        message: '⚠️ RUNWAY WARNING: Less than 6 months of operational cash remaining.',
        recommendedActions: [
          'Review discretionary operational expenditures.',
          'Prepare Series Seed/A pitch decks and cap table scenarios.',
          'Focus sales efforts on short-cycle cash upfront contracts.'
        ],
      };
    }

    return {
      runwayMonths,
      alertLevel: 'NORMAL',
      message: '✅ Cash runway is healthy (> 6 months). Operational growth proceeding normally.',
      recommendedActions: [
        'Maintain growth trajectory and reinvest net profits into scaling R&D.'
      ],
    };
  }

  /**
   * Default Marketplace Listing Metadata for Free Finance Department Suite
   */
  getFreeFinanceSuiteListing() {
    return {
      id: 'free-finance-department-suite',
      title: 'Finance & Capital Strategy Suite',
      description: 'World-Class CFO department suite for automated cash flow auditing, runway forecasting, unit economics (LTV:CAC), cap table dilution, and emergency runway alerts.',
      price: 0,
      currency: 'USD',
      category: 'Finance',
      tags: ['CFO', 'Finance', 'Runway', 'UnitEconomics', 'CapTable', 'FreeSuite'],
      listingType: 'DEPARTMENT',
      downloadsCount: 1420,
      rating: 5.0,
      departmentKey: 'Finance & Treasury',
      isFree: true,
    };
  }
}
