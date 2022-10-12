import React from 'react';
import { observer } from 'mobx-react-lite';
import Feed from './Feed';
import Sidebar from 'components/Sidebar';

export default observer(() => {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  return (
    <div className="w-full h-screen overflow-auto" ref={scrollRef}>
      <div className="w-full md:w-[600px] box-border mx-auto relative">
        <div />
        <Feed scrollRef={scrollRef} />
        <Sidebar scrollRef={scrollRef} />
      </div>
    </div>
  )
});
