import React from 'react';
import { observer, useLocalStore } from 'mobx-react-lite';
import { useStore } from 'store';
import Button from 'components/Button';
import Loading from 'components/Loading';
import Modal from 'components/Modal';

interface IProps {
  open: boolean
  onClose: () => void
}

const UserList = observer((props: any) => {
  const { userStore } = useStore();
  const state = useLocalStore(() => ({
    hasMore: false,
    page: 0,
    isFetching: false,
    submitting: false,
    total: 0,
    authors: [
      {
        address: '',
        nickname: 'junhong',
        following: false,
        avatar: 'https://static-assets.pek3b.qingstor.com/rum-avatars/default.png'
      },
      {
        address: '1',
        nickname: 'junhong',
        following: false,
        avatar: 'https://static-assets.pek3b.qingstor.com/rum-avatars/default.png'
      },
      {
        address: '2',
        nickname: 'junhong',
        following: false,
        avatar: 'https://static-assets.pek3b.qingstor.com/rum-avatars/default.png'
      }
    ],
  }));
  const loading = false;


  const subscribe = async (author: any) => {
    if (state.submitting) {
      return;
    }
    state.submitting = true;
    try {
      // await subscriptionApi.subscribe(author.address);
      author.following = true;
    } catch (err) {
      console.log(err);
    }
    state.submitting = false;
  };

  const unsubscribe = async (author: any) => {
    if (state.submitting) {
      return;
    }
    state.submitting = true;
    try {
      // await subscriptionApi.unsubscribe(author.address);
      author.following = false;
    } catch (err) {
      console.log(err);
    }
    state.submitting = false;
  };

  return (
    <div className="bg-white rounded-12 text-gray-4a">
      <div className="px-5 py-4 leading-none text-16 border-b border-gray-d8 border-opacity-75 flex justify-between items-center">
        我关注的人
      </div>
      <div className="w-full md:w-[330px] h-[80vh] md:h-[400px] overflow-y-auto">
        {loading && (
          <div className="pt-24 flex items-center justify-center">
            <Loading />
          </div>
        )}
        {!loading && (
          <div>
            {state.authors.map((author) => {
              const isMyself = author.address === userStore.address;
              return (
                <div
                  className="border-b border-gray-200 py-3 px-5 flex items-center justify-between"
                  key={author.address}
                >
                  <div
                    onClick={() => {
                      // to user page
                      // modalStore.closeUserList();
                    }}
                  >
                    <div className="flex items-center cursor-pointer">
                      <img
                        className="w-10 h-10 rounded-full"
                        src={author.avatar}
                        alt={author.nickname}
                      />
                      <div className="ml-3">
                        <div className="text-14 truncate w-48 md:w-[200px]">{author.nickname}</div>
                      </div>
                    </div>
                  </div>
                  {!isMyself && (
                    <div>
                      {author.following ? (
                        <Button size="small" onClick={() => unsubscribe(author)} outline>
                          已关注
                        </Button>
                      ) : (
                        <Button size="small" onClick={() => subscribe(author)}>
                          关注
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
