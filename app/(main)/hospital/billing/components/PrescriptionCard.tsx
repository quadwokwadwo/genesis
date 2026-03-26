import React from 'react';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { Divider } from 'primereact/divider';
import { Badge } from 'primereact/badge';
import { Skeleton } from 'primereact/skeleton';
import { IGeneralSettings, TInventoryItem } from '@/types/hospital';
import { formatCurrency } from '@/libs/utils';

interface Props {
    med: TInventoryItem;
    loading?: boolean;
    compact?: boolean;
    generalSettings: IGeneralSettings;
}

const MedicationCard: React.FC<Props> = ({ med, loading = false, compact = false, generalSettings }) => {
    if (loading) {
        return (
            <Card className="shadow-2 h-full">
                <Skeleton width="100%" height="2rem" className="mb-3" />
                <Skeleton width="100%" height="1.5rem" className="mb-2" />
                <Skeleton width="80%" height="1.5rem" className="mb-2" />
                <Skeleton width="60%" height="1.5rem" className="mb-2" />
                <Skeleton width="90%" height="1.5rem" />
            </Card>
        );
    }

    if (!med) {
        return (
            <Card className="shadow-2 h-full">
                <div className="text-center text-500">
                    <i className="pi pi-exclamation-triangle text-3xl mb-3"></i>
                    <p>Medication information not available</p>
                </div>
            </Card>
        );
    }

    const getStockStatus = (quantity: number, reorderLevel: number) => {
        if (quantity === 0) return { severity: 'danger', label: 'Out of Stock', icon: 'pi-times-circle' };
        if (quantity <= reorderLevel) return { severity: 'warning', label: 'Low Stock', icon: 'pi-exclamation-triangle' };
        return { severity: 'success', label: 'In Stock', icon: 'pi-check-circle' };
    };

    const stockStatus = getStockStatus(med.quantityInStock, med.reorderLevel);

    const cardHeader = (
        <div className="flex justify-content-between align-items-start mb-2">
            <div className="flex-1">
                <h3 className="text-900 font-semibold m-0 mb-1 text-lg line-height-3">{med.itemName}</h3>
                <div className="text-600 text-sm">{med.brandName}</div>
            </div>
            <div className="flex flex-column align-items-end gap-1">
                <Tag value={stockStatus.label} severity={stockStatus.severity as any} icon={`pi ${stockStatus.icon}`} />
                {med.quantityInStock <= med.reorderLevel && med.quantityInStock > 0 && <Badge value="Reorder" severity="warning" />}
            </div>
        </div>
    );

    return (
        <Card
            className={`shadow-2 h-full transition-all transition-duration-200 hover:shadow-4 ${compact ? 'p-2' : ''}`}
            pt={{
                body: { className: 'p-0' },
                content: { className: compact ? 'p-2' : 'p-3' }
            }}
        >
            {cardHeader}

            <div className="flex flex-column gap-3">
                {/* Primary Information */}
                <div className="surface-50 border-radius-md p-3">
                    <div className="grid">
                        <div className="col-6">
                            <div className="flex flex-column gap-1">
                                <span className="text-600 text-xs uppercase font-semibold">Category</span>
                                <Tag value={med.categoryName} severity="info" className="w-fit" />
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="flex flex-column gap-1">
                                <span className="text-600 text-xs uppercase font-semibold">Packaging</span>
                                <Tag value={med.packagingType} severity="info" className="w-fit" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stock Information */}
                <div className="grid">
                    <div className="col-6">
                        <div className="text-center p-3 border-radius-md bg-primary-50">
                            <div className="text-primary text-2xl font-bold mb-1">{med.quantityInStock.toLocaleString()}</div>
                            <div className="text-primary text-sm font-semibold">In Stock</div>
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="text-center p-3 border-radius-md surface-100">
                            <div className="text-900 text-2xl font-bold mb-1">{med.reorderLevel.toLocaleString()}</div>
                            <div className="text-600 text-sm font-semibold">Reorder Level</div>
                        </div>
                    </div>
                </div>

                {!compact && (
                    <>
                        <Divider className="my-0" />

                        {/* Price Information */}
                        <div className="flex justify-content-between align-items-center">
                            <span className="text-600 font-semibold">Price per Unit</span>
                            <div className="text-right">
                                <div className="text-900 text-xl font-bold">{formatCurrency(med.unitPrice, generalSettings.country)}</div>
                                <div className="text-600 text-xs">per unit</div>
                            </div>
                        </div>

                        {/* Description */}
                        {med.description && (
                            <>
                                <Divider className="my-0" />
                                <div>
                                    <span className="text-600 text-sm font-semibold block mb-2">Description</span>
                                    <p className="text-900 text-sm line-height-3 m-0">{med.description}</p>
                                </div>
                            </>
                        )}

                        {/* Footer with Total Value */}
                        <div className="surface-50 border-radius-md p-3 mt-2">
                            <div className="flex justify-content-between align-items-center">
                                <span className="text-600 font-semibold">Total Stock Value</span>
                                <span className="text-900 text-lg font-bold">{formatCurrency((med.unitPrice || 0) * med.quantityInStock, generalSettings.country)}</span>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </Card>
    );
};

export default MedicationCard;
