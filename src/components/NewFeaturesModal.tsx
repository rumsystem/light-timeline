import React from 'react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import Modal from 'components/Modal';
import Button from 'components/Button';

export default observer(() => {
  const state = useLocalObservable(() => ({
    open: false,
    visible: false
  }));

  React.useEffect(() => {
    setTimeout(() => {
      state.open = false;
    }, 2000);
  }, []);

  React.useEffect(() => {
    if (state.open) {
      setTimeout(() => {
        state.visible = true;
      }, 500);
    }
  }, [state.open]);

  return (
    <Modal
      transitionDuration={{
        appear: 0,
        enter: 700,
        exit: 200,
      }}
      open={state.open} onClose={() => {
      state.open = false;
    }}>
      <div className="p-8 px-10 md:px-12 h-[95vh] md:h-[auto] md:max-h-[650px] box-border overflow-y-auto">
        <div className="-mt-2 text-slate-600 text-20 text-center font-bold">欢迎回来</div>
        <div className="pt-3 text-slate-500 text-12 text-center">自从您上次登录，我们新增了以下功能：</div>
        <div className={`${state.visible ? 'visible' : 'invisible'}`}>
          <div className="min-h-[55vh] md:min-h-[300px]">
            <div className="mt-5 w-full md:w-[320px]">
              <img className="rounded-10" src="http://192.168.31.120:3001/img5.png" alt="" />
            </div>
            <div className="mt-5 w-full md:w-[320px]">
              <img className="rounded-10" src="http://192.168.31.120:3001/img5.png" alt="" />
            </div>
            <div className="mt-5 w-full md:w-[320px]">
              <img className="rounded-10" src="http://192.168.31.120:3001/img5.png" alt="" />
            </div>
            <div className="mt-5 w-full md:w-[320px]">
              <img className="rounded-10" src="http://192.168.31.120:3001/img5.png" alt="" />
            </div>
          </div>
          <div className="flex justify-center mt-10 pb-5">
            <Button size="large" onClick={() => {
              state.open = false;
            }}>我知道了</Button>
          </div>
        </div>
      </div>
    </Modal>
  )
})