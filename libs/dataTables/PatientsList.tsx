import SimpleTable from '@/libs/components/SimpleTable';
import { TPatient, TTableProps } from '@/types/hospital';
import { tableEditOption } from '@/libs/utilityComponents';
import { calcAgeFromDOB, changeDateFormat } from '@/libs/utils';

const PatientsList: React.FC<TTableProps<TPatient>> = ({ tableData, setupTableDataEdit, promptTableDataDelete, loading = false }) => {
    return (
        <>
            <SimpleTable
                tableKey={'patientId'}
                tableData={tableData}
                columnsDef={[
                    { field: 'patientId', header: 'Patient Id' },
                    { field: 'firstName', header: 'First Name' },
                    { field: 'lastName', header: 'Last Name' },
                    { field: 'gender', header: 'Gender' },
                    { body: (rowData: TPatient) => <div>{changeDateFormat(new Date(rowData.dateOfBirth))}</div>, header: 'Date Of Birth' },
                    { body: (rowData: TPatient) => <div>{calcAgeFromDOB(new Date(rowData.dateOfBirth))} Years</div>, header: 'Age' },
                    { field: 'phone', header: 'Phone' },
                    {
                        body: (rowData: TPatient) =>
                            tableEditOption(
                                () => setupTableDataEdit(rowData),
                                () => promptTableDataDelete(rowData)
                            ),
                        header: 'Actions'
                    }
                ]}
                tableTitle="Patients List"
                searchValues={['firstName', 'lastName', 'gender', 'address']}
                loadingStatus={loading}
            />
        </>
    );
};
export default PatientsList;
