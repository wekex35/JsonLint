import { create } from "zustand";

interface MenuState {
    code : string,
    errorIndex: number,
    errorMessage: string,
    setErrorMessage: (value: number) => void,
    setCode: (value: string) => void,
    setErrorIndex: (value: string) => void,
}

interface EditorState {
    code : string,
    errorIndex: number,
    errorMessage: string,
    setErrorMessage: (value: string) => void,
    setCode: (value: string) => void,
    setErrorIndex: (value: number) => void,
    setCodeErrorMessage: (value: any) => void,
}
export default create<EditorState>()((set) => {
    return {
       code : `{"message":"hello world"}`,
       errorIndex: -1,
       errorMessage: "",

       setCode: (value: string) => {
        set(() => ({ code: value }))
       },
       setErrorIndex: (value: number) => {
        set(() => ({ errorIndex: value }))
       },
       setErrorMessage: (value: string) => {
        set(() => ({ errorMessage: value }))
       },
       setCodeErrorMessage: (value : any) => {
            set(() => ({ ...value }))
       }
    };
});