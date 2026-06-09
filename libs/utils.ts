import { DMProps, DropdownOption, IModifiableItems, PromptUserActionProps, TCountryData, TFileData, TFollowupRecord, TPatientFollowupVisit, TPatientVisitRecord, TPreviousVisit, TSalesItem, TVisitRecord } from '@/types/hospital';
import Joi from 'joi';
import { getCode, getNames } from 'country-list';
import { confirmPopup } from 'primereact/confirmpopup';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import { AppointmentType } from '@/types/enums/enums';
import _ from 'lodash';
export const remakeDropdown = <T>(data: T[], nameOption: keyof T, idOption: keyof T): DropdownOption[] => {
    return data.map((selectData: any) => {
        return {
            name: selectData[nameOption],
            code: selectData[idOption]
        };
    });
};
export const defaultSelected = (): DropdownOption => {
    return { name: '', code: '' };
};

export const getStateData = <T>(selectableFields: Array<keyof T>, stateObject: T) => {
    const selectedStateValues: any = {};
    for (const prop of selectableFields) {
        selectedStateValues[prop] = stateObject[prop];
    }
    return selectedStateValues;
};
export const displayMessage = ({ header, message, infoType, life, stickyStatus = false, allowClose = false, toastComponent }: DMProps) => {
    toastComponent.current?.show({
        severity: infoType,
        summary: header,
        detail: message,
        life,
        sticky: stickyStatus,
        closable: allowClose,
        className: 'text-black bg-white'
    });
};
export const pageDataValidation = <T>(joiValidationObject: Joi.ObjectSchema, stateValues: Partial<T>, toastRef: React.MutableRefObject<null>) => {
    const value = joiValidationObject.validate(stateValues, { abortEarly: true });
    console.log(value);
    if (value.error) {
        displayMessage({
            toastComponent: toastRef,
            header: 'Error',
            message: value.error.details[0].message,
            infoType: 'error',
            life: 3000
        });
        return false;
    }
    return true;
};

export function extractStateValues<T>(selectableProperties: Array<keyof T>, parentObject: T) {
    const selectedValues: any = {};
    for (const prop of selectableProperties) {
        selectedValues[prop] = parentObject[prop];
    }
    return selectedValues;
}

export const changeDateFormat = (date: Date) => {
    return format(date, 'yyyy-MM-dd');
};

export const getTableRowId = (e: React.MouseEvent<HTMLButtonElement>, rowProp: string) => {
    //@ts-ignore
    if ((e.target as HTMLElement).closest('button')[rowProp]) {
        //@ts-ignore
        return e.target.closest('button')[rowProp]!;
    }
    return 'Not Found';
};

export const remakeDropdownSelects = <T>(data: T[], nameOption: keyof T, idOption: keyof T): DropdownOption[] => {
    return data.map((selectData: any) => {
        const nameDisplay = selectData[nameOption];
        return {
            name: nameDisplay,
            code: selectData[idOption]
        };
    });
};
export const onInputControlFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    switch (e.type) {
        case 'focus':
            if (e.target.value === '0') {
                e.target.value = '';
                e.target.select();
            }
            break;
        case 'blur':
            if (e.target.value === '') {
                e.target.value = '0';
            }
            break;
    }
};

export const promptUserAction = ({ yesAction = () => {}, noAction = () => {}, event, displayText, yesActionDisplay = 'Yes', noActionDisplay = 'No', textSize = 14, widthClass = 'lg:w-6' }: PromptUserActionProps) => {
    confirmPopup({
        target: event.currentTarget,
        message: displayText,
        icon: 'pi pi-question-circle',
        acceptClassName: 'p-button-success',
        rejectClassName: 'p-button-danger',
        acceptIcon: 'pi pi-check',
        rejectIcon: 'pi pi-times',
        accept: yesAction,
        reject: noAction,
        acceptLabel: yesActionDisplay,
        rejectLabel: noActionDisplay,
        style: { fontSize: textSize },
        className: `${widthClass} w-full`,
        appendTo: document.body
    });
};
export const truncateString = (str: string, slashAt: number) => {
    return str.length > slashAt ? str.slice(0, slashAt) + '...' : str;
};

export const getURLFileName = (videoURL: string) => {
    const splitFileName = videoURL.split('/');
    return splitFileName[splitFileName.length - 1];
};
export const isValidHttpsUrl = (url: string) => {
    const regex = /^https:\/\/[^\s/$.?#].[^\s]*$/;
    return regex.test(url);
};

export const numberToLetter = (num: number): string => {
    if (num >= 1 && num <= 5) {
        return String.fromCharCode(64 + num); // ASCII value of 'A' is 65
    } else {
        return 'Invalid input, please enter a number between 1 and 5.';
    }
};

export const displayCountry = (): DropdownOption[] => {
    const countryList = getNames().map((country: string) => {
        return { countryDesc: country, countryId: getCode(country) };
    });
    return remakeDropdownSelects(countryList, 'countryDesc', 'countryId');
};

export const generateRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

export const getInvoiceNumber = (uniqueString: string, transactionsToday: number): string => {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const initials = uniqueString
        .split(' ')
        .map((str) => str[0])
        .join('');
    return `${initials}${dateStr}000${transactionsToday}`;
};

export const showPageTitle = (pageTitle: string) => {
    document.title = pageTitle;
};

export function sliceObject(selectableProperties: Array<keyof any>, parentObject: any): any {
    const selectedValues: any = {};
    for (const prop of selectableProperties) {
        selectedValues[prop] = parentObject[prop];
    }
    return selectedValues;
}

export const encodeFilesToData = (file: File, maxWidth: number = 0, maxHeight: number = 0): Promise<TFileData> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);

        img.onload = () => {
            const imageWidth = img.width;
            const imageHeight = img.height;

            if (imageWidth > maxWidth || imageHeight > maxHeight) {
                reject(new Error(`Image dimensions are too wide. Image dimensions should not exceed width: ${maxWidth}px and height: ${maxHeight}px`));
            } else {
                const reader = new FileReader();

                reader.onloadend = () => {
                    const base64Data = reader.result as string;
                    const fileExtension = file.name.split('.').pop() || '';
                    const fName = `file_${Date.now()}.${fileExtension}`;
                    resolve({ fileData: base64Data, fName });
                };

                reader.onerror = () => {
                    reject(reader.error);
                };

                reader.readAsDataURL(file);
            }
        };

        img.onerror = () => {
            reject(new Error('Failed to load the image.'));
        };
    });
};

export const getArrayItemIndex = <T>(itemId: number, itemsList: T[], searchProp: keyof T) => {
    return itemsList.findIndex((adjustingItem) => adjustingItem[searchProp] === itemId);
};
export const hideBreadCrumb = () => {
    document.querySelector('.layout-breadcrumb-container')?.classList.add('hidden');
};
export const showBreadCrumb = () => {
    document.querySelector('.layout-breadcrumb-container')?.classList.remove('hidden');
};

export const onCheckBoxStateChange = <T>(checkedItems: T[], targetValue: T, checkBoxState: boolean) => {
    return checkBoxState ? [...checkedItems, targetValue] : checkedItems.filter((stateValue) => stateValue !== targetValue);
};

export const checkExcelDataIntegrity = (excelFileHeaders: string[], localHeaders: string[]) => {
    const validData = excelFileHeaders.every((header: string) => localHeaders.includes(header.trim()));
    let arrangementIsValid = true;
    localHeaders.forEach((uploadHeader, index) => {
        // @ts-ignore
        const index2 = excelFileHeaders.indexOf(uploadHeader.trim());
        if (index !== index2) {
            arrangementIsValid = false;
            return false;
        }
    });
    return validData && arrangementIsValid;
};
export const configureExcelUpload = async <T>(file: File, uploadFileHeaders: string[], uploadObjectNameFields: string[]): Promise<T[]> => {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();

        fileReader.onload = (e) => {
            const bufferArray = e.target?.result as ArrayBuffer;
            const wb = XLSX.read(bufferArray, { type: 'buffer' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const headers: any = XLSX.utils.sheet_to_json(ws, { header: 1 })[0]; // Get excel file headers
            const sheetHeaders: string[] = headers.map((header: string) => header.trim());
            console.log(sheetHeaders);
            if (!checkExcelDataIntegrity(sheetHeaders, uploadFileHeaders)) {
                reject(new Error('File Dishonesty detected'));
                return;
            }
            const parsedData = XLSX.utils.sheet_to_json(ws, { range: 1, header: uploadObjectNameFields }); // Starting file read from row 2;
            console.log(parsedData);
            resolve(parsedData as T[]);
        };

        fileReader.readAsArrayBuffer(file);
    });
};
export const formattedDateStringWithAt = (date: Date) => {
    return format(new Date(date), 'EEE, MMM d, yyyy @ h:mm:ss a');
};
export const getAppointmentTypes = () => {
    const appointments = [
        { name: 'Initial Consultation', code: 'Initial Consultation' },
        { name: 'Follow-up Visit', code: 'Follow-up Visit' },
        { name: 'Procedure Consultation', code: 'Procedure Consultation' },
        { name: 'Test Results Review', code: 'Test Results Review' },
        { name: 'Post-procedure Check', code: 'Post Procedure Check' },
        { name: 'Emergency Consultation', code: 'Emergency Consultation' }
    ];
    return remakeDropdown(appointments, 'name', 'code');
};
export const getICD11Codes = () => {
    return [
        // Infertility
        { name: 'GA10.0 – Female infertility, primary' },
        { name: 'GA10.1 – Female infertility, secondary' },
        { name: 'GA11.0 – Male infertility, primary' },
        { name: 'GA11.1 – Male infertility, secondary' },

        // Causes of Female Infertility
        { name: 'GA12.0 – Ovulatory disorder (e.g., PCOS)' },
        { name: 'GA12.1 – Tubal factor infertility' },
        { name: 'GA12.2 – Uterine factor infertility (fibroids, adhesions)' },
        { name: 'GA12.3 – Cervical factor infertility' },
        { name: 'GA12.4 – Endometriosis-related infertility' },

        // Causes of Male Infertility
        { name: 'GA20.0 – Testicular dysfunction (low sperm count, motility issues)' },
        { name: 'GA20.1 – Endocrine causes of male infertility' },
        { name: 'GA20.2 – Obstructive azoospermia' },
        { name: 'GA20.3 – Ejaculatory or erectile dysfunction' },

        // Assisted Reproductive Technology (ART)
        { name: 'JB20 – Artificial insemination' },
        { name: 'JB21 – In vitro fertilization (IVF)' },
        { name: 'JB22 – Intracytoplasmic sperm injection (ICSI)' },
        { name: 'JB23 – Gamete intrafallopian transfer (GIFT)' },
        { name: 'JB24 – Embryo transfer procedures' },
        { name: 'JB25 – Cryopreservation of gametes/embryos' },

        // Pregnancy & Related Complications
        { name: 'JA00 – Supervision of normal pregnancy' },
        { name: 'JA01 – Supervision of high-risk pregnancy (e.g., after IVF)' },
        { name: 'KA02 – Ectopic pregnancy' },
        { name: 'KA20 – Miscarriage / Spontaneous abortion (early)' },
        { name: 'KA21 – Miscarriage / Spontaneous abortion (late)' }
    ];
};
export const getPackagingTypes = () => {
    const types = ['Blister', 'Bottle', 'Sachet', 'Box', 'Other'];
    return types.map((type) => ({
        value: type,
        label: type
    }));
};
export const getPaymentOptions = (): DropdownOption[] => {
    return [
        { name: 'Cash', code: 'Cash' },
        { name: 'Credit Card', code: 'Credit Card' },
        { name: 'Insurance', code: 'Insurance' },
        { name: 'Mobile Money', code: 'Mobile Money' },
        { name: 'Other', code: 'Other' }
    ];
};

export const lab_tech = () => {
    return [
        {
            label: 'Hospital',
            icon: 'pi pi-fw pi-building',
            items: [
                {
                    label: 'Labs',
                    icon: 'pi pi-fw pi-bars',
                    items: [
                        // {
                        //     label: 'Entry',
                        //     icon: 'pi pi-fw pi-pencil',
                        //     to: '/hospital/lab/entry'
                        // },
                        // {
                        //     label: 'Review',
                        //     icon: 'pi pi-check-circle',
                        //     to: '/hospital/lab/review'
                        // },
                        {
                            label: 'IVF Embryo Transfer',
                            icon: 'pi pi-check-circle',
                            to: '/hospital/lab/ivf-embryo'
                        },
                        {
                            label: 'Semen Analysis',
                            icon: 'pi pi-check-circle',
                            to: '/hospital/lab/semen'
                        },
                        {
                            label: 'Embryo Bank',
                            icon: 'pi pi-check-circle',
                            to: '/hospital/lab/embryo-cryopreservation'
                        },
                        {
                            label: 'Sperm Bank',
                            icon: 'pi pi-check-circle',
                            to: '/hospital/lab/sperm-preservation'
                        },
                    ]
                },
                {
                    label: 'Self Service',
                    icon: 'pi pi-fw pi-user',
                    items: [
                        { label: 'My Leave Requests', icon: 'pi pi-fw pi-inbox', to: '/hospital/hr/leave-requests' },
                        { label: 'My Attendance', icon: 'pi pi-fw pi-check-square', to: '/hospital/hr/attendance' }
                    ]
                }
            ]
        }
    ];
};

export const adminAndDoctorsPages = () => {
    return [
        // Administration group
        {
            label: 'Administration',
            icon: 'pi pi-fw pi-desktop',
            items: [
                {
                    label: 'Users',
                    icon: 'pi pi-fw pi-user',
                    to: '/hospital/users/doctors'
                },
                {
                    label: 'Investigations',
                    icon: 'pi pi-check-circle',
                    to: '/hospital/investigations'
                },
                {
                    label: 'Settings',
                    icon: 'pi pi-fw pi-cog',
                    to: '/hospital/settings'
                }
            ]
        },
        { separator: true },
        // Access Control (RBA) — admin only
        {
            label: 'Access Control',
            icon: 'pi pi-fw pi-shield',
            items: [
                {
                    label: 'Roles',
                    icon: 'pi pi-fw pi-id-card',
                    to: '/hospital/admin/rba/roles'
                },
                {
                    label: 'Role Permissions',
                    icon: 'pi pi-fw pi-key',
                    to: '/hospital/admin/rba/role-permissions'
                },
                {
                    label: 'User Roles',
                    icon: 'pi pi-fw pi-users',
                    to: '/hospital/admin/rba/user-roles'
                },
                {
                    label: 'Auth Events',
                    icon: 'pi pi-fw pi-history',
                    to: '/hospital/admin/rba/auth-events'
                }
            ]
        },
        { separator: true },
        // HR — admin
        {
            label: 'HR',
            icon: 'pi pi-fw pi-id-card',
            items: [
                { label: 'Departments', icon: 'pi pi-fw pi-sitemap', to: '/hospital/hr/departments' },
                { label: 'Positions', icon: 'pi pi-fw pi-briefcase', to: '/hospital/hr/positions' },
                { label: 'Employees', icon: 'pi pi-fw pi-users', to: '/hospital/hr/employees' },
                { label: 'Shifts', icon: 'pi pi-fw pi-clock', to: '/hospital/hr/shifts' },
                { label: 'Schedules', icon: 'pi pi-fw pi-calendar', to: '/hospital/hr/schedules' },
                { label: 'Leave Types', icon: 'pi pi-fw pi-tags', to: '/hospital/hr/leave-types' },
                { label: 'Leave Balances', icon: 'pi pi-fw pi-chart-bar', to: '/hospital/hr/leave-balances' },
                { label: 'Leave Requests', icon: 'pi pi-fw pi-inbox', to: '/hospital/hr/leave-requests' },
                { label: 'Attendance', icon: 'pi pi-fw pi-check-square', to: '/hospital/hr/attendance' }
            ]
        },
        { separator: true },
        // Payroll — admin
        {
            label: 'Payroll',
            icon: 'pi pi-fw pi-wallet',
            items: [
                { label: 'Components', icon: 'pi pi-fw pi-list', to: '/hospital/payroll/components' },
                { label: 'Structures', icon: 'pi pi-fw pi-sliders-h', to: '/hospital/payroll/structures' },
                { label: 'Periods', icon: 'pi pi-fw pi-calendar-plus', to: '/hospital/payroll/periods' },
                { label: 'Country Config', icon: 'pi pi-fw pi-flag', to: '/hospital/payroll/country-config' }
            ]
        },
        { separator: true },
        // Management group
        {
            label: 'Management',
            icon: 'pi pi-fw pi-briefcase',
            items: [
                {
                    label: 'Patients',
                    icon: 'pi pi-fw pi-users',
                    to: '/hospital/patients'
                },
                {
                    label: 'Appointments',
                    icon: 'pi pi-fw pi-calendar',
                    to: '/hospital/schedules'
                },
                {
                    label: 'Doctors',
                    icon: 'pi pi-fw pi-users',
                    to: '/hospital/users/doctors/dashboard'
                },
                {
                    label: 'Nurses',
                    icon: 'pi pi-fw pi-users',
                    to: '/hospital/users/nurse'
                }
            ]
        },
        { separator: true },
        // Clinical group
        {
            label: 'Clinical',
            icon: 'pi pi-fw pi-book',
            items: [
                {
                    label: 'Patient Visit',
                    icon: 'pi pi-fw pi-pencil',
                    to: '/hospital/enhanced'
                },
                {
                    label: 'Follow-up',
                    icon: 'pi pi-check-circle',
                    to: '/hospital/visit/followup'
                },
                {
                    label: 'Procedure Consultation',
                    icon: 'pi pi-fw pi-pencil',
                    to: '/hospital/procedures/consultation'
                },
                {
                    label: 'Procedure Follow-up',
                    icon: 'pi pi-check-circle',
                    to: '/hospital/procedures/followup'
                }
            ]
        },
        { separator: true },
        // Laboratory group
        {
            label: 'Laboratory',
            icon: 'pi pi-fw pi-bars',
            items: [
                {
                    label: 'Entry',
                    icon: 'pi pi-fw pi-pencil',
                    to: '/hospital/lab/entry'
                },
                {
                    label: 'Review',
                    icon: 'pi pi-check-circle',
                    to: '/hospital/lab/review'
                },
                {
                    label: 'IVF Embryo Transfer',
                    icon: 'pi pi-check-circle',
                    to: '/hospital/lab/ivf-embryo'
                },
                {
                    label: 'Semen Analysis',
                    icon: 'pi pi-check-circle',
                    to: '/hospital/lab/semen'
                },
                {
                    label: 'Embryo Bank',
                    icon: 'pi pi-check-circle',
                    to: '/hospital/lab/embryo-cryopreservation'
                },
                {
                    label: 'Sperm Bank',
                    icon: 'pi pi-check-circle',
                    to: '/hospital/lab/sperm-preservation'
                }
            ]
        },
        { separator: true },
        // Finance group
        {
            label: 'Finance',
            icon: 'pi pi-fw pi-money-bill',
            items: [
                {
                    label: 'Billing',
                    icon: 'pi pi-fw pi-money-bill',
                    to: '/hospital/billing'
                },
                {
                    label: 'Receive Payment',
                    icon: 'pi pi-fw pi-briefcase',
                    to: '/hospital/payments'
                },
                {
                    label: 'End of Day',
                    icon: 'pi pi-fw pi-calendar-times',
                    to: '/hospital/payments/end-of-day'
                },
                {
                    label: 'Expenses',
                    icon: 'pi pi-fw pi-dollar',
                    to: '/hospital/expenses'
                },
                {
                    label: 'Summary',
                    icon: 'pi pi-fw pi-calculator',
                    to: '/hospital/overview'
                },
                { separator: true },
                { label: 'Chart of Accounts', icon: 'pi pi-fw pi-book', to: '/hospital/finance/chart-of-accounts' },
                { label: 'Cost Centers', icon: 'pi pi-fw pi-sitemap', to: '/hospital/finance/cost-centers' },
                { label: 'Fiscal Periods', icon: 'pi pi-fw pi-calendar', to: '/hospital/finance/fiscal-periods' },
                { label: 'Journal Entries', icon: 'pi pi-fw pi-file-edit', to: '/hospital/finance/journal-entries' },
                { label: 'Journal Templates', icon: 'pi pi-fw pi-clone', to: '/hospital/finance/journal-templates' },
                { label: 'Vendors', icon: 'pi pi-fw pi-truck', to: '/hospital/finance/vendors' },
                { label: 'AP Invoices', icon: 'pi pi-fw pi-file', to: '/hospital/finance/ap-invoices' },
                { label: 'Vendor Payments', icon: 'pi pi-fw pi-credit-card', to: '/hospital/finance/vendor-payments' },
                { label: 'Budgets', icon: 'pi pi-fw pi-chart-line', to: '/hospital/finance/budgets' },
                { label: 'Bank Reconciliation', icon: 'pi pi-fw pi-th-large', to: '/hospital/finance/bank-reconciliation' },
                { label: 'Petty Cash', icon: 'pi pi-fw pi-wallet', to: '/hospital/finance/petty-cash' },
                { label: 'Posting Mappings', icon: 'pi pi-fw pi-cog', to: '/hospital/finance/posting-mappings' }
            ]
        },
        { separator: true },
        {
            label: 'Inventory',
            icon: 'pi pi-desktop',
            items: [
                {
                    label: 'Drug Items',
                    icon: 'pi pi-fw pi-shopping-cart',
                    to: '/hospital/inventory/items'
                },
                {
                    label: 'Adjustments',
                    icon: 'pi pi-fw pi-sort-alpha-up',
                    to: '/hospital/inventory/adjustments'
                },
                {
                    label: 'Sales',
                    icon: 'pi pi-fw pi-cart-plus',
                    to: '/hospital/inventory/sales'
                },
                {
                    label: 'Stock',
                    icon: 'pi pi-fw pi-table',
                    to: '/hospital/inventory/stock'
                }
            ]
        }
    ];
};
export const nursesPages = () => {
    return [
        {
            label: 'Dashboards',
            icon: 'pi pi-home',
            items: [
                {
                    label: 'E-Commerce',
                    icon: 'pi pi-fw pi-home',
                    to: '/'
                }
            ]
        },
        { separator: true },
        {
            label: 'Hospital',
            icon: 'pi pi-fw pi-building',
            items: [
                // Administration group (limited for nurses)
                {
                    label: 'Administration',
                    icon: 'pi pi-fw pi-desktop',
                    items: [
                        {
                            label: 'Investigations',
                            icon: 'pi pi-check-circle',
                            to: '/hospital/investigations'
                        }
                    ]
                },
                // Management group
                {
                    label: 'Management',
                    icon: 'pi pi-fw pi-briefcase',
                    items: [
                        {
                            label: 'Patients',
                            icon: 'pi pi-fw pi-users',
                            to: '/hospital/patients'
                        },
                        {
                            label: 'Appointments',
                            icon: 'pi pi-fw pi-calendar',
                            to: '/hospital/schedules'
                        },
                        {
                            label: 'Nurses',
                            icon: 'pi pi-fw pi-users',
                            to: '/hospital/users/nurse'
                        }
                    ]
                },
                // Laboratory group
                {
                    label: 'Laboratory',
                    icon: 'pi pi-fw pi-bars',
                    items: [
                        {
                            label: 'Entry',
                            icon: 'pi pi-fw pi-pencil',
                            to: '/hospital/lab/entry'
                        }
                    ]
                },
                // Finance group
                {
                    label: 'Finance',
                    icon: 'pi pi-fw pi-money-bill',
                    items: [
                        {
                            label: 'Billing',
                            icon: 'pi pi-fw pi-money-bill',
                            to: '/hospital/billing'
                        },
                        {
                            label: 'Receive Payment',
                            icon: 'pi pi-fw pi-briefcase',
                            to: '/hospital/payments'
                        },
                        {
                            label: 'Expenses',
                            icon: 'pi pi-fw pi-dollar',
                            to: '/hospital/expenses'
                        }
                    ]
                }
            ]
        },
        { separator: true },
        {
            label: 'Inventory',
            icon: 'pi pi-desktop',
            items: [
                {
                    label: 'Drug Items',
                    icon: 'pi pi-fw pi-shopping-cart',
                    to: '/hospital/inventory/items'
                },
                {
                    label: 'Sales',
                    icon: 'pi pi-fw pi-cart-plus',
                    to: '/hospital/inventory/sales'
                }
            ]
        },
        { separator: true },
        {
            label: 'Self Service',
            icon: 'pi pi-fw pi-user',
            items: [
                { label: 'My Leave Requests', icon: 'pi pi-fw pi-inbox', to: '/hospital/hr/leave-requests' },
                { label: 'My Attendance', icon: 'pi pi-fw pi-check-square', to: '/hospital/hr/attendance' }
            ]
        }
    ];
};

export const getPatientPreviousVisits = (previousVisits: (TPatientVisitRecord | TFollowupRecord)[]): TPreviousVisit[] => {
    return previousVisits.map((visit) => {
        const visitRecordings: TVisitRecord | TPatientFollowupVisit = typeof visit.visitRecordings === 'string' ? JSON.parse(visit.visitRecordings) : visit.visitRecordings;

        const visitData =
            visitRecordings.visitType === AppointmentType.initialConsultation
                ? {
                      ...visit,
                      visitRecordings: visitRecordings as TVisitRecord
                  }
                : { ...visit, visitRecordings: visitRecordings as TPatientFollowupVisit };

        return { visitType: visitRecordings.visitType, visitData };
    });
};
export const castStringToFloat = (value: string | number) => (typeof value === 'string' ? parseFloat(value) : value);


//compares two arrays of holding similar object values but having differences in quantity value.
//when the parameters are switched difference results are gotten. old array first gives decreased quantity value.
export const getDecreasedOrIncreaseQuantity = (oldArray: TSalesItem[], newArray: TSalesItem[]): IModifiableItems[] => {
    return _.chain(oldArray)
        .map((oldItem) => {
            const newItem = _.find(newArray, { itemId: oldItem.itemId });
            if (!newItem) return null;

            const oldQty = typeof oldItem.quantity==='string'?parseFloat(oldItem.quantity):oldItem.quantity;
            const newQty = typeof newItem.quantity==='string'?parseFloat(newItem.quantity):newItem.quantity;

            if (_.isFinite(oldQty) && _.isFinite(newQty) && oldQty > newQty) {
                return {
                    itemId: oldItem.itemId,
                    differenceInQuantity: oldQty - newQty
                };
            }

            return null;
        })
        .compact() // removes null values
        .value();
};

//compares two sale items and return the missing object. if the parameters are switched different results are gotten.
//with oldArray first, we get deleted items and vice versa
export const getRemovedOrAddedItems = (oldArray: TSalesItem[], newArray: TSalesItem[]) => {
    const newItemIds = _.map(newArray, 'itemId');

    return _.filter(oldArray, (item) => !_.includes(newItemIds, item.itemId));
};
export const formatCurrency = (
    amount: number,
    countryData: TCountryData = {
        countryName: 'Ghana',
        locale: 'en-GH',
        currency: 'GHS'
    }
) => {
    return new Intl.NumberFormat(countryData.locale, {
        style: 'currency',
        currency: countryData.currency
    }).format(amount);
};
export const calcAgeFromDOB = (dob: Date | null): number => {
    if (!dob) return 0;
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    return age;
};

// Returns the base host for static/user-uploaded assets. In production, images may be served
// from a different host. Configure via NEXT_PUBLIC_ASSET_HOST; otherwise default to provided LAN host.
export const getAssetHost = (): string => {
    const host = process.env.NEXT_PUBLIC_ASSET_HOST || '';
    // Ensure no trailing slash
    return host.replace(/\/+$/, '');
};

// Resolve IVF blastocyst image source to a usable URL in any environment.
// - data URLs: returned as-is (legacy/in-flight previews)
// - blob URLs: returned as-is (Module 16 in-memory previews)
// - `file:<uuid>` tokens (Module 16): rewritten to the auth-gated
//   /api/files/<uuid> endpoint
// - absolute http(s) URLs: returned as-is
// - paths starting with `storage/` (older multipart uploads): served via the
//   Next.js proxy → Express `/api/ivf/files/<basename>`
// - root-relative `/uploads/...` paths (legacy public files): prefixed with
//   asset host
// - bare filenames: legacy, assumed to live under /uploads/ivf on the asset host
export const resolveEmbryoImageSrc = (imageUrl: string): string => {
    if (!imageUrl) return '';
    const trimmed = imageUrl.trim();
    if (trimmed.startsWith('data:image')) return trimmed;
    if (trimmed.startsWith('blob:')) return trimmed;
    if (trimmed.startsWith('file:')) {
        // Strip the `file:` scheme — keep the bare UUID and route through the
        // central Module 16 file endpoint.
        const id = trimmed.slice('file:'.length);
        return `/api/files/${encodeURIComponent(id)}`;
    }
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    // Older auth-gated storage path. Use only the basename so we can't be
    // tricked into requesting arbitrary subpaths.
    if (trimmed.startsWith('storage/') || trimmed.startsWith('/storage/') || trimmed.startsWith('storage\\')) {
        const base = trimmed.split(/[\\/]/).pop() || '';
        return `/api/ivf/files/${encodeURIComponent(base)}`;
    }
    const host = getAssetHost();
    if (trimmed.startsWith('/uploads/')) return `${host}${trimmed}`;
    // Default to root-level /uploads for bare filenames (legacy rows)
    return `${host}/uploads/ivf/${trimmed}`;
};
export const frequencyOptions = [
    { label: 'Once daily (OD)', value: 'OD' },
    { label: 'Twice daily (BD)', value: 'BD' },
    { label: 'Three times daily (TDS)', value: 'TDS' },
    { label: 'Four times daily (QDS)', value: 'QDS' },
    { label: 'As needed (PRN)', value: 'PRN' }
];
