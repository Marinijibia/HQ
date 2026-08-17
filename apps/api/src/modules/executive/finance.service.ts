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
  dataSource: 'live' | 'insufficient';
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
  dataSource: 'live' | 'insufficient';
}

export interface UnitEconomicsResult {
  cac: number;
  ltv: number;
  ltvCacRatio: number;
  grossMarginPercent: number;
  paybackMonths: number;
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
   * Derives real financial figures from the org's wallet and transaction history.
   * Returns null if no real data is available — callers must handle the insufficient case.
   */
  private async deriveOrgFinancials(companyId: string): Promise<{
    currentCashBalance: number;
    monthlyRevenue: number;
    monthlyExpenses: number;
  } | null> {
    try {
      const wallet = await this.prisma.organizationWallet.findUnique({
        where: { companyId },
      });

      if (!wallet) return null;

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const transactions = await this.prisma.walletTransaction.findMany({
        where: {
          companyId,
          createdAt: { gte: thirtyDaysAgo },
          status: 'COMPLETED',
        },
      });

      if (transactions.length === 0 && wallet.balanceUsd === 0) return null;

      const monthlyRevenue = transactions
        .filter((t) => t.type === 'DEPOSIT')
        .reduce((sum, t) => sum + t.amountUsd, 0);

      const monthlyExpenses = transactions
        .filter((t) => t.type === 'AGENT_PAYMENT' || t.type === 'WITHDRAWAL')
        .reduce((sum, t) => sum + t.amountUsd, 0);

      return {
        currentCashBalance: wallet.balanceUsd,
        monthlyRevenue,
        monthlyExpenses,
      };
    } catch (err) {
      this.logger.warn(
        `[Finance Service] Financial data derivation notice: ${err}`,
      );
      return null;
    }
  }

  /**
   * Conducts live AI financial health audit using real wallet data.
   * Returns dataSource: 'insufficient' if the org has no real financial data yet.
   */
  async auditFinancialHealth(
    companyId: string,
  ): Promise<FinancialHealthAuditResult> {
    this.logger.log(
      `[CFO Director] Conducting financial health audit for company ${companyId}`,
    );

    const orgFinancials = await this.deriveOrgFinancials(companyId);

    if (!orgFinancials) {
      this.logger.warn(
        `[CFO Director] No real financial data found for ${companyId}. Returning data_insufficient status.`,
      );
      return {
        companyId,
        financialHealthScore: 0,
        runwayMonths: 0,
        netCashFlow: 0,
        monthlyRevenue: 0,
        monthlyExpenses: 0,
        capitalEfficiencyRatio: 0,
        fiscalRiskLevel: 'CRITICAL',
        recommendations: [
          'No financial data available yet. Add funds to your organization wallet to begin financial health tracking.',
          'Once active, the CFO director will generate live audit reports based on your actual revenue and expense data.',
        ],
        auditedAt: new Date().toISOString(),
        dataSource: 'insufficient',
      };
    }

    const { currentCashBalance, monthlyRevenue, monthlyExpenses } =
      orgFinancials;

    const netCashFlow = monthlyRevenue - monthlyExpenses;
    const monthlyBurn =
      monthlyExpenses > monthlyRevenue ? monthlyExpenses - monthlyRevenue : 0;
    const runwayMonths =
      monthlyBurn > 0
        ? Math.round((currentCashBalance / monthlyBurn) * 10) / 10
        : 99;

    let fiscalRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    if (runwayMonths < 3) fiscalRiskLevel = 'CRITICAL';
    else if (runwayMonths < 6) fiscalRiskLevel = 'HIGH';
    else if (runwayMonths < 12) fiscalRiskLevel = 'MEDIUM';

    const efficiencyRatio =
      monthlyExpenses > 0
        ? Math.round((monthlyRevenue / monthlyExpenses) * 100) / 100
        : 1.0;
    const baseScore = Math.min(
      100,
      Math.max(
        20,
        Math.round(
          efficiencyRatio * 50 + (runwayMonths > 24 ? 40 : runwayMonths * 1.5),
        ),
      ),
    );

    const promptText = `Conduct a CFO financial health evaluation for an enterprise with: Monthly Revenue: $${monthlyRevenue}, Monthly Expenses: $${monthlyExpenses}, Cash Balance: $${currentCashBalance}, Runway: ${runwayMonths} months. Provide 3 high-impact CFO recommendations in JSON: {"recommendations": ["rec1", "rec2", "rec3"]}.`;

    let aiRecommendations: string[] = [];
    try {
      const response = await this.aiService.executePrompt({
        prompt: promptText,
        systemPrompt:
          'You are the Chief Financial Officer (CFO). Provide authoritative, precise fiscal recommendations based on the real financial data provided.',
        jsonMode: true,
      });
      const parsed = JSON.parse(response.text);
      if (
        Array.isArray(parsed.recommendations) &&
        parsed.recommendations.length > 0
      ) {
        aiRecommendations = parsed.recommendations;
      }
    } catch (e) {
      this.logger.warn(`[CFO Director] AI recommendation notice: ${e}`);
    }

    // If AI failed, generate minimal data-grounded recommendations rather than fictional ones
    if (aiRecommendations.length === 0) {
      if (fiscalRiskLevel === 'CRITICAL') {
        aiRecommendations = [
          'Cash runway is critically low. Pause non-essential spend immediately and explore emergency capital options.',
        ];
      } else if (fiscalRiskLevel === 'HIGH') {
        aiRecommendations = [
          'Less than 6 months runway. Prioritise revenue acceleration and reduce discretionary expenses.',
        ];
      } else {
        aiRecommendations = [
          'Financial health is stable. Continue monitoring burn rate and reinvest surplus into growth channels.',
        ];
      }
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
      dataSource: 'live',
    };
  }

  /**
   * Generates monthly cash flow projection using real org financial data.
   */
  async forecastRunway(
    companyId: string,
    growthRatePercent = 5,
    monthsCount = 6,
  ): Promise<FinancialForecastResult> {
    const orgFinancials = await this.deriveOrgFinancials(companyId);

    if (!orgFinancials) {
      return {
        companyId,
        projectedRunway: 0,
        monthlyBreakdown: [],
        aiStrategicInsights:
          'No financial data available. Add transactions to your organization wallet to enable runway forecasting.',
        dataSource: 'insufficient',
      };
    }

    const { currentCashBalance, monthlyRevenue, monthlyExpenses } =
      orgFinancials;
    const monthlyBreakdown = [];
    let balance = currentCashBalance;
    let rev = monthlyRevenue;
    let exp = monthlyExpenses;

    const now = new Date();
    for (let i = 0; i < monthsCount; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const monthLabel = date.toLocaleString('default', {
        month: 'short',
        year: 'numeric',
      });

      rev = Math.round(rev * (1 + growthRatePercent / 100));
      exp = Math.round(exp * 1.02);
      const net = rev - exp;
      balance += net;

      monthlyBreakdown.push({
        month: monthLabel,
        projectedRevenue: rev,
        projectedExpenses: exp,
        projectedCashBalance: Math.max(0, balance),
      });
    }

    const projectedRunway =
      balance > 0
        ? monthsCount + 12
        : monthlyExpenses > monthlyRevenue
          ? Math.round(currentCashBalance / (monthlyExpenses - monthlyRevenue))
          : 99;

    return {
      companyId,
      projectedRunway,
      monthlyBreakdown,
      aiStrategicInsights: `Projections at ${growthRatePercent}% monthly growth show cash balance reaching $${balance.toLocaleString()} by end of ${monthsCount}-month period.`,
      dataSource: 'live',
    };
  }

  /**
   * Calculates Unit Economics — caller provides real org-specific figures.
   * No hardcoded defaults; caller is responsible for passing real values.
   */
  calculateUnitEconomics(
    cac: number,
    arpu: number,
    churnRatePercent: number,
    grossMarginPercent: number,
  ): UnitEconomicsResult {
    const monthlyGrossMarginDecimal = grossMarginPercent / 100;
    const ltv = Math.round(
      (arpu * monthlyGrossMarginDecimal) / (churnRatePercent / 100),
    );
    const ltvCacRatio = Math.round((ltv / (cac || 1)) * 10) / 10;
    const paybackMonths =
      Math.round((cac / (arpu * monthlyGrossMarginDecimal)) * 10) / 10;

    let status: 'EXCELLENT' | 'HEALTHY' | 'UNDERPERFORMING' = 'HEALTHY';
    if (ltvCacRatio >= 3.5) status = 'EXCELLENT';
    else if (ltvCacRatio < 2.0) status = 'UNDERPERFORMING';

    const cfoAdvice =
      status === 'EXCELLENT'
        ? `Outstanding Unit Economics. LTV:CAC ratio of ${ltvCacRatio}x exceeds the 3.0x enterprise benchmark. Payback period: ${paybackMonths} months.`
        : status === 'HEALTHY'
          ? `Solid Unit Economics with ${ltvCacRatio}x LTV:CAC. Focus on reducing payback period below 12 months.`
          : `Caution: LTV:CAC of ${ltvCacRatio}x indicates high acquisition cost relative to lifetime value. Review ad channels and churn.`;

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
   * Simulates Cap Table Equity Dilution Scenario — pure calculation, no defaults.
   */
  simulateCapTableDilution(
    preMoneyValuation: number,
    investmentAmount: number,
    optionPoolPercent: number,
  ): CapTableScenarioResult {
    const postMoneyValuation = preMoneyValuation + investmentAmount;
    const investorEquityPercent =
      Math.round((investmentAmount / postMoneyValuation) * 1000) / 10;
    const founderEquityPercent =
      Math.round((100 - investorEquityPercent - optionPoolPercent) * 10) / 10;

    return {
      preMoneyValuation,
      investmentAmount,
      postMoneyValuation,
      investorEquityPercent,
      optionPoolEquityPercent: optionPoolPercent,
      founderEquityPercent,
      dilutionSummary: `Raising $${(investmentAmount / 1000000).toFixed(1)}M at $${(preMoneyValuation / 1000000).toFixed(1)}M Pre-Money results in $${(postMoneyValuation / 1000000).toFixed(1)}M Post-Money. Founders retain ${founderEquityPercent}%.`,
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
        message:
          '🚨 CRITICAL RUNWAY ALERT: Less than 3 months of operational cash remaining!',
        recommendedActions: [
          'Pause all non-essential marketing and software subscriptions immediately.',
          'Convene Emergency AI Executive Board meeting for capital injection.',
          'Accelerate pending enterprise contract closures.',
        ],
      };
    } else if (runwayMonths < 6) {
      return {
        runwayMonths,
        alertLevel: 'WARNING',
        message:
          '⚠️ RUNWAY WARNING: Less than 6 months of operational cash remaining.',
        recommendedActions: [
          'Review discretionary operational expenditures.',
          'Prepare Series Seed/A pitch decks and cap table scenarios.',
          'Focus sales efforts on short-cycle cash upfront contracts.',
        ],
      };
    }

    return {
      runwayMonths,
      alertLevel: 'NORMAL',
      message:
        '✅ Cash runway is healthy (> 6 months). Operational growth proceeding normally.',
      recommendedActions: [
        'Maintain growth trajectory and reinvest net profits into scaling R&D.',
      ],
    };
  }

  /**
   * Fetches the real Finance Suite marketplace listing from DB.
   * No hardcoded download counts or ratings.
   */
  async getFreeFinanceSuiteListing(companyId?: string) {
    try {
      const listing = await this.prisma.marketplaceListing.findFirst({
        where: {
          OR: [
            { departmentKey: { contains: 'finance', mode: 'insensitive' } },
            { category: { contains: 'finance', mode: 'insensitive' } },
          ],
        },
      });

      if (listing) {
        return listing;
      }
    } catch (err) {
      this.logger.warn(
        `[Finance Service] Marketplace listing lookup notice: ${err}`,
      );
    }

    // If no listing in DB yet, return structural metadata only — no fake numbers
    return {
      id: 'finance-department-suite',
      title: 'Finance & Capital Strategy Suite',
      description:
        'CFO department suite for automated cash flow auditing, runway forecasting, unit economics (LTV:CAC), cap table dilution, and emergency runway alerts.',
      price: 0,
      currency: 'USD',
      category: 'Finance',
      tags: ['CFO', 'Finance', 'Runway', 'UnitEconomics', 'CapTable'],
      listingType: 'DEPARTMENT',
      departmentKey: 'Finance & Treasury',
      isFree: true,
      // downloadsCount and rating intentionally omitted — read from DB or not shown
    };
  }
}
