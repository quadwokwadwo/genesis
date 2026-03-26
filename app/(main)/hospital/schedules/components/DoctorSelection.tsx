import { Card } from 'primereact/card';
import { Avatar } from 'primereact/avatar';
import { Tag } from 'primereact/tag';
import { usePatientScheduleContext } from '@/libs/contextProviders/AppContexts';
import { Doctor } from '@/types/hospital';

const DoctorSelection = () => {
    const { state, setStateValue } = usePatientScheduleContext();

    const selectDoctor = (doctor: Doctor) => {
        //since we are editing appointment information, make the selected time available for reselection.

        setStateValue({
            selectedDoctor: doctor,
            appointment: { ...state.appointment, doctorId: doctor.userId },
            currentStep: 2
        });
    };
    return (
        <>
            <Card className="shadow-2">
                <div className="flex align-items-center mb-4">
                    <i className="pi pi-users text-primary text-2xl mr-3" />
                    <div>
                        <h4 className="m-0 text-primary">Select Doctor</h4>
                        <p className="text-600 m-0">Choose the appropriate specialist</p>
                    </div>
                </div>

                <div className="grid">
                    {state.doctors.map((doctor) => (
                        <div key={doctor.userId} className="col-12 md:col-6 lg:col-4">
                            <Card
                                className={`cursor-pointer transition-all transition-duration-200 hover:shadow-4 ${state.selectedDoctor?.userId === doctor.userId ? 'border-primary border-2' : 'border-1 border-300'} ${
                                    !doctor.available ? 'opacity-60' : ''
                                }`}
                                onClick={() => doctor.available && selectDoctor(doctor)}
                            >
                                <div className="text-center">
                                    <Avatar icon="pi pi-user" size="xlarge" shape="circle" className="bg-primary mb-3" />
                                    <h5 className="m-0 mb-2">{`${doctor.firstName} ${doctor.lastName}`}</h5>
                                    <p className="text-600 text-sm mb-3">{doctor.specialization}</p>

                                    <div className="flex justify-content-between align-items-center mb-3">
                                        <div className="flex align-items-center gap-1">
                                            <i className="pi pi-star-fill text-yellow-500" />
                                            <span className="font-semibold">{doctor.rating}</span>
                                        </div>
                                        <span className="text-sm text-600">{doctor.experience} years exp</span>
                                    </div>

                                    <div className="flex justify-content-between align-items-center">
                                        <span className="font-bold text-primary">${doctor.consultationFee}</span>
                                        <Tag value={doctor.available ? 'Available' : 'Unavailable'} severity={doctor.available ? 'success' : 'danger'} />
                                    </div>
                                </div>
                            </Card>
                        </div>
                    ))}
                </div>
            </Card>
        </>
    );
};
export default DoctorSelection;
