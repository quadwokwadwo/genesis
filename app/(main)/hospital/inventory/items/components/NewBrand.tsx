import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import React from 'react';
import { useItemsContext } from '@/libs/contextProviders/AppContexts';

const NewBrand = () => {
    const { state, setStateValue, addNewBrand } = useItemsContext();
    return (
        <Dialog
            header="Add New Brand"
            visible={state.showBrandDialog}
            style={{ width: '450px' }}
            modal
            onHide={() => {
                setStateValue({ showBrandDialog: false, newBrand: { brandName: '', description: '' } });
            }}
        >
            <div className="formgrid grid">
                <div className="field col-12">
                    <label htmlFor="brandName" className="block text-900 font-medium mb-2">
                        Brand Name *
                    </label>
                    <InputText id="brandName" className="w-full" value={state.newBrand.brandName} onChange={(e) => setStateValue({ newBrand: { ...state.newBrand, brandName: e.target.value } })} placeholder="Enter brand name" />
                </div>

                <div className="field col-12">
                    <label htmlFor="brandDescription" className="block text-900 font-medium mb-2">
                        Description
                    </label>
                    <InputTextarea
                        id="brandDescription"
                        className="w-full"
                        value={state.newBrand.description}
                        onChange={(e) => setStateValue({ newBrand: { ...state.newBrand, description: e.target.value } })}
                        placeholder="Enter brand description"
                        rows={3}
                    />
                </div>

                <div className="field col-12 flex justify-content-end gap-2">
                    <Button
                        label="Cancel"
                        icon="pi pi-times"
                        className="p-button-text"
                        onClick={() => {
                            setStateValue({ showBrandDialog: false, newBrand: { brandName: '', description: '' } });
                        }}
                    />
                    <Button label="Add Brand" icon="pi pi-check" onClick={addNewBrand} loading={state.loading} />
                </div>
            </div>
        </Dialog>
    );
};
export default NewBrand;
