import React from 'react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { isPc } from 'utils/env';
import { useStore } from 'store';

export default observer(() => {
  const { postStore } = useStore();
  const state = useLocalObservable(() => ({
    loading: true
  }));

  React.useEffect(() => {
    setTimeout(() => {
      state.loading = false;
    }, 300); 
  }, []);

  return (
    <Tabs
      className={`px-4 md:px-0 ${isPc ? '' : 'small'} disable-transition`}
      value={postStore.feedType}
      onChange={(_e, newType) => {
        postStore.setFeedType(newType)
      }}
      TabIndicatorProps={{
        style: {
          visibility: state.loading ? 'hidden' : 'visible'
        }
      }}
    >
      <Tab value={'latest'} label='最新' />
      <Tab value={'following'} label='关注' />
    </Tabs>
  )
})