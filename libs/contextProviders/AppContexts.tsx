import createContextMaker from '@/libs/contextProviders/ContextMaker';
import {
    DoctorContextProps,
    DoctorState, EnhancedVisitState,
    ExpenditureContextProps,
    ExpenditureState,
    FollowupContextProps,
    FollowUpState,
    HospitalSettingsState,
    SchedulingState,
    TAdjustmentPageState, TBillContextProps, TBillPageState,
    THospitalSettingsContextProps,
    TInventorySalesContextProps,
    TItemsContextProps,
    TItemsPageState,
    TPatientScheduleContextProps,
    TPatientState,
    TPatientVisitContextProps,
    TSalesPageState,
    TStateContextProps,
    TStockAdjustmentContextProps, TStockReportContextProps,
    TStockReportState
} from '@/types/hospital';

export const {Context:PatientVisitContext,useContextMaker:usePatientVisitContext}=createContextMaker<TPatientVisitContextProps<EnhancedVisitState>>();
export const {Context:PatientScheduleContext,useContextMaker:usePatientScheduleContext}=createContextMaker<TPatientScheduleContextProps<SchedulingState>>();
export const {Context:PatientContext,useContextMaker:usePatientContext}=createContextMaker<TStateContextProps<TPatientState>>();
export const {Context:DoctorContext,useContextMaker:useDoctorContext}=createContextMaker<DoctorContextProps<DoctorState>>();
export const {Context:FollowupContext,useContextMaker:useFollowupContext}=createContextMaker<FollowupContextProps<FollowUpState>>();
export const {Context:InventorySalesContext,useContextMaker:useInventorySalesContext}=createContextMaker<TInventorySalesContextProps<TSalesPageState>>();
export const {Context:ItemsContext,useContextMaker:useItemsContext}=createContextMaker<TItemsContextProps<TItemsPageState>>();
export const {Context:AdjustmentsContext,useContextMaker:useAdjustmentsContext}=createContextMaker<TStockAdjustmentContextProps<TAdjustmentPageState>>();
export const {Context:StockReportContext,useContextMaker:useStockReportContext}=createContextMaker<TStockReportContextProps<TStockReportState>>();
export const {Context:HospitalSettingsContext,useContextMaker:useHospitalSettingsContext}=createContextMaker<THospitalSettingsContextProps<HospitalSettingsState>>();
export const {Context:ExpenditureContext,useContextMaker:useExpenditureContext}=createContextMaker<ExpenditureContextProps<ExpenditureState>>();
export const {Context:BillingContext,useContextMaker:useBillingContext}=createContextMaker<TBillContextProps<TBillPageState>>();
