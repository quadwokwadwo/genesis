import { ConfirmPopup } from 'primereact/confirmpopup';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
type GeneralPageProps = {
    toastRef: React.MutableRefObject<null>;
    toastPosition?: 'top-right' | 'center' | 'top-left' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
};
export const GeneralPageProps: React.FC<GeneralPageProps> = ({ toastRef, toastPosition = 'top-right' }) => {
    return (
        <>
            <Toast ref={toastRef} position={toastPosition} baseZIndex={9999}/>
            <ConfirmPopup />
        </>
    );
};
export const tableEditOption = (editClick: (e: any) => void, deleteClick: (e: any) => void) => {
    return (
        <>
            <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={editClick} />
            <Button icon="pi pi-trash" className="p-button-rounded p-button-warning" onClick={deleteClick} />
        </>
    );
};
