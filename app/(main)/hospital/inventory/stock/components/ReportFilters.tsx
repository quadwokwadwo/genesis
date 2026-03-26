import { useStockReportContext } from '@/libs/contextProviders/AppContexts';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';

const ReportFilters = () => {
    const { state, setStateValue } = useStockReportContext();
    const stockStatusOptions = [
        { label: 'All Status', value: 'all' },
        { label: 'Out of Stock', value: 'out-of-stock' },
        { label: 'Low Stock', value: 'low-stock' },
        { label: 'Normal Stock', value: 'normal' },
        { label: 'Overstock', value: 'overstock' }
    ];
    return (
        <div className="grid">
            <div className="col-12 md:col-3">
                <label htmlFor="category" className="block mb-2 font-semibold">
                    Category
                </label>
                <Dropdown
                    id="category"
                    value={state.reportCriteria.category}
                    options={state.categories}
                    onChange={(e) =>
                        setStateValue({
                            reportCriteria: { ...state.reportCriteria, category: e.value }
                        })
                    }
                    placeholder="Select category"
                    className="w-full"
                />
            </div>
            <div className="col-12 md:col-3">
                <label htmlFor="brand" className="block mb-2 font-semibold">
                    Brand
                </label>
                <Dropdown
                    id="brand"
                    value={state.reportCriteria.brand}
                    options={state.brands}
                    onChange={(e) =>
                        setStateValue({
                            reportCriteria: { ...state.reportCriteria, brand: e.value }
                        })
                    }
                    placeholder="Select brand"
                    className="w-full"
                />
            </div>
            <div className="col-12 md:col-3">
                <label htmlFor="stockStatus" className="block mb-2 font-semibold">
                    Stock Status
                </label>
                <Dropdown
                    id="stockStatus"
                    value={state.reportCriteria.stockStatus}
                    options={stockStatusOptions}
                    onChange={(e) =>
                        setStateValue({
                            reportCriteria: { ...state.reportCriteria, stockStatus: e.value }
                        })
                    }
                    placeholder="Select status"
                    className="w-full"
                />
            </div>
            <div className="col-12 md:col-3">
                <label className="block mb-2 font-semibold">Date Range</label>
                <div className="flex gap-2">
                    <Calendar
                        value={state.reportCriteria.dateFrom}
                        onChange={(e) =>
                            setStateValue({
                                reportCriteria: { ...state.reportCriteria, dateFrom: e.value }
                            })
                        }
                        placeholder="From"
                        showIcon
                        className="flex-1"
                    />
                    <Calendar
                        value={state.reportCriteria.dateTo}
                        onChange={(e) =>
                            setStateValue({
                                reportCriteria: { ...state.reportCriteria, dateTo: e.value }
                            })
                        }
                        placeholder="To"
                        showIcon
                        className="flex-1"
                    />
                </div>
            </div>
        </div>
    );
};
export default ReportFilters;
