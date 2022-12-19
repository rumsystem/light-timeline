import { observer } from 'mobx-react-lite';
import { lang } from 'utils/lang';
import classNames from 'classnames';
import Avatar from 'components/Avatar';
import { GoChevronRight } from 'react-icons/go';
import Images from 'components/Images';
import ago from 'utils/ago';
import { IComment, INotification, IPost } from 'apis/types';
import Query from 'utils/query';
import { useStore } from 'store';
import { useHistory } from 'react-router-dom';
import { isMobile } from 'utils/env';
import sleep from 'utils/sleep';
import urlify from 'utils/urlify';

import './index.css';

interface IMessagesProps {
  notifications: INotification[]
  unreadCount: number
  close: () => void,
  toUserPage: (userAddress: string) => void,
}

export default observer((props: IMessagesProps) => {
  const { modalStore } = useStore();
  const { notifications } = props;
  const history = useHistory();

  return (
    <div>
      {notifications.map((notification, index) => {
        const { fromProfile, toObject } = notification.extra;

        if (!toObject) {
          return lang.notFound(lang.object);
        }

        const showLastReadFlag = (index === props.unreadCount - 1) && index < notifications.length - 1;
        return (
          <div key={notification.id}>
            <div
              className={classNames(
                {
                  'pb-2': showLastReadFlag,
                  'pb-[18px]': !showLastReadFlag,
                  'border-b border-gray-ec': index !== notifications.length - 1
                },
                'p-2 pt-6 border-b border-gray-ec',
              )}
            >
              <div className="relative">
                <Avatar
                  onClick={() => props.toUserPage(fromProfile.userAddress)}
                  className="absolute top-[-5px] left-0 cursor-pointer"
                  url={fromProfile.avatar}
                  size={40}
                />
                <div className="pl-10 ml-3 text-13">
                  <div className="flex items-center leading-none">
                    <div className="text-gray-4a font-bold cursor-pointer" onClick={() => props.toUserPage(fromProfile.userAddress)}>
                      {fromProfile.name}
                    </div>
                    <div className="ml-2 text-gray-9b text-12">
                      {lang.likeFor(notification.toObjectType === 'post' ? lang.object : lang.comment)}
                    </div>
                  </div>
                  <div
                    className="mt-3 border-l-[3px] border-gray-9b pl-[9px] text-12 text-gray-4a"
                  >
                    <div
                      className="inline-block like-messages-content"
                      dangerouslySetInnerHTML={{
                        __html: urlify(toObject.content || '')
                      }}
                    >
                    </div>
                    {!toObject.content && toObject.images && (<Images images={toObject.images || []} />)}
                  </div>
                  <div className="pt-3 mt-[5px] text-12 flex items-center text-gray-af leading-none">
                    <div className="mr-6 opacity-90">
                      {ago(notification.timestamp)}
                    </div>
                    <div
                      className="mr-3 cursor-pointer hover:text-black hover:font-bold flex items-center opacity-90"
                      onClick={async () => {
                        if (notification.toObjectType === 'post') {
                          if (isMobile) {
                            props.close();
                            await sleep(400);
                            history.push(`/posts/${(toObject as IPost).trxId}`);
                          } else {
                            modalStore.postDetail.show({
                              trxId: (toObject as IPost).trxId,
                            });
                          }
                        }
                        if (notification.toObjectType === 'comment') {
                          if (isMobile) {
                            const objectId = (toObject as IComment).objectId;
                            const commentId = (toObject as IComment).trxId;
                            props.close();
                            await sleep(400);
                            history.push(`/posts/${objectId}?commentId=${commentId}`);
                          } else {
                            Query.set({
                              commentId: (toObject as IComment).trxId
                            });
                            modalStore.postDetail.show({
                              trxId: (toObject as IComment).objectId,
                            });
                          }
                        }
                      }}
                    >
                      {lang.open}
                      <GoChevronRight className="text-12 opacity-70 ml-[-1px]" />
                    </div>
                  </div>
                </div>
              </div>
              {showLastReadFlag && (
                <div className="w-full text-12 text-center pt-10 text-gray-400">
                  {lang.lastReadHere}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
});
