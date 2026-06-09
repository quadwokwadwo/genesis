'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Toolbar } from 'primereact/toolbar';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { confirmDialog } from 'primereact/confirmdialog';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { GeneralPageProps } from '@/libs/utilityComponents';
import { TInventoryItem, TItemsPageState } from '@/types/hospital';
import InventoryItems from '@/libs/blue_prints/InventoryItems';
import { CRUDTYPE, PackingType } from '@/types/enums/enums';
import { configureExcelUpload } from '@/libs/utils';
import { FileUpload, FileUploadFilesEvent } from 'primereact/fileupload';
import { ItemsContext } from '@/libs/contextProviders/AppContexts';
import NewItem from '@/app/(main)/hospital/inventory/items/components/NewItem';
import ItemsList from '@/app/(main)/hospital/inventory/items/components/ItemsList';
import NewCategory from '@/app/(main)/hospital/inventory/items/components/NewCategory';
import NewBrand from '@/app/(main)/hospital/inventory/items/components/NewBrand';

type FailedRow = { row: number; itemName?: string; reason: string };

const INITIAL_STATE: TItemsPageState & { showUploadResult?: boolean; uploadResult?: { inserted: number; failedRows: FailedRow[] } | null } = {
    item: null,
    categories: [],
    brands: [],
    inventoryItems: [],
    loading: false,
    crudType: CRUDTYPE.save,
    showItemDialog: false,
    showCategoryDialog: false,
    showBrandDialog: false,
    showItemsUpload: false,
    showUploadResult: false,
    uploadResult: null,
    newCategory: {
        categoryName: '',
        description: ''
    },
    newBrand: { brandName: '', description: '' }
};
const inventory = new InventoryItems();

const AddInventoryItem: React.FC = () => {
    const toast = useRef(null);
    const [state, setState] = useState<TItemsPageState>(INITIAL_STATE);

    useEffect(() => {
        Promise.all([fetchCategories(), fetchBrands(), fetchInventoryItems()]).catch(console.error);
    }, []);
    const setStateValue = (stateValues: Partial<TItemsPageState>) => {
        setState((prevState) => ({ ...prevState, ...stateValues }));
    };
    const fetchInventoryItems = async () => {
        try {
            setStateValue({ loading: true });
            const response = await inventory.getItems();
            setStateValue({ inventoryItems: response.operatedData || [] });
        } catch (error) {
            console.error('Error fetching inventory items:', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to load inventory items'
            });
        } finally {
            setStateValue({ loading: false });
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await inventory.getCategories();
            setStateValue({ categories: response.operatedData || [] });
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to load categories'
            });
        }
    };

    const fetchBrands = async () => {
        try {
            const response = await inventory.getBrands();
            setStateValue({ brands: response.operatedData || [] });
        } catch (error) {
            console.error('Error fetching brands:', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to load brands'
            });
        }
    };

    const openNew = () => {
        setStateValue({
            item: {
                ...state.item,
                itemId: 0,
                itemName: '',
                description: '',
                categoryId: null,
                brandId: null,
                unitPrice: null,
                quantityInStock: 0,
                reorderLevel: 10,
                unitsPerBlister: 0,
                packagingType: PackingType.other,
                batchNumber: '',
                expiryDate: null,
                manufactureDate: null
            },
            crudType: CRUDTYPE.save,
            showItemDialog: true
        });
    };

    const editItem = (itemData: TInventoryItem) => {
        setStateValue({
            item: {
                ...state.item,
                itemId: itemData.itemId!,
                itemName: itemData.itemName,
                description: itemData.description || '',
                categoryId: itemData.categoryId,
                brandId: itemData.brandId,
                unitPrice: itemData.unitPrice,
                quantityInStock: itemData.quantityInStock,
                reorderLevel: itemData.reorderLevel,
                unitsPerBlister: itemData.unitsPerBlister || 0,
                packagingType: itemData.packagingType || PackingType.other,
                batchNumber: itemData.batchNumber ?? '',
                expiryDate: itemData.expiryDate ?? null,
                manufactureDate: itemData.manufactureDate ?? null
            },
            crudType: CRUDTYPE.update,
            showItemDialog: true
        });
    };

    const deleteItem = (itemData: TInventoryItem) => {
        confirmDialog({
            message: `Are you sure you want to delete "${itemData.itemName}"?`,
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                try {
                    setStateValue({ loading: true });
                    const response: any = await inventory.removeItem(itemData.itemId!);
                    if (response?.error) {
                        const isConflict = response.status === 409 || response.error.code === 'FK_REFERENCED';
                        toast.current?.show({
                            severity: isConflict ? 'warn' : 'error',
                            summary: isConflict ? 'Cannot Delete' : 'Error',
                            detail: response.error.message
                        });
                        return;
                    }
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Item deleted successfully'
                    });
                    await fetchInventoryItems();
                } catch (error) {
                    console.error('Error deleting item:', error);
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to delete item'
                    });
                } finally {
                    setStateValue({ loading: false });
                }
            }
        });
    };

    const handleAddCategory = async () => {
        if (!state.newCategory.categoryName.trim()) {
            toast.current?.show({
                severity: 'warn',
                summary: 'Warning',
                detail: 'Category name is required'
            });
            return;
        }

        setStateValue({ loading: true });
        try {
            const response = await inventory.addNewCategory(state.newCategory, CRUDTYPE.save);

            if (response.status === 200 && response.operatedData !== undefined) {
                const newCategoryData = response.operatedData;

                setStateValue({ item: { ...state.item, categoryId: response.operatedData.categoryId }, categories: [...state.categories, newCategoryData], showCategoryDialog: false, newCategory: { categoryName: '', description: '' } });
                toast.current?.show({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Category added successfully'
                });
            }
        } catch (error) {
            console.error('Error adding category:', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to add category'
            });
        } finally {
            setStateValue({ loading: false });
        }
    };

    const handleAddBrand = async () => {
        if (!state.newBrand.brandName.trim()) {
            toast.current?.show({
                severity: 'warn',
                summary: 'Warning',
                detail: 'Brand name is required'
            });
            return;
        }

        setStateValue({ loading: true });
        try {
            const response = await inventory.addNewBrand(state.newBrand, CRUDTYPE.save);

            if (response.status === 200 && response.operatedData !== undefined) {
                const newBrandData = response.operatedData;

                setStateValue({ item: { ...state.item, brandId: response.operatedData.brandId }, brands: [...state.brands, newBrandData], showBrandDialog: false, newBrand: { brandName: '', description: '' } });
                toast.current?.show({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Brand added successfully'
                });
            }
        } catch (error) {
            console.error('Error adding brand:', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to add brand'
            });
        } finally {
            setStateValue({ loading: false });
        }
    };
    const saveItem = async () => {
        if (!state.item.itemName.trim()) {
            toast.current?.show({
                severity: 'warn',
                summary: 'Warning',
                detail: 'Item name is required'
            });
            return;
        }

        if (!state.item.unitPrice || state.item.unitPrice <= 0) {
            toast.current?.show({
                severity: 'warn',
                summary: 'Warning',
                detail: 'Unit price must be greater than 0'
            });
            return;
        }

        setStateValue({ loading: true });
        try {
            let response = await inventory.addNewItem(state.item, state.crudType);

            if (response.status === 200 && response.operatedData) {
                toast.current?.show({
                    severity: 'success',
                    summary: 'Success',
                    detail: `Inventory item ${state.crudType === CRUDTYPE.update ? 'updated' : 'added'} successfully`
                });

                // Reset form and refresh list
                setStateValue({
                    showItemDialog: false,
                    item: { ...state.item, itemId: 0, itemName: '', description: '', categoryId: null, brandId: null, unitPrice: null, quantityInStock: 0, reorderLevel: 10, unitsPerBlister: 0, packagingType: PackingType.other, batchNumber: '', expiryDate: null, manufactureDate: null }
                });
                await fetchInventoryItems();
            }
        } catch (error) {
            console.error('Error saving inventory item:', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: `Failed to ${state.crudType === CRUDTYPE.update ? 'update' : 'add'} inventory item`
            });
        } finally {
            setStateValue({ loading: false });
        }
    };
    const leftToolbarTemplate = () => (
        <div className="flex flex-wrap gap-2">
            {!state.showItemDialog ? (
                <Button label="New Item" icon="pi pi-plus" severity="success" onClick={openNew} />
            ) : (
                <Button label="Go Back To Items List" icon="pi pi-arrow-left" severity="info" onClick={() => setStateValue({ showItemDialog: false })} />
            )}
            <Button label="Upload Items" icon="pi pi-upload" severity="warning" onClick={() => setStateValue({ showItemsUpload: true })} />
        </div>
    );
    const onItemsUpload = async (e: FileUploadFilesEvent) => {
        try {
            const file = e.files[0];
            const uploadFileHeaders = ['Item Name', 'Category', 'Brand', 'Unit Price', 'Quantity', 'Reorder Level', 'Units per Blister', 'Packaging Type', 'Description', 'Batch Number', 'Manufacture Date', 'Expiry Date'];
            const uploadObjectNames = ['itemName', 'category', 'brand', 'unitPrice', 'quantityInStock', 'reorderLevel', 'unitsPerBlister', 'packagingType', 'description', 'batchNumber', 'manufactureDate', 'expiryDate'];
            const uploadData = await configureExcelUpload<TInventoryItem>(file, uploadFileHeaders, uploadObjectNames);

            const response: any = await inventory.uploadInventoryItems(uploadData);
            const result = response.operatedData ?? { inserted: 0, failedRows: [] };
            const inserted = Number(result.inserted ?? 0);
            const failedRows: FailedRow[] = Array.isArray(result.failedRows) ? result.failedRows : [];

            if (failedRows.length === 0) {
                toast.current?.show({
                    severity: 'success',
                    summary: 'Upload Complete',
                    detail: `${inserted} item(s) uploaded successfully`
                });
            } else {
                toast.current?.show({
                    severity: 'warn',
                    summary: 'Upload Completed with Errors',
                    detail: `${inserted} inserted, ${failedRows.length} failed`
                });
                setStateValue({ showUploadResult: true, uploadResult: { inserted, failedRows } } as any);
            }
            if (inserted > 0) await fetchInventoryItems();
        } catch (error) {
            console.log(error);
            toast.current?.show({ severity: 'error', summary: 'Upload Error', detail: 'Failed to process upload' });
        } finally {
            setStateValue({ loading: false });
        }
    };

    const downloadFailedRowsCsv = () => {
        const failedRows: FailedRow[] = (state as any).uploadResult?.failedRows ?? [];
        if (failedRows.length === 0) return;
        const escape = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
        const header = ['row', 'itemName', 'reason'].join(',');
        const body = failedRows.map((r) => [r.row, r.itemName ?? '', r.reason].map(escape).join(',')).join('\n');
        const csv = `${header}\n${body}`;
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inventory-upload-failures-${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };
    return (
        <>
            <ItemsContext.Provider value={{ state, setStateValue, toast, editItem, deleteItem, saveItem, addNewCategory: handleAddCategory, addNewBrand: handleAddBrand }}>
                <div className="grid">
                    {/* Inventory Items List */}
                    <div className="flex justify-content-center align-items-center w-full">
                        <div className="lg:w-8">
                            <Toolbar left={leftToolbarTemplate} />
                        </div>
                    </div>
                    {/* Add/Edit Item Dialog */}
                    {state.showItemDialog ? <NewItem /> : <ItemsList />}
                    {/* Add Category Dialog */}
                    <NewCategory />

                    {/* Add Brand Dialog */}
                    <NewBrand />
                    <Dialog onHide={() => setStateValue({ showItemsUpload: false })} visible={state.showItemsUpload} header="Upload Items" style={{ width: '50vw' }} modal position="top">
                        <FileUpload customUpload={true} accept=".xlsx,.csv" uploadHandler={onItemsUpload} />
                    </Dialog>
                    <Dialog
                        onHide={() => setStateValue({ showUploadResult: false, uploadResult: null } as any)}
                        visible={!!(state as any).showUploadResult}
                        header={`Upload Result — ${(state as any).uploadResult?.inserted ?? 0} inserted, ${(state as any).uploadResult?.failedRows?.length ?? 0} failed`}
                        style={{ width: '60vw' }}
                        modal
                    >
                        <div className="flex justify-content-end mb-2">
                            <Button label="Download CSV" icon="pi pi-download" onClick={downloadFailedRowsCsv} disabled={!((state as any).uploadResult?.failedRows?.length)} />
                        </div>
                        <DataTable value={(state as any).uploadResult?.failedRows ?? []} paginator rows={10} emptyMessage="No failed rows">
                            <Column field="row" header="Row" style={{ width: '6rem' }} />
                            <Column field="itemName" header="Item Name" />
                            <Column field="reason" header="Reason" />
                        </DataTable>
                    </Dialog>
                    <GeneralPageProps toastRef={toast} toastPosition="bottom-right" />
                    <ConfirmDialog />
                </div>
            </ItemsContext.Provider>
        </>
    );
};

export default AddInventoryItem;
