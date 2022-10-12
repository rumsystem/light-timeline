import React from 'react';
import { observer, useLocalStore } from 'mobx-react-lite';
import { useStore } from 'store';
import Button from 'components/Button';
import Loading from 'components/Loading';
import Modal from 'components/Modal';
import { IRelation } from 'apis/types';
import useInfiniteScroll from 'react-infinite-scroll-hook';
import { RelationApi } from 'apis';
import sleep from 'utils/sleep';
import { useHistory } from 'react-router-dom';
import { lang } from 'utils/lang';
import { TrxApi } from 'apis';

interface IProps {
  type: 'following' | 'muted'
  open: boolean
  onClose: () => void
}

const LIMIT = 20;

const UserList = observer((props: IProps) => {
  const { groupStore, userStore, snackbarStore } = useStore();
  const state = useLocalStore(() => ({
    hasMore: false,
    page: 0,
    isFetching: false,
    submitting: false,
    relations: {} as IRelation[],
  }));
  const loading = false;
  const scrollRef = React.useRef<HTMLInputElement>(null);
  const history = useHistory();

  React.useEffect(() => {
    (async () => {
      state.isFetching = true;
      try {
        const relations = await (props.type === 'following' ?
          RelationApi.listFollowing(groupStore.groupId, userStore.address, { offset: state.page * LIMIT, limit: LIMIT }) :
          RelationApi.listMuted(groupStore.groupId, userStore.address, { offset: state.page * LIMIT, limit: LIMIT }))
        state.relations.push(...relations);
        state.hasMore = relations.length === LIMIT;
      } catch (err) {
        console.log(err);
      }
      state.isFetching = false;
    })();
  }, [state, state.page]);

  const [sentryRef, { rootRef }] = useInfiniteScroll({
    loading: state.isFetching,
    hasNextPage: state.hasMore,
    rootMargin: '0px 0px 300px 0px',
    onLoadMore: async () => {
      state.page += 1;
    },
  });

  React.useEffect(() => {
    rootRef(scrollRef.current);
  }, [scrollRef.current]);

  const changeRelation = async (type: 'unfollow' | 'unmute', relation: IRelation) => {
    if (state.submitting) {
      return;
    }
    state.submitting = true;
    try {
      const res = await TrxApi.createObject({
        groupId: groupStore.groupId,
        object: {
          type: 'Note',
          content: JSON.stringify({
            type,
            to: relation.to
          })
        },
        aesKey: groupStore.cipherKey,
        privateKey: userStore.privateKey,
        ...(userStore.jwt ? { eth_pub_key: userStore.vaultAppUser.eth_pub_key, jwt: userStore.jwt } : {})
      });
      console.log(res);
      state.relations = state.relations.filter(r => r.to !== relation.to);
      if (type === 'unfollow') {
        userStore.updateUser(userStore.address, {
          followingCount: userStore.user.followingCount - 1,
          following: !userStore.user.following
        });
      }
    } catch (err) {
      console.log(err);
      snackbarStore.show({
        message: lang.somethingWrong,
        type: 'error',
      });
    }
    await sleep(2000);
    state.submitting = false;
  }

  return (
    <div className="bg-white rounded-12 text-gray-4a">
      <div className="px-5 py-4 leading-none text-16 border-b border-gray-d8 border-opacity-75 flex justify-between items-center">
        {props.type === 'following' && '我关注的人'}
        {props.type === 'muted' && '我屏蔽的人'}
      </div>
      <div className="w-full md:w-[330px] h-[80vh] md:h-[400px] overflow-y-auto" ref={scrollRef}>
        {loading && (
          <div className="pt-24 flex items-center justify-center">
            <Loading />
          </div>
        )}
        {!loading && (
          <div>
            {state.relations.map((relation) => {
              const isMyself = relation.to === userStore.address;
              return (
                <div
                  className="border-b border-gray-200 py-3 px-5 flex items-center justify-between"
                  key={relation.to}
                >
                  <div
                    onClick={async () => {
                      props.onClose();
                      await sleep(200);
                      history.push(`/${groupStore.groupId}/users/${relation.to}`);
                    }}
                  >
                    <div className="flex items-center cursor-pointer">
                      <img
                        className="w-10 h-10 rounded-full"
                        src={relation.extra.userProfile.avatar}
                        alt={relation.extra.userProfile.name}
                      />
                      <div className="ml-3">
                        <div className="text-14 truncate w-48 md:w-[200px]">{relation.extra.userProfile.name}</div>
                      </div>
                    </div>
                  </div>
                  {!isMyself && (
                    <div>
                      {props.type === 'following' && (  
                        <Button size="small" onClick={() => changeRelation('unfollow', relation)} outline>
                          取消关注
                        </Button>
                      )}
                      {props.type === 'muted' && (  
                        <Button size="small" color="red" onClick={() => changeRelation('unmute', relation)} outline>
                          解除屏蔽
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            {!loading && state.hasMore && (
              <div className="py-8 flex items-center justify-center">
                <Loading />
              </div>
            )}
            <div ref={sentryRef} />
          </div>
        )}
      </div>
    </div>
  );
});

export default observer((props: IProps) => {
  const { open, onClose } = props;

  return (
    <Modal
      open={open}
      onClose={onClose}
    >
      <UserList { ...props } />
    </Modal>
  );
});
