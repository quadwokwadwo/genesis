-- ============================================================
-- EMBRYOLOGIST DASHBOARD SQL QUERIES
-- This file contains all SQL queries needed for the embryologist dashboard
-- ============================================================

-- ============================================================
-- 1. DASHBOARD STATISTICS QUERIES
-- ============================================================

-- Get today's assessment statistics
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS getEmbryologistDashboardStats(IN selectedDate DATE)
BEGIN
    -- Total assessments today
    SELECT
        COUNT(*) as totalAssessmentsToday
    FROM (
        SELECT semenAnalysisId, collectionDate as assessmentDate FROM semen_analysis WHERE DATE(collectionDate) = selectedDate
        UNION ALL
        SELECT ivfEmbryoAssessmentId, dateOfCycle as assessmentDate FROM ivf_embryo_assessment WHERE DATE(dateOfCycle) = selectedDate
    ) as todayAssessments;

    -- Completed semen analyses (today)
    SELECT
        COUNT(*) as completedSemenAnalyses
    FROM semen_analysis
    WHERE DATE(collectionDate) = selectedDate
    AND status = 'Completed';

    -- Pending IVF assessments (all active)
    SELECT
        COUNT(*) as pendingIVFAssessments
    FROM ivf_embryo_assessment
    WHERE DATE(dateOfCycle) >= selectedDate - INTERVAL 30 DAY;

    -- Total cryopreserved samples (active)
    SELECT
        COALESCE(SUM(embryoQuantity), 0) + COALESCE(SUM(oocyteQuantity), 0) as totalCryopreservedSamples
    FROM embryo_preservation_tank
    WHERE status = 'Active';

    -- Active embryo tanks
    SELECT
        COUNT(DISTINCT canister) as activeEmbryoTanks
    FROM embryo_preservation_tank
    WHERE status = 'Active';

    -- Average assessment time (placeholder - customize based on your tracking)
    SELECT 45 as averageAssessmentTime;

    -- Success rate (fertilization rate - customize calculation)
    SELECT 87 as successRate;
END$$
DELIMITER ;

-- ============================================================
-- 2. SEMEN ANALYSIS QUERIES
-- ============================================================

-- Get recent semen analyses with patient info
CREATE OR REPLACE VIEW v_recent_semen_analyses AS
SELECT
    sa.semenAnalysisId,
    sa.patientId,
    sa.labId,
    sa.collectionDate,
    sa.analysisDate,
    sa.reportDate,
    sa.status,
    sa.physicalExamination,
    sa.microscopicExamination,
    sa.motilityCategories,
    sa.additionalCells,
    sa.clinicalFindings,
    p.firstName,
    p.lastName,
    p.recordNumber,
    CONCAT(p.firstName, ' ', p.lastName) as patientName
FROM semen_analysis sa
LEFT JOIN patients p ON sa.patientId = p.patientId
ORDER BY sa.collectionDate DESC
LIMIT 50;

-- Get semen analyses for specific date
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS getSemenAnalysesByDate(IN selectedDate DATE)
BEGIN
    SELECT
        sa.*,
        CONCAT(p.firstName, ' ', p.lastName) as patientName,
        p.recordNumber
    FROM semen_analysis sa
    LEFT JOIN patients p ON sa.patientId = p.patientId
    WHERE DATE(sa.collectionDate) = selectedDate
    ORDER BY sa.collectionDate DESC;
END$$
DELIMITER ;

-- Get semen analysis statistics
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS getSemenAnalysisStats(IN startDate DATE, IN endDate DATE)
BEGIN
    SELECT
        COUNT(*) as totalAnalyses,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completedCount,
        SUM(CASE WHEN status = 'In-Progress' THEN 1 ELSE 0 END) as inProgressCount,
        AVG(TIMESTAMPDIFF(MINUTE, collectionDate, reportDate)) as avgProcessingTime
    FROM semen_analysis
    WHERE DATE(collectionDate) BETWEEN startDate AND endDate;
END$$
DELIMITER ;

-- ============================================================
-- 3. IVF EMBRYO ASSESSMENT QUERIES
-- ============================================================

-- Create comprehensive IVF view (if not exists)
CREATE OR REPLACE VIEW v_ivf_embryo_assessment AS
SELECT
    iva.ivfEmbryoAssessmentId,
    iva.patientId,
    iva.dateOfCycle,
    iva.typeOfIVFCycle,
    iva.numberOfOocytesRetrieved,
    iva.fertilizationAssessment,
    iva.blastoCystAssessment,
    iva.embryoTransfer,
    iva.cryoPreservation,
    iva.userId,
    iva.dateCreated as createdAt,
    iva.dateModified as updatedAt,
    CONCAT(p.firstName, ' ', p.lastName) as patientName,
    p.recordNumber,
    DATEDIFF(CURDATE(), iva.dateOfCycle) as daysSinceCycle
FROM ivf_embryo_assessment iva
LEFT JOIN patients p ON iva.patientId = p.patientId;

-- Get pending/active IVF assessments
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS getPendingIVFAssessments(IN dayRange INT)
BEGIN
    SELECT *
    FROM v_ivf_embryo_assessment
    WHERE DATE(dateOfCycle) >= CURDATE() - INTERVAL dayRange DAY
    ORDER BY dateOfCycle DESC;
END$$
DELIMITER ;

-- Get IVF assessments by date
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS getIVFAssessmentsByDate(IN selectedDate DATE)
BEGIN
    SELECT *
    FROM v_ivf_embryo_assessment
    WHERE DATE(dateOfCycle) = selectedDate
    ORDER BY dateOfCycle DESC;
END$$
DELIMITER ;

-- Get IVF success metrics
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS getIVFSuccessMetrics(IN startDate DATE, IN endDate DATE)
BEGIN
    -- This would need to be customized based on how you track fertilization/blastocyst rates
    SELECT
        COUNT(*) as totalCycles,
        AVG(numberOfOocytesRetrieved) as avgOocytesRetrieved,
        -- Parse JSON fields to calculate rates (example - adjust based on actual schema)
        87 as avgFertilizationRate,
        72 as avgBlastocystDevelopmentRate
    FROM ivf_embryo_assessment
    WHERE DATE(dateOfCycle) BETWEEN startDate AND endDate;
END$$
DELIMITER ;

-- ============================================================
-- 4. CRYOPRESERVATION QUERIES
-- ============================================================

-- Get cryopreservation alerts and warnings
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS getCryoTankAlerts()
BEGIN
    -- Tank capacity alerts
    SELECT
        canister as tankName,
        COUNT(*) as sampleCount,
        'capacity' as alertType,
        CASE
            WHEN COUNT(*) > 85 THEN 'high'
            WHEN COUNT(*) > 70 THEN 'medium'
            ELSE 'low'
        END as severity,
        CONCAT('Tank at ', ROUND(COUNT(*) * 100 / 100, 0), '% capacity') as message,
        14 as daysUntilAction
    FROM embryo_preservation_tank
    WHERE status = 'Active'
    GROUP BY canister
    HAVING COUNT(*) > 70

    UNION ALL

    -- Maintenance alerts (samples older than 6 months)
    SELECT
        CONCAT('Tank ', canister) as tankName,
        COUNT(*) as sampleCount,
        'maintenance' as alertType,
        'low' as severity,
        'Scheduled maintenance due' as message,
        DATEDIFF(DATE_ADD(MIN(freezeDate), INTERVAL 6 MONTH), CURDATE()) as daysUntilAction
    FROM embryo_preservation_tank
    WHERE status = 'Active'
    GROUP BY canister
    HAVING DATEDIFF(DATE_ADD(MIN(freezeDate), INTERVAL 6 MONTH), CURDATE()) < 30;
END$$
DELIMITER ;

-- Get tank capacity overview
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS getCryoTankCapacity()
BEGIN
    SELECT
        'Embryo Tanks' as tankType,
        COUNT(DISTINCT canister) as activeTanks,
        SUM(embryoQuantity) as totalSamples,
        ROUND(AVG(embryoQuantity) * 100 / 100, 0) as capacityPercentage
    FROM embryo_preservation_tank
    WHERE status = 'Active'
    AND embryoType IN ('Blastocyte', 'Oocyte')

    UNION ALL

    SELECT
        'Sperm Tanks' as tankType,
        COUNT(DISTINCT canister) as activeTanks,
        COUNT(*) as totalSamples,
        ROUND(COUNT(*) * 100 / 150, 0) as capacityPercentage
    FROM sperm_preservation_tank
    WHERE status = 'Active';
END$$
DELIMITER ;

-- Get cryopreservation details by patient
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS getCryoDetailsByPatient(IN patId INT)
BEGIN
    -- Embryo/Oocyte preservation
    SELECT
        'Embryo' as sampleType,
        ept.embryoCryoPreservationId as preservationId,
        ept.canister,
        ept.goblet,
        ept.strawNumber,
        ept.embryoType,
        ept.embryoQuantity as quantity,
        ept.embryoQuality as quality,
        ept.freezeDate,
        ept.notes,
        ept.status
    FROM embryo_preservation_tank ept
    WHERE ept.patientId = patId
    AND ept.status = 'Active'

    UNION ALL

    -- Sperm preservation
    SELECT
        'Sperm' as sampleType,
        spt.semenPreservationTankId as preservationId,
        spt.canister,
        spt.goblet,
        spt.strawNumber,
        'Sperm' as embryoType,
        spt.strawNumber as quantity,
        NULL as quality,
        spt.preservationDate as freezeDate,
        spt.notes,
        spt.status
    FROM sperm_preservation_tank spt
    WHERE spt.patientId = patId
    AND spt.status = 'Active';
END$$
DELIMITER ;

-- ============================================================
-- 5. ANALYTICS & CHART QUERIES
-- ============================================================

-- Weekly lab workload
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS getWeeklyLabWorkload(IN startDate DATE)
BEGIN
    SELECT
        DATE(assessmentDate) as workDate,
        DAYNAME(assessmentDate) as dayName,
        assessmentType,
        COUNT(*) as assessmentCount
    FROM (
        -- Semen analyses
        SELECT
            collectionDate as assessmentDate,
            'Semen Analysis' as assessmentType
        FROM semen_analysis
        WHERE DATE(collectionDate) BETWEEN startDate AND DATE_ADD(startDate, INTERVAL 6 DAY)

        UNION ALL

        -- IVF assessments
        SELECT
            dateOfCycle as assessmentDate,
            'IVF Assessment' as assessmentType
        FROM ivf_embryo_assessment
        WHERE DATE(dateOfCycle) BETWEEN startDate AND DATE_ADD(startDate, INTERVAL 6 DAY)

        UNION ALL

        -- Cryopreservation operations
        SELECT
            freezeDate as assessmentDate,
            'Cryopreservation' as assessmentType
        FROM embryo_preservation_tank
        WHERE DATE(freezeDate) BETWEEN startDate AND DATE_ADD(startDate, INTERVAL 6 DAY)
    ) as weeklyData
    GROUP BY DATE(assessmentDate), assessmentType
    ORDER BY workDate, assessmentType;
END$$
DELIMITER ;

-- Assessment type distribution
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS getAssessmentDistribution(IN startDate DATE, IN endDate DATE)
BEGIN
    SELECT
        assessmentType,
        COUNT(*) as assessmentCount
    FROM (
        SELECT 'Semen Analysis' as assessmentType FROM semen_analysis
        WHERE DATE(collectionDate) BETWEEN startDate AND endDate

        UNION ALL

        SELECT 'IVF Embryo' as assessmentType FROM ivf_embryo_assessment
        WHERE DATE(dateOfCycle) BETWEEN startDate AND endDate

        UNION ALL

        SELECT 'Cryopreservation' as assessmentType FROM embryo_preservation_tank
        WHERE DATE(freezeDate) BETWEEN startDate AND endDate

        UNION ALL

        SELECT 'Sperm Tank' as assessmentType FROM sperm_preservation_tank
        WHERE DATE(preservationDate) BETWEEN startDate AND endDate
    ) as distribution
    GROUP BY assessmentType
    ORDER BY assessmentCount DESC;
END$$
DELIMITER ;

-- Quality metrics over time
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS getQualityMetrics(IN startDate DATE, IN endDate DATE)
BEGIN
    SELECT
        'Fertilization Rate' as metricName,
        87.0 as metricValue,
        '%' as unit
    UNION ALL
    SELECT
        'Blastocyst Development' as metricName,
        72.0 as metricValue,
        '%' as unit
    UNION ALL
    SELECT
        'Cryopreservation Success' as metricName,
        95.0 as metricValue,
        '%' as unit
    UNION ALL
    SELECT
        'Sperm Quality (Normal)' as metricName,
        68.0 as metricValue,
        '%' as unit;

    -- Note: These are placeholder values. Implement actual calculations based on:
    -- - Fertilization rate: (fertilized oocytes / total oocytes) * 100
    -- - Blastocyst rate: (blastocysts formed / fertilized embryos) * 100
    -- - Cryo success: (viable after thaw / total frozen) * 100
    -- - Sperm quality: Extract from microscopicExamination JSON
END$$
DELIMITER ;

-- ============================================================
-- 6. ACTIVITY LOG QUERIES
-- ============================================================

-- Get recent activities for timeline
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS getRecentActivities(IN selectedDate DATE, IN activityLimit INT)
BEGIN
    SELECT
        activityTime,
        activityDescription,
        activityType,
        activityIcon,
        activityColor
    FROM (
        -- Semen analysis activities
        SELECT
            sa.analysisDate as activityTime,
            CONCAT('Completed semen analysis ', sa.labId) as activityDescription,
            'semen' as activityType,
            'pi-check-circle' as activityIcon,
            '#22C55E' as activityColor
        FROM semen_analysis sa
        WHERE DATE(sa.analysisDate) = selectedDate
        AND sa.status = 'Completed'

        UNION ALL

        -- IVF activities
        SELECT
            iva.dateCreated as activityTime,
            CONCAT('Started IVF embryo assessment for patient P-', iva.patientId) as activityDescription,
            'ivf' as activityType,
            'pi-circle' as activityIcon,
            '#3B82F6' as activityColor
        FROM ivf_embryo_assessment iva
        WHERE DATE(iva.dateCreated) = selectedDate

        UNION ALL

        -- Cryopreservation activities
        SELECT
            ept.freezeDate as activityTime,
            CONCAT('Cryopreserved ', ept.embryoQuantity, ' embryos in Tank ', ept.canister) as activityDescription,
            'cryo' as activityType,
            'pi-box' as activityIcon,
            '#8B5CF6' as activityColor
        FROM embryo_preservation_tank ept
        WHERE DATE(ept.freezeDate) = selectedDate
    ) as activities
    ORDER BY activityTime DESC
    LIMIT activityLimit;
END$$
DELIMITER ;

-- ============================================================
-- 7. SEARCH & FILTER QUERIES
-- ============================================================

-- Search assessments across all types
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS searchAssessments(
    IN searchTerm VARCHAR(100),
    IN assessmentType VARCHAR(50),
    IN startDate DATE,
    IN endDate DATE
)
BEGIN
    IF assessmentType = 'semen' OR assessmentType = 'all' THEN
        SELECT
            'semen' as type,
            semenAnalysisId as id,
            labId as referenceId,
            patientId,
            collectionDate as assessmentDate,
            status
        FROM semen_analysis
        WHERE (labId LIKE CONCAT('%', searchTerm, '%')
            OR patientId LIKE CONCAT('%', searchTerm, '%'))
        AND DATE(collectionDate) BETWEEN startDate AND endDate;
    END IF;

    IF assessmentType = 'ivf' OR assessmentType = 'all' THEN
        SELECT
            'ivf' as type,
            ivfEmbryoAssessmentId as id,
            CONCAT('IVF-', ivfEmbryoAssessmentId) as referenceId,
            patientId,
            dateOfCycle as assessmentDate,
            'Active' as status
        FROM ivf_embryo_assessment
        WHERE patientId LIKE CONCAT('%', searchTerm, '%')
        AND DATE(dateOfCycle) BETWEEN startDate AND endDate;
    END IF;

    IF assessmentType = 'cryo' OR assessmentType = 'all' THEN
        SELECT
            'cryo' as type,
            embryoCryoPreservationId as id,
            CONCAT('CRYO-', embryoCryoPreservationId) as referenceId,
            patientId,
            freezeDate as assessmentDate,
            status
        FROM embryo_preservation_tank
        WHERE (canister LIKE CONCAT('%', searchTerm, '%')
            OR patientId LIKE CONCAT('%', searchTerm, '%'))
        AND DATE(freezeDate) BETWEEN startDate AND endDate;
    END IF;
END$$
DELIMITER ;

-- ============================================================
-- 8. REPORTING QUERIES
-- ============================================================

-- Monthly summary report
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS getMonthlyEmbryologyReport(IN reportYear INT, IN reportMonth INT)
BEGIN
    DECLARE firstDay DATE;
    DECLARE lastDay DATE;

    SET firstDay = DATE(CONCAT(reportYear, '-', reportMonth, '-01'));
    SET lastDay = LAST_DAY(firstDay);

    -- Summary statistics
    SELECT
        'Summary' as section,
        COUNT(DISTINCT sa.semenAnalysisId) as totalSemenAnalyses,
        COUNT(DISTINCT iva.ivfEmbryoAssessmentId) as totalIVFCycles,
        COUNT(DISTINCT ept.embryoCryoPreservationId) as totalCryoOperations,
        COUNT(DISTINCT sa.patientId) + COUNT(DISTINCT iva.patientId) as uniquePatients
    FROM semen_analysis sa
    LEFT JOIN ivf_embryo_assessment iva ON DATE(iva.dateOfCycle) BETWEEN firstDay AND lastDay
    LEFT JOIN embryo_preservation_tank ept ON DATE(ept.freezeDate) BETWEEN firstDay AND lastDay
    WHERE DATE(sa.collectionDate) BETWEEN firstDay AND lastDay;

    -- Daily breakdown
    SELECT
        DATE(assessmentDate) as reportDate,
        SUM(CASE WHEN type = 'semen' THEN 1 ELSE 0 END) as semenCount,
        SUM(CASE WHEN type = 'ivf' THEN 1 ELSE 0 END) as ivfCount,
        SUM(CASE WHEN type = 'cryo' THEN 1 ELSE 0 END) as cryoCount
    FROM (
        SELECT collectionDate as assessmentDate, 'semen' as type FROM semen_analysis
        WHERE DATE(collectionDate) BETWEEN firstDay AND lastDay
        UNION ALL
        SELECT dateOfCycle as assessmentDate, 'ivf' as type FROM ivf_embryo_assessment
        WHERE DATE(dateOfCycle) BETWEEN firstDay AND lastDay
        UNION ALL
        SELECT freezeDate as assessmentDate, 'cryo' as type FROM embryo_preservation_tank
        WHERE DATE(freezeDate) BETWEEN firstDay AND lastDay
    ) as dailyData
    GROUP BY DATE(assessmentDate)
    ORDER BY reportDate;
END$$
DELIMITER ;

-- ============================================================
-- 9. INDEXES FOR PERFORMANCE
-- ============================================================

-- Add indexes to improve dashboard query performance
CREATE INDEX IF NOT EXISTS idx_semen_collection_date ON semen_analysis(collectionDate);
CREATE INDEX IF NOT EXISTS idx_semen_status ON semen_analysis(status);
CREATE INDEX IF NOT EXISTS idx_semen_patient ON semen_analysis(patientId);

CREATE INDEX IF NOT EXISTS idx_ivf_cycle_date ON ivf_embryo_assessment(dateOfCycle);
CREATE INDEX IF NOT EXISTS idx_ivf_patient ON ivf_embryo_assessment(patientId);

CREATE INDEX IF NOT EXISTS idx_embryo_freeze_date ON embryo_preservation_tank(freezeDate);
CREATE INDEX IF NOT EXISTS idx_embryo_status ON embryo_preservation_tank(status);
CREATE INDEX IF NOT EXISTS idx_embryo_canister ON embryo_preservation_tank(canister);
CREATE INDEX IF NOT EXISTS idx_embryo_patient ON embryo_preservation_tank(patientId);

CREATE INDEX IF NOT EXISTS idx_sperm_preservation_date ON sperm_preservation_tank(preservationDate);
CREATE INDEX IF NOT EXISTS idx_sperm_status ON sperm_preservation_tank(status);
CREATE INDEX IF NOT EXISTS idx_sperm_patient ON sperm_preservation_tank(patientId);

-- ============================================================
-- USAGE EXAMPLES
-- ============================================================

/*
-- Get dashboard statistics for today
CALL getEmbryologistDashboardStats(CURDATE());

-- Get recent semen analyses
SELECT * FROM v_recent_semen_analyses LIMIT 10;

-- Get semen analyses for specific date
CALL getSemenAnalysesByDate('2025-01-15');

-- Get pending IVF assessments (last 30 days)
CALL getPendingIVFAssessments(30);

-- Get cryopreservation alerts
CALL getCryoTankAlerts();

-- Get tank capacity overview
CALL getCryoTankCapacity();

-- Get weekly workload (current week starting Monday)
CALL getWeeklyLabWorkload(DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY));

-- Get assessment distribution for last 30 days
CALL getAssessmentDistribution(DATE_SUB(CURDATE(), INTERVAL 30 DAY), CURDATE());

-- Get quality metrics
CALL getQualityMetrics(DATE_SUB(CURDATE(), INTERVAL 30 DAY), CURDATE());

-- Get today's activities (limit 20)
CALL getRecentActivities(CURDATE(), 20);

-- Get monthly report for January 2025
CALL getMonthlyEmbryologyReport(2025, 1);

-- Search assessments
CALL searchAssessments('SA-2024', 'semen', '2024-01-01', '2024-12-31');
*/
