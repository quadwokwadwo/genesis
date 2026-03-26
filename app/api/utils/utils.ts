import bcrypt from 'bcryptjs';

export async function securePassword(password: string) {
    return await bcrypt.hash(password, 10);
}
export const getBillingCategoriesSummary = (results: any) => {
    const allItems: any[] = [];
    for (const row of results as any[]) {
        const items = JSON.parse(row.billingItems);
        allItems.push(...items);
    }
    const summary: Record<string, { count: number; total: number }> = {};
    for (const item of allItems) {
        const cat = item.category || 'Unknown';
        if (!summary[cat]) summary[cat] = { count: 0, total: 0 };
        summary[cat].count += 1;
        summary[cat].total += parseFloat(item.total);
    }

    const totalOverall = Object.values(summary).reduce((sum, cat) => sum + cat.total, 0);

    return Object.entries(summary).map(([category, data]) => ({
        category,
        count: data.count,
        totalAmount: data.total,
        percentage: totalOverall > 0 ? ((data.total / totalOverall) * 100).toFixed(2) : '0.00'
    }));
};
