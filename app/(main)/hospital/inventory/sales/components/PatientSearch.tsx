import { useInventorySalesContext } from '@/libs/contextProviders/AppContexts';
import { AutoComplete } from 'primereact/autocomplete';
import { TPatient } from '@/types/hospital';
import { Avatar } from 'primereact/avatar';

const PatientSearch = () => {
    const { state, setStateValue } = useInventorySalesContext();

    const searchPatients = (event: any) => {
        const query = event.query.toLowerCase();
        const queriedPatients = state.patients.filter(
            (patient) => patient.firstName.toLowerCase().includes(query) || patient.lastName.toLowerCase().includes(query) || patient.recordNumber?.toLowerCase().includes(query) || patient.address?.toLowerCase().includes(query)
        );
        setStateValue({ filteredPatients: queriedPatients });
    };
    return (
        <>
            <div className="grid">
                <div className="col-12 lg:col-6">
                    <label htmlFor="patient" className="block mb-2 font-semibold">
                        Select Patient *
                    </label>
                    <AutoComplete
                        id="patient"
                        value={state.searchPatient}
                        suggestions={state.filteredPatients}
                        completeMethod={searchPatients}
                        field="firstName"
                        onChange={(e) => setStateValue({ searchPatient: e.value })}
                        onSelect={(e) => {
                            setStateValue({ selectedPatient: e.value });
                            setStateValue({ saleData: { ...state.saleData, patientId: e.value.patientId } });
                        }}
                        placeholder="Search patient..."
                        className="w-full"
                        itemTemplate={(item: TPatient) => (
                            <div className="flex align-items-center gap-2">
                                <Avatar label={`${item.firstName.charAt(0)}${item.lastName.charAt(0)}`} shape="circle" className="bg-primary" size="normal" />
                                <div>
                                    <div className="font-bold">{`${item.firstName} ${item.lastName}`}</div>
                                    <div className="text-sm text-600">ID: {item.recordNumber}</div>
                                </div>
                            </div>
                        )}
                        dropdown
                    />
                </div>
                <div className="col-12 lg:col-6">
                    {state.selectedPatient && (
                        <div className="mt-2 p-3 bg-primary-50 border-round">
                            <div className="flex align-items-center gap-2">
                                <Avatar label={`${state.selectedPatient.firstName.charAt(0)}${state.selectedPatient.lastName.charAt(0)}`} shape="circle" className="bg-primary" />
                                <div>
                                    <div className="font-bold text-primary">{`${state.selectedPatient.firstName} ${state.selectedPatient.lastName}`}</div>
                                    <div className="text-sm text-600">ID: {state.selectedPatient.recordNumber}</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};
export default PatientSearch;
