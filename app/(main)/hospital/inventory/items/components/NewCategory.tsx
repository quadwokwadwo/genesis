import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import React from 'react';
import { useItemsContext } from '@/libs/contextProviders/AppContexts';

const NewCategory = () => {
    const { state, setStateValue, addNewCategory } = useItemsContext();

    return (
        <>
            <Dialog
                header="Add New Category"
                visible={state.showCategoryDialog}
                style={{ width: '450px' }}
                modal
                onHide={() => {
                    setStateValue({ showCategoryDialog: false, newCategory: { categoryName: '', description: '' } });
                }}
            >
                <div className="formgrid grid">
                    <div className="field col-12">
                        <label htmlFor="categoryName" className="block text-900 font-medium mb-2">
                            Category Name *
                        </label>
                        <InputText
                            id="categoryName"
                            className="w-full"
                            value={state.newCategory.categoryName}
                            onChange={(e) => setStateValue({ newCategory: { ...state.newCategory, categoryName: e.target.value } })}
                            placeholder="Enter category name"
                        />
                    </div>

                    <div className="field col-12">
                        <label htmlFor="categoryDescription" className="block text-900 font-medium mb-2">
                            Description
                        </label>
                        <InputTextarea
                            id="categoryDescription"
                            className="w-full"
                            value={state.newCategory.description}
                            onChange={(e) => setStateValue({ newCategory: { ...state.newCategory, description: e.target.value } })}
                            placeholder="Enter category description"
                            rows={3}
                        />
                    </div>

                    <div className="field col-12 flex justify-content-end gap-2">
                        <Button
                            label="Cancel"
                            icon="pi pi-times"
                            className="p-button-text"
                            onClick={() => {
                                setStateValue({ showCategoryDialog: false, newCategory: { categoryName: '', description: '' } });
                            }}
                        />
                        <Button label="Add Category" icon="pi pi-check" onClick={addNewCategory} loading={state.loading} />
                    </div>
                </div>
            </Dialog>
        </>
    );
};
export default NewCategory;
