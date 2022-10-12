import React from 'react';
import { observer } from 'mobx-react-lite';
import { initSocket, getSocket } from 'utils/socket';
import { useStore } from 'store';
import { TrxStorage } from 'apis/common';
import { IComment, IPost } from 'apis/types';

export default observer(() => {
  const { userStore, commentStore, postStore, groupStore } = useStore();
  
  React.useEffect(() => {
    initSocket();
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
      body.onclick = (e: any) => {
        if (e.target && e.target.tagName === 'A') {
          e.preventDefault();
          const href = e.target.getAttribute('href');
          if (href && href.startsWith('http')) {
            window.open(href);
          }
        }
      };
    }
  }, []);

  return null;
});