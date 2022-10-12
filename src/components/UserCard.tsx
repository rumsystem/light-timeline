import React from 'react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import Tooltip from '@material-ui/core/Tooltip';
import Avatar from 'components/Avatar';
// import { lang } from 'utils/lang';
// import { GoMute } from 'react-icons/go';
// import { HiOutlineBan } from 'react-icons/hi';
// import { AiFillStar, AiOutlineStar } from 'react-icons/ai';
import { ProfileApi, UserApi } from 'apis';
import { IProfile, IUser } from 'apis/types';
import Loading from 'components/Loading';
import sleep from 'utils/sleep';
import { useStore } from 'store';
import { useHistory } from 'react-router-dom';
import classNames from 'classnames';
import { isPc, isMobile } from 'utils/env';
// import Button from 'components/Button';

interface IProps {
  disableHover?: boolean
  userAddress: string
  children: React.ReactNode
  className?: string
}

interface IUserCardProps extends IProps {
  goToUserPage: () => void
}

const UserCard = observer((props: IUserCardProps) => {
  const { groupStore } = useStore();
  const state = useLocalObservable(() => ({
    user: {} as IUser,
    profile: {} as IProfile,
    fetched: false
  }));
  const { user, profile } = state;

  React.useEffect(() => {
    (async () => {
      try {
        state.profile = await ProfileApi.get(groupStore.groupId, props.userAddress);
        state.user = await UserApi.get(groupStore.groupId, props.userAddress);
      } catch (_) {}
      await sleep(300);
      state.fetched = true;
    })();
  }, []);

  return (
    <div className="bg-white mr-2 shadow-lg rounded-12 overflow-hidden border border-gray-bd leading-none relative w-64 p-4 pb-3 px-5 min-h-[70px]">
      <div
        className="cursor-pointer"
      >
        <div className="relative flex items-center" onClick={props.goToUserPage}>
          <Avatar
            className="absolute top-0 left-0 cursor-pointer"
            url={profile.avatar}
            size={50}
          />
          <div className="pl-16 pt-2">
            <div className="font-bold text-15 truncate w-44 text-gray-6d">
              {profile.name}
            </div>
            {user.postCount > 0 && (
              <div className="mt-[10px] text-gray-6d opacity-60 text-13">
                {user.postCount}  条内容
              </div>
            )}
          </div>
        </div>
      </div>

      {/* {profile.intro && (
        <div className="text-gray-9b opacity-90 pt-5 text-13">
          {profile.intro}
        </div>
      )} */}

      <div className="text-13 flex items-center text-gray-9b pt-3">
        {/* {user.postCount > 0 && (
          <span className="mt-2">
            {' '}
            <span className="text-14 font-bold">
              {user.postCount}
            </span> 条内容{' '}
          </span>
        )} */}
        {/* {user.postCount > 0 && (
          <span className="mx-3 mt-2 opacity-50">|</span>
        )}
        {user.postCount > 0 && (
          <span
            className="cursor-pointer mt-2"
          >
            <span className="text-14 font-bold">
              {user.postCount}
            </span>{' '}
            关注{' '}
          </span>
        )}
        {user.postCount > 0 && (
          <span className="opacity-50 mx-3 mt-2">|</span>
        )}
        {user.postCount > 0 && (
          <span
            className="cursor-pointer mt-2"
          >
            <span className="text-14 font-bold">{user.postCount}</span>{' '}
            被关注
          </span>
        )} */}
      </div>

      {/* <div className="absolute top-6 right-5">
        <Button>关注</Button>
      </div> */}

      {!state.fetched && (
        <div className="absolute inset-0 flex items-center justify-center bg-white">
          <Loading size={24} />
        </div>
      )}
    </div>
  );
});

export default observer((props: IProps) => {
  const { groupStore } = useStore();
  const history = useHistory();
  const state = useLocalObservable(() => ({
    resetting: false
  }));

  if (state.resetting) {
    return (
      <div>
        {props.children}
      </div>
    )
  }

  const goToUserPage = async () => {
    if (isPc) {
      state.resetting = true;
      await sleep(200);
      state.resetting = false;
    }
    history.push(`/${groupStore.groupId}/users/${props.userAddress}`);
  }

  if (isMobile) {
    return (
      <div onClick={goToUserPage}>
        {props.children}
      </div>
    )
  }

  return (
    <Tooltip
      disableHoverListener={props.disableHover}
      enterDelay={500}
      enterNextDelay={500}
      classes={{
        tooltip: 'no-style',
      }}
      placement="left"
      title={<UserCard {...props} goToUserPage={goToUserPage} />}
      interactive
    >
      <div
        className={classNames({
          "cursor-pointer": !props.disableHover
        }, props.className || '')}
        onClick={() => {
          if (!props.disableHover) {
            goToUserPage();
          }
        }}
      >
        {props.children}
      </div>
    </Tooltip>
  )
});
