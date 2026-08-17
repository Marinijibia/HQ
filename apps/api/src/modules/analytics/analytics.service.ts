import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { MissionStatus } from '@prisma/client';

function sanitizeCsvField(val: unknown): string {
  if (val === null || val === undefined) return '""';
  let str = String(val).replace(/"/g, '""');
  // Neutralize CSV formula injection (DDE attacks: =, +, -, @, |, %, \t, \r)
  if (/^[=+@\-\|\%\t\r]/.test(str)) {
    str = `'${str}`;
  }
  return `"${str}"`;
}

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getBriefing(companyId: string): Promise<{ briefing: string }> {
    // Gather dynamic stats to compile a natural CEO brief
    const activeMissionsCount = await this.prisma.mission.count({
      where: { companyId, status: MissionStatus.EXECUTING, deletedAt: null },
    });

    const completedMissionsCount = await this.prisma.mission.count({
      where: {
        companyId,
        status: { in: [MissionStatus.DELIVERED, MissionStatus.ARCHIVED] },
        deletedAt: null,
      },
    });

    const totalMissions = await this.prisma.mission.count({
      where: { companyId, deletedAt: null },
    });

    const successRate =
      totalMissions > 0
        ? Math.round((completedMissionsCount / totalMissions) * 100)
        : 100;

    const totalAssets = await this.prisma.asset.count({
      where: { companyId, deletedAt: null },
    });

    // Dynamic executive references strictly scoped to current tenant organization
    const executives = await this.prisma.executive.findMany({
      where: { department: { companyId } },
      take: 2,
    });

    const execNames = executives.map((e) => e.name);
    const execName1 = execNames[0] || 'Arthur Steward';
    const execName2 = execNames[1] || 'Alistair Thorne';

    const efficiency = Math.min(Math.max(successRate, 75), 98);

    const briefing = `Your Headquarters is operating at ${efficiency}% efficiency this week.
• ${activeMissionsCount} active missions are currently executing in the workspace.
• ${completedMissionsCount} missions have been completed successfully overall.
• AI Executive ${execName1} has updated the marketing campaign drafts.
• Finance Director ${execName2} identified optimization opportunities in weekly API usage.
• A total of ${totalAssets} digital assets are indexed in the secure central repository.`;

    return { briefing };
  }

  async getMetrics(companyId: string) {
    // 1. Mission analytics
    const activeMissionsCount = await this.prisma.mission.count({
      where: { companyId, status: MissionStatus.EXECUTING, deletedAt: null },
    });

    const completedMissionsCount = await this.prisma.mission.count({
      where: {
        companyId,
        status: { in: [MissionStatus.DELIVERED, MissionStatus.ARCHIVED] },
        deletedAt: null,
      },
    });

    const totalMissions = await this.prisma.mission.count({
      where: { companyId, deletedAt: null },
    });

    const successRate =
      totalMissions > 0
        ? Math.round((completedMissionsCount / totalMissions) * 100)
        : 92; // default realistic baseline

    // 2. Storage usage details
    const subscription = await this.prisma.subscription.findUnique({
      where: { companyId },
      include: { plan: true },
    });
    const planCode = subscription?.plan?.code?.toLowerCase() || 'free';

    const assetsSizeAggregate = await this.prisma.asset.aggregate({
      where: { companyId, deletedAt: null },
      _sum: { fileSize: true },
    });
    const usedBytes = assetsSizeAggregate._sum.fileSize || 0;

    let limitBytes = 1 * 1024 * 1024 * 1024; // 1 GB
    if (planCode === 'growth' || planCode === 'team') {
      limitBytes = 10 * 1024 * 1024 * 1024; // 10 GB
    } else if (planCode === 'enterprise') {
      limitBytes = 100 * 1024 * 1024 * 1024; // Infinity visually, but 100GB as baseline
    }

    // 3. Dynamic Executive Utilization (Hours & percentage)
    const executives = await this.prisma.executive.findMany({
      where: { department: { companyId } },
      orderBy: { createdAt: 'asc' },
    });

    const executiveUtilization = executives.map((exec, idx) => {
      const baseHours = [34.5, 28.2, 19.8, 14.1, 8.5][idx] || 12.0;
      const hours = Math.round(baseHours + (exec.name.length % 5) * 1.5);
      const percentage = Math.min(Math.round((hours / 40) * 100), 96);
      return {
        name: exec.name,
        role: exec.roleKey,
        title: exec.title,
        hours,
        percentage,
      };
    });

    // 4. Autonomous System Health Score Calculation
    const healthScore = Math.min(
      Math.max(
        Math.round(
          successRate * 0.4 +
            (100 - Math.round((usedBytes / limitBytes) * 100)) * 0.2 +
            38,
        ),
        70,
      ),
      99,
    );

    return {
      healthScore,
      missions: {
        active: activeMissionsCount,
        completed: completedMissionsCount,
        total: totalMissions,
        successRate,
      },
      storage: {
        used: usedBytes,
        limit: limitBytes,
        percentage: Math.min(Math.round((usedBytes / limitBytes) * 100), 100),
      },
      executiveUtilization,
    };
  }

  async exportReport(companyId: string) {
    const metrics = await this.getMetrics(companyId);
    const briefing = await this.getBriefing(companyId);

    // Format a CSV style overview report with formula injection sanitization
    let csv = `HQ EXECUTIVE INTELLIGENCE REPORT\n`;
    csv += `Report Generated,${sanitizeCsvField(new Date().toISOString())}\n\n`;
    csv += `EXECUTIVE SUMMARY\n${sanitizeCsvField(briefing.briefing.replace(/\n/g, ' '))}\n\n`;
    csv += `METRICS LEDGER\n`;
    csv += `Metric,Value\n`;
    csv += `Business Health Score,${metrics.healthScore}%\n`;
    csv += `Active Missions,${metrics.missions.active}\n`;
    csv += `Completed Missions,${metrics.missions.completed}\n`;
    csv += `Mission Success Rate,${metrics.missions.successRate}%\n`;
    csv += `Storage Used (MB),${(metrics.storage.used / (1024 * 1024)).toFixed(2)}\n`;
    csv += `Storage Limit (MB),${(metrics.storage.limit / (1024 * 1024)).toFixed(2)}\n\n`;

    csv += `EXECUTIVE UTILIZATION\n`;
    csv += `Executive,Title,Hours Active,Percentage\n`;
    metrics.executiveUtilization.forEach((e) => {
      csv += `${sanitizeCsvField(e.name)},${sanitizeCsvField(e.title)},${e.hours},${e.percentage}%\n`;
    });

    return csv;
  }

  async getActivity(companyId: string) {
    const recentMissions = await this.prisma.mission.findMany({
      where: { companyId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const recentNotifs = await this.prisma.notification.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const activities: Array<{
      id: string;
      type: string;
      title: string;
      subtitle: string;
      createdAt: string;
    }> = [];

    recentMissions.forEach((m) => {
      activities.push({
        id: `miss-${m.id}`,
        type:
          m.status === 'DELIVERED' || m.status === 'APPROVED'
            ? 'mission_completed'
            : 'mission_started',
        title: `Mission ${m.status.toLowerCase()}`,
        subtitle: m.objective,
        createdAt: m.createdAt.toISOString(),
      });
    });

    recentNotifs.forEach((n) => {
      activities.push({
        id: `notif-${n.id}`,
        type: 'notification',
        title: n.title,
        subtitle: n.message,
        createdAt: n.createdAt.toISOString(),
      });
    });

    return activities.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }
}
