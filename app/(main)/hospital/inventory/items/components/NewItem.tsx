import { useItemsContext } from '@/libs/contextProviders/AppContexts';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { InputTextarea } from 'primereact/inputtextarea';
import { CRUDTYPE, PackingType } from '@/types/enums/enums';
import { getPackagingTypes } from '@/libs/utils';
import { TInventoryItem } from '@/types/hospital';

const NewItem = () => {
    const { state, setStateValue, toast, saveItem } = useItemsContext();

    const handleInputChange = (field: keyof TInventoryItem, value: any) => {
        setStateValue({ item: { ...state.item, [field]: value } });
    };

    const categoryOptions = state.categories.map((cat) => ({
        label: cat.categoryName,
        value: cat.categoryId
    }));

    const brandOptions = state.brands.map((brand) => ({
        label: brand.brandName,
        value: brand.brandId
    }));

    const packagingOptions = getPackagingTypes();
    return (
        <>
            <div className="flex justify-content-center align-items-center">
                <div className="formgrid grid mt-4 lg:w-8">
                    <div className="field col-12 md:col-6">
                        <label htmlFor="itemName" className="block text-900 font-medium mb-2">
                            Item Name *
                        </label>
                        <InputText id="itemName" type="text" className="w-full" value={state.item.itemName} onChange={(e) => handleInputChange('itemName', e.target.value)} placeholder="Enter item name" />
                    </div>

                    <div className="field col-12 md:col-6">
                        <label htmlFor="unitPrice" className="block text-900 font-medium mb-2">
                            Unit Price *
                        </label>
                        <InputNumber id="unitPrice" className="w-full" value={state.item.unitPrice} onValueChange={(e) => handleInputChange('unitPrice', e.value)} mode="currency" currency="USD" locale="en-US" placeholder="0.00" />
                    </div>

                    <div className="field col-12 md:col-6">
                        <label htmlFor="category" className="block text-900 font-medium mb-2">
                            Category
                        </label>
                        <div className="flex">
                            <Dropdown id="category" value={state.item.categoryId} options={categoryOptions} onChange={(e) => handleInputChange('categoryId', e.value)} placeholder="Select a category" className="flex-1 mr-2" showClear />
                            <Button icon="pi pi-plus" className="p-button-outlined" onClick={() => setStateValue({ showCategoryDialog: true })} tooltip="Add new category" />
                        </div>
                    </div>

                    <div className="field col-12 md:col-6">
                        <label htmlFor="brand" className="block text-900 font-medium mb-2">
                            Brand
                        </label>
                        <div className="flex">
                            <Dropdown id="brand" value={state.item.brandId} options={brandOptions} onChange={(e) => handleInputChange('brandId', e.value)} placeholder="Select a brand" className="flex-1 mr-2" showClear />
                            <Button icon="pi pi-plus" className="p-button-outlined" onClick={() => setStateValue({ showBrandDialog: true })} tooltip="Add new brand" />
                        </div>
                    </div>

                    <div className="field col-12 md:col-6">
                        <label htmlFor="quantityInStock" className="block text-900 font-medium mb-2">
                            Quantity in Stock
                        </label>
                        <InputNumber id="quantityInStock" className="w-full" value={state.item.quantityInStock} onValueChange={(e) => handleInputChange('quantityInStock', e.value || 0)} placeholder="0" min={0} />
                    </div>

                    <div className="field col-12 md:col-6">
                        <label htmlFor="reorderLevel" className="block text-900 font-medium mb-2">
                            Reorder Level
                        </label>
                        <InputNumber id="reorderLevel" className="w-full" value={state.item.reorderLevel} onValueChange={(e) => handleInputChange('reorderLevel', e.value || 10)} placeholder="10" min={0} />
                    </div>

                    <div className="field col-12 md:col-6">
                        <label htmlFor="unitsPerBlister" className="block text-900 font-medium mb-2">
                            Units per Blister
                        </label>
                        <InputNumber id="unitsPerBlister" className="w-full" value={state.item.unitsPerBlister} onValueChange={(e) => handleInputChange('unitsPerBlister', e.value || 0)} placeholder="0" min={0} />
                    </div>

                    <div className="field col-12 md:col-6">
                        <label htmlFor="packagingType" className="block text-900 font-medium mb-2">
                            Packaging Type
                        </label>
                        <Dropdown id="packagingType" value={state.item.packagingType} options={packagingOptions} onChange={(e) => handleInputChange('packagingType', e.value)} placeholder="Select packaging type" className="w-full" />
                    </div>

                    <div className="field col-12">
                        <label htmlFor="description" className="block text-900 font-medium mb-2">
                            Description
                        </label>
                        <InputTextarea id="description" className="w-full" value={state.item.description} onChange={(e) => handleInputChange('description', e.target.value)} placeholder="Enter item description" rows={4} />
                    </div>

                    <div className="field col-12 md:col-4">
                        <label htmlFor="batchNumber" className="block text-900 font-medium mb-2">
                            Batch Number
                        </label>
                        <InputText id="batchNumber" type="text" className="w-full" value={state.item.batchNumber ?? ''} onChange={(e) => handleInputChange('batchNumber', e.target.value)} placeholder="Batch / lot #" maxLength={60} />
                    </div>

                    <div className="field col-12 md:col-4">
                        <label htmlFor="manufactureDate" className="block text-900 font-medium mb-2">
                            Manufacture Date
                        </label>
                        <Calendar id="manufactureDate" className="w-full" value={state.item.manufactureDate ? new Date(state.item.manufactureDate as any) : null} onChange={(e) => handleInputChange('manufactureDate', e.value)} dateFormat="yy-mm-dd" showIcon placeholder="YYYY-MM-DD" />
                    </div>

                    <div className="field col-12 md:col-4">
                        <label htmlFor="expiryDate" className="block text-900 font-medium mb-2">
                            Expiry Date
                        </label>
                        <Calendar id="expiryDate" className="w-full" value={state.item.expiryDate ? new Date(state.item.expiryDate as any) : null} onChange={(e) => handleInputChange('expiryDate', e.value)} dateFormat="yy-mm-dd" showIcon placeholder="YYYY-MM-DD" />
                    </div>

                    <div className="flex gap-2 justify-content-end">
                        <Button label="Cancel" icon="pi pi-times" outlined onClick={() => setStateValue({ showItemDialog: false })} />
                        <Button label={state.crudType === CRUDTYPE.save ? 'Save' : 'Update'} icon="pi pi-check" loading={state.loading} onClick={saveItem} />
                    </div>
                </div>
            </div>
        </>
    );
};
export default NewItem;
