import React from 'react';
import { action } from 'mobx';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { MdNotificationsNone } from 'react-icons/md';
import Badge from '@material-ui/core/Badge';
import MessagesModal from './NotificationModal';
import { NotificationApi } from 'apis';
import { useStore } from 'store';

interface Props {
  className?: string
}

export default observer((props: Props) => {
  const { userStore, groupStore } = useStore();
  const state = useLocalObservable(() => ({
    unreadCount: 0,
    openMessageModal: false,
  }));

  const fetchUnreadCount = async () => {
    try {
      const count1 = await NotificationApi.getUnreadCount(groupStore.groupId, userStore.address, 'like');
      const count2 = await NotificationApi.getUnreadCount(groupStore.groupId, userStore.address, 'comment');
      state.unreadCount = count1 + count2;
    } catch (err) {
      console.log(err);
    }
  }

  React.useEffect(() => {
    fetchUnreadCount();
  }, []);

  return (
    <div>
      <Badge
        badgeContent={state.unreadCount}
        className='transform cursor-pointer'
        color="error"
        overlap='rectangular'
        onClick={action(() => { state.openMessageModal = true; })}
      >
        <div className="w-8 h-8 flex items-center justify-center">
          <MdNotificationsNone className={props.className} />
        </div>
      </Badge>

      <MessagesModal
        open={state.openMessageModal}
        onClose={() => { state.openMessageModal = false; }}
        addReadCount={(count) => { state.unreadCount -= count }}
      />
    </div>
  );
});
