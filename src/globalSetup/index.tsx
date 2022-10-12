import React from 'react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { initSocket, getSocket } from 'utils/socket';
import { useStore } from 'store';
import { TrxStorage } from 'apis/common';
import { IComment, IPost } from 'apis/types';
import { useLocation, useHistory } from 'react-router-dom';
import Sidebar from 'components/Sidebar';

export default observer(() => {
  const { userStore, commentStore, postStore, groupStore, pathStore } = useStore();
  const location = useLocation();
  const history = useHistory();
  const state = useLocalObservable(() => ({
    ready: false,
  }));

  React.useEffect(() => {
    if (location.pathname === `/${groupStore.groupId}` || !pathStore.prevPath) {
      document.title = groupStore.group.groupName;
    } else if (location.pathname === `/${groupStore.groupId}/search`) {
      document.title = '搜索';
    }
    pathStore.push(location.pathname);
  }, [location.pathname]);
  
  React.useEffect(() => {
    initSocket();
    state.ready = true;
  }, []);

  React.useEffect(() => {
    const connectSocket = () => {
      getSocket().emit('authenticate', {
        groupId: groupStore.groupId,
        userAddress: userStore.address
      });
    }
    getSocket().on('authenticateResult', (result: string) => {
      console.log(result);
    });
    getSocket().on('connect', () => {
      if (userStore.isLogin) {
        connectSocket();
      }
    });
  }, []);

  React.useEffect(() => {
    const listener = async (comment: IComment) => {
      console.log('received a comment');
      console.log({ comment });
      commentStore.updateComment({
        ...comment,
        storage: TrxStorage.chain
      });
    }
    getSocket().on('comment', listener);
    return () => {
      getSocket().off('comment', listener);
    }
  }, []);

  React.useEffect(() => {
    const listener = (post: IPost) => {
      console.log('received a post', post);
      console.log({ post });
      postStore.updatePost({
        ...post,
        storage: TrxStorage.chain
      });
    }
    getSocket().on('post', listener);
    return () => {
      getSocket().off('post', listener);
    }
  }, []);

  React.useEffect(() => {
    const body = document.querySelector('body') as any;
    if (body) {
      const listener = (e: any) => {
        if (e.target && e.target.tagName === 'A') {
          e.preventDefault();
          e.stopPropagation();
          const href = e.target.getAttribute('href');
          if (href && href.startsWith('http')) {
            window.open(href);
          }
        }
      };
      body.addEventListener('click', listener);
      body.addEventListener('touchstart', listener, { passive: false });
    }
  }, []);

  React.useEffect(() => {
    const { push } = history;
    history.push = (path: string) => {
      if (path === window.location.pathname) {
        return;
      }
      push(path);
    }
  }, []);

  if (!state.ready) {
    return null
  }
  
  return <Sidebar />;
});