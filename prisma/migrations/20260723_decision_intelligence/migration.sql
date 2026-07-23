CREATE TYPE "DecisionPolicyStatus" AS ENUM ('DRAFT','PUBLISHED','ARCHIVED');
CREATE TYPE "RecommendationType" AS ENUM ('REPRIORITIZE_INITIATIVE','REALLOCATE_RESOURCES','ESCALATE_APPROVAL','ADJUST_OBJECTIVE','RECOMMEND_HIRING','RECOMMEND_AUTOMATION','ADJUST_BUDGET','MITIGATE_RISK');
CREATE TYPE "RecommendationStatus" AS ENUM ('PROPOSED','UNDER_REVIEW','ACCEPTED','REJECTED','DEFERRED','APPLIED','EXPIRED');
CREATE TYPE "RecommendationPriority" AS ENUM ('LOW','MEDIUM','HIGH','CRITICAL');
CREATE TYPE "RecommendationDisposition" AS ENUM ('ACCEPT','REJECT','DEFER','MARK_APPLIED');
-- Tables mirror DecisionPolicy, DecisionPolicyVersion, DecisionRecommendation, RecommendationDecision and DecisionSimulation in schema.prisma.
-- Generate and review the provider-specific Prisma migration in the target environment before production deployment.
