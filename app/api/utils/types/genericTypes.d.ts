type QueryResults<T> = {
    fieldCount: number;
    affectedRows: number;
    insertId: number;
    serverStatus: number;
    warningCount: number;
    message: string;
    protocol41: boolean;
    changedRows: number;
};
type ExecutionStatus = { executionStatus: string };
type QueryResponseImproved<T> = [QueryResults<T>, ExecutionStatus, T[]];
