import React from 'react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import Modal from 'components/Modal';

export default observer(() => {
  const state = useLocalObservable(() => ({
    open: false
  }));

  React.useEffect(() => {
    setTimeout(() => {
      state.open = true;
    }, 2000);
  }, []);

  return (
    <Modal open={state.open} onClose={() => {
      state.open = false;
    }}>
      <div className="p-8 px-10 max-h-[90vh] box-border">
        <div className="-mt-2 text-slate-500 text-18 text-center">欢迎回来</div>
        <div className="pt-3 text-slate-400 text-12">自从您上次登录，我们新增了以下功能：</div>
        <div className="mt-4 bg-sky-300 h-12"></div>
        <div className="mt-2 bg-sky-300 h-12"></div>
        <div className="mt-2 bg-sky-300 h-12"></div>
      </div>
    </Modal>
  )
})