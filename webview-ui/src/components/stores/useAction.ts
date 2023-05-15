
import create from 'zustand';

type Store = {
  validate: boolean;
  toggleValidate: () => void;
  fontSize: number;
  setFontSize: (size: number) => void;
};

export default create<Store>((set) => ({
  validate: true,
  toggleValidate: () => set((state) => ({ validate: !state.validate })),
  fontSize: 12,
  setFontSize: (size) => set(() => ({ fontSize: size })),
}));
