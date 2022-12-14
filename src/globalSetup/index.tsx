import React from 'react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { initSocket, getSocket } from 'utils/socket';
import { useStore } from 'store';
import { TrxStorage } from 'apis/common';
import { IComment, IPost } from 'apis/types';
import { useLocation, useHistory } from 'react-router-dom';
import Sidebar from 'components/Sidebar';
import { isMobile } from 'utils/env';
import { GroupApi } from 'apis';

export default observer(() => {
  const { userStore, commentStore, postStore, groupStore, pathStore } = useStore();
  const location = useLocation();
  const history = useHistory();
  const state = useLocalObservable(() => ({
    ready: false,
  }));

  React.useEffect(() => {
    const { pathname } = location;
    if (pathname === `/` || !pathStore.prevPath) {
      document.title = 'Rum 微博广场';
    } else if (pathname === `/search`) {
      document.title = '搜索';
    }
    pathStore.push(pathname);
    const isHomePage = pathname === '/';
    const isMyUserPage = pathname.startsWith(`/users/${userStore.address}`);
    if (pathStore.prevPath && (isHomePage || isMyUserPage)) {
      (async () => {
        try {
          const group = await GroupApi.getDefaultGroup();
          groupStore.setGroup(group);
        } catch (err) {
          console.log(err);
        }
      })();
    }
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
        ...(commentStore.map[comment.trxId] || comment),
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
        ...(postStore.map[post.trxId] || post),
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
            if (isMobile) {
              window.location.href = href;
            } else {
              window.open(href);
            }
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