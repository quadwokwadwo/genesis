import { localDB } from '@/libs/utils/LocalDB';
import { TFollowupRecord, TPatient } from '@/types/hospital';
import { CRUDTYPE } from '@/types/enums/enums';

class LocalDatabase{
    async setSelectedPatient(selectedPatient:TPatient,crudType:CRUDTYPE,visitRecordings:TFollowupRecord){
        try{
            localDB.transaction('rw',[localDB.localData],async()=>{
            await localDB.localData.put({storageId:1,storage:{selectedPatient:selectedPatient,crudType:crudType,visitRecordings}});
            })
        }catch(e){
            throw new Error(e);
        }
    }
    async getSelectedPatient(){
        try{
            const data=await localDB.localData.get(1);
            return data?.storage;
        }catch(error){
            throw new Error(error);
        }
    }
    async clearSelectedPatient(){
        try{
            await localDB.localData.put({storageId:1,storage:{selectedPatient:null,crudType:CRUDTYPE.save,visitRecordings:null}}).then(()=>{
                return true;
            })
        }catch(error){
            throw new Error(error);
        }
    }
}
export default LocalDatabase;
