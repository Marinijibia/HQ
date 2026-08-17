-- Drop recursive casts and operator functions that caused PostgreSQL stack depth limit exceeded error (54001)
DROP CAST IF EXISTS (text AS "MissionStatus") CASCADE;
DROP CAST IF EXISTS (text AS "TaskStatus") CASCADE;
DROP CAST IF EXISTS (text AS "SubscriptionStatus") CASCADE;
DROP CAST IF EXISTS (text AS "UserRole") CASCADE;
DROP CAST IF EXISTS (text AS "CompanyLevel") CASCADE;

DROP FUNCTION IF EXISTS cast_text_to_mission_status(text) CASCADE;
DROP FUNCTION IF EXISTS cast_text_to_task_status(text) CASCADE;
DROP FUNCTION IF EXISTS cast_text_to_subscription_status(text) CASCADE;
DROP FUNCTION IF EXISTS cast_text_to_user_role(text) CASCADE;
DROP FUNCTION IF EXISTS cast_text_to_company_level(text) CASCADE;

DROP FUNCTION IF EXISTS text_eq_mission_status(text, "MissionStatus") CASCADE;
DROP FUNCTION IF EXISTS mission_status_eq_text("MissionStatus", text) CASCADE;
DROP FUNCTION IF EXISTS text_eq_task_status(text, "TaskStatus") CASCADE;
DROP FUNCTION IF EXISTS task_status_eq_text("TaskStatus", text) CASCADE;
DROP FUNCTION IF EXISTS text_eq_sub_status(text, "SubscriptionStatus") CASCADE;
DROP FUNCTION IF EXISTS sub_status_eq_text("SubscriptionStatus", text) CASCADE;
DROP FUNCTION IF EXISTS text_eq_user_role(text, "UserRole") CASCADE;
DROP FUNCTION IF EXISTS user_role_eq_text("UserRole", text) CASCADE;
DROP FUNCTION IF EXISTS text_eq_company_level(text, "CompanyLevel") CASCADE;
DROP FUNCTION IF EXISTS company_level_eq_text("CompanyLevel", text) CASCADE;
