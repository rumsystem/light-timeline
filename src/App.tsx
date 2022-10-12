import React from 'react';
import { observer } from 'mobx-react-lite';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Index from './pages/Index';
import Group from './pages/Group';
import Search from './pages/Search';
import PostDetail from './pages/PostDetail';
import User from './pages/User';
import SnackBar from 'components/SnackBar';
import ConfirmDialog from './components/ConfirmDialog';
import { AliveScope } from 'react-activation';
import KeepAlive from 'react-activation'
import CommentReplyModal from 'components/CommentReplyModal';
import PostDetailModal from 'components/PostDetailModal';
import PageLoadingModal from 'components/PageLoadingModal';
import NewFeaturesModal from 'components/NewFeaturesModal';
import { GroupApi, ProfileApi, UserApi, VaultApi } from 'apis';
import { useStore } from 'store';
import GlobalSetup from './globalSetup';
import { lang } from 'utils/lang';
import { useParams } from 'react-router-dom';
import Query from 'utils/query';
import * as Vault from 'utils/vault';

const App = observer(() => {
  const { groupStore, userStore } = useStore();
  return (
    <Router>
      <AliveScope>
        <div>

          <Route path="/" exact component={Index} />

          <Route path="/:groupId" component={Preload} />
          {!groupStore.loading && (
            <div>
              <Route path="/:groupId" exact component={() => (
                <KeepAlive>
                  <Group />
                </KeepAlive>
              )} />
              <Route path="/:groupId/search" exact component={() => (
                <KeepAlive name='search'>
                  <Search />
                </KeepAlive>
              )} />
              <Route path="/:groupId/posts/:trxId" exact component={PostDetail} />
              <Route path="/:groupId/users/:userAddress" exact component={User} />
              <GlobalSetup />
              <PostDetailModal />
              {userStore.isLogin && <CommentReplyModal />}
              {userStore.isLogin && <NewFeaturesModal />}
            </div>
          )}

          <SnackBar />
          <ConfirmDialog />
          <PageLoadingModal />
        </div>
      </AliveScope>
    </Router>
  );
});

const Preload = observer(() => {
  const { userStore, groupStore, confirmDialogStore } = useStore();
  const { groupId } = useParams() as { groupId: string };
  const token = Query.get('token');
  console.log({ token });
  if (token) {
    Query.remove('mixin_access_token');
    Query.remove('token');
  }

  React.useEffect(() => {
    (async () => {
      groupStore.setLoading(true);
      try {
        if (token) {
          await handleToken(token);
        }
        const group = await GroupApi.get(groupId);
        groupStore.setGroup(group);
        if (userStore.isLogin) {
          const [profile, user] = await Promise.all([
            ProfileApi.get(groupStore.groupId, userStore.address),
            UserApi.get(groupStore.groupId, userStore.address)
          ]);
          userStore.setProfile(profile);
          userStore.setUser(user);
        }
        groupStore.setLoading(false);
      } catch (err: any) {
        console.log(err);
        if (err.message === 'group not found') {
          confirmDialogStore.show({
            content: '您访问种子网络不存在',
            okText: '返回首页',
            cancelDisabled: true,
            ok: () => {
              window.location.href = '/';
            },
          });
        } else {
          confirmDialogStore.show({
            content: lang.somethingWrong,
            okText: '返回首页',
            cancelDisabled: true,
            ok: () => {
              window.location.href = `/${groupStore.groupId}`;
            },
          });
        }
      }
    })();
  }, []);

  const handleToken = async (token: string) => {
    const jwt = await Vault.getJwtFromToken(token);
    userStore.setJwt(jwt);
    const vaultUser = await VaultApi.getUser(jwt);
    try {
      const vaultAppUser = await VaultApi.getAppUser(jwt, vaultUser.id);
      userStore.setVaultAppUser(vaultAppUser);
    } catch (err) {
      console.log(err);
      const vaultAppUser = await VaultApi.createAppUser(jwt);
      userStore.setVaultAppUser(vaultAppUser);
    }
  }

  return null;
});

export default App;
