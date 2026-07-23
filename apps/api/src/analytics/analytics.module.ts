import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { AnalyticsWarehouseController } from './warehouse/analytics-warehouse.controller';
import { AnalyticsWarehouseService } from './warehouse/analytics-warehouse.service';
import { KpiEngineService } from './warehouse/kpi-engine.service';
import { ExecutiveDashboardController } from './warehouse/executive-dashboard.controller';
import { ExecutiveDashboardService } from './warehouse/executive-dashboard.service';
import { PredictiveAnalyticsController } from './predictive/predictive-analytics.controller';
import { PredictiveAnalyticsService } from './predictive/predictive-analytics.service';
import { PredictionEngineService } from './predictive/prediction-engine.service';
import { DecisionIntelligenceController } from './decision-intelligence/decision-intelligence.controller';
import { DecisionIntelligenceService } from './decision-intelligence/decision-intelligence.service';
import { DecisionEngineService } from './decision-intelligence/decision-engine.service';
import { InsightsHubController } from './insights-hub/insights-hub.controller';
import { InsightsHubService } from './insights-hub/insights-hub.service';
@Module({ controllers:[AnalyticsController,AnalyticsWarehouseController,ExecutiveDashboardController,PredictiveAnalyticsController,DecisionIntelligenceController,InsightsHubController], providers:[AnalyticsService,AnalyticsWarehouseService,KpiEngineService,ExecutiveDashboardService,PredictiveAnalyticsService,PredictionEngineService,DecisionIntelligenceService,DecisionEngineService,InsightsHubService], exports:[AnalyticsWarehouseService,KpiEngineService,ExecutiveDashboardService,PredictiveAnalyticsService,PredictionEngineService,DecisionIntelligenceService,DecisionEngineService,InsightsHubService] })
export class AnalyticsModule {}
