import React from 'react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { isPc } from 'utils/env';

export default observer(() => {
  const state = useLocalObservable(() => ({
    tabIndex: 1
  }));

  React.useEffect(() => {

  }, []);

  return (
    <Tabs
      className={`px-4 md:px-0 ${isPc ? '' : 'small'}`}
      value={state.tabIndex}
      onChange={(_e, newIndex) => {
        console.log({ newIndex });
        state.tabIndex = newIndex;
      }}
    >
      <Tab key={0} label={<div>关注</div>} />
      <Tab key={1} label={<div>最新</div>} />
      <Tab key={2} label={<div>发现</div>} />
    </Tabs>
  )
})