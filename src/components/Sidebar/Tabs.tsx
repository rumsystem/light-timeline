import React from 'react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { isPc } from 'utils/env';
import store from 'store2';

export default observer(() => {
  const state = useLocalObservable(() => ({
    feedType: store('feedType') || 'latest',
    loading: true
  }));

  React.useEffect(() => {
    setTimeout(() => {
      state.loading = false;
    }, 200); 
  }, []);

  return (
    <Tabs
      className={`px-4 md:px-0 ${isPc ? '' : 'small'}`}
      value={state.feedType}
      onChange={(_e, newType) => {
        state.feedType = newType;
        store.set('feedType', newType);
      }}
      TabIndicatorProps={{
        style: {
          visibility: state.loading ? 'hidden' : 'visible'
        }
      }}
    >
      <Tab value={'following'} label={<div>关注</div>} />
      <Tab value={'latest'} label={<div>最新</div>} />
      <Tab value={'random'} label={<div>发现</div>} />
    </Tabs>
  )
})