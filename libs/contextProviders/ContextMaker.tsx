import { createContext, useContext } from 'react';

function createContextMaker<TWrapperType>(){
    const Context = createContext<TWrapperType | undefined>(undefined);
    const useContextMaker = ()=>{
        const context = useContext(Context);
        if(!context){
            throw new Error('useContext must be within a provider');
        }
        return context;
    }
    return {Context,useContextMaker}
}
export default createContextMaker;
