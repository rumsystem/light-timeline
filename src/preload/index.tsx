import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from 'store';
import { GroupApi, ProfileApi, UserApi, VaultApi, PermissionApi } from 'apis';
import { lang } from 'utils/lang';
import Query from 'utils/query';
import * as Vault from 'utils/vault';
import { TrxApi } from 'apis';
import Base64 from 'utils/base64';
import { IVaultAppUser } from 'apis/types';
import { isEmpty } from 'lodash';
import openProfileEditor from 'components/openProfileEditor';
import openLoginModal from 'components/openLoginModal';
import sleep from 'utils/sleep';
import isJWT from 'utils/isJWT';
import { useHistory } from 'react-router-dom';
import { ethers } from 'ethers';
import * as JsBase64 from 'js-base64';
import openNftAuthModal from './openNftAuthModal';

const Preload = observer(() => {
  const { userStore, groupStore, confirmDialogStore, modalStore } = useStore();
  const history = useHistory();
  const token = Query.get('token');
  const accessToken = Query.get('access_token');
  if (token) {
    console.log({ token, accessToken });
    Query.remove('access_token');
    Query.remove('token');
  }

  React.useEffect(() => {
    (async () => {
      groupStore.setLoading(true);
      try {
        const groups = await GroupApi.list();
        groupStore.setMap(groups);
        if (token) {
          modalStore.pageLoading.show();
          await handleToken(token, accessToken);
          modalStore.pageLoading.hide();
        }
        if (userStore.isLogin) {
          const [profile, user] = await Promise.all([
            ProfileApi.get(userStore.address),
            UserApi.get(userStore.address, {
              viewer: userStore.address
            })
          ]);
          if (isEmpty(userStore.profile)) {
            userStore.setProfile(profile);
          }
          userStore.setUser(userStore.address, user);
        }
        groupStore.setLoading(false);
        tryOpenLoginModal();
        tryOpenProfileModal();
        if (userStore.isLogin) {
          handlePermission();
        }
      } catch (err: any) {
        console.log(err);
        if (err.message === 'group not found') {
          history.push('/groups');
        } else {
          confirmDialogStore.show({
            content: lang.somethingWrong,
            okText: '刷新页面',
            cancelDisabled: true,
            ok: () => {
              window.location.href = '/';
            },
          });
        }
      }
    })();
  }, []);

  const handleToken = async (token: string, accessToken: string) => {
    const jwt = isJWT(token) ? token : await Vault.decryptByCryptoKey(token);
    const _accessToken = accessToken ? (isJWT(accessToken) ? accessToken : await Vault.decryptByCryptoKey(accessToken)) : '';
    Vault.removeCryptoKeyFromLocalStorage();
    userStore.setJwt(jwt);
    const vaultUser = await VaultApi.getUser(jwt);
    console.log({ vaultUser });
    let vaultAppUser = {} as IVaultAppUser;
    try {
      vaultAppUser = await VaultApi.getAppUser(jwt, vaultUser.id);
    } catch (err) {
      console.log(err);
      vaultAppUser = await VaultApi.createAppUser(jwt);
    }
    console.log({ vaultAppUser });
    const compressedPublicKey = ethers.utils.arrayify(ethers.utils.computePublicKey(vaultAppUser.eth_pub_key, true));
    const publicKey = JsBase64.fromUint8Array(compressedPublicKey, true);
    userStore.setVaultAppUser({
      ...vaultAppUser,
      eth_pub_key: publicKey,
      access_token: _accessToken || jwt,
      provider: isJWT(token) ? 'web3' : (vaultUser.mixin ? 'mixin' : 'github')
    });
    try {
      const profileExist = await ProfileApi.exist(userStore.address);
      if (!profileExist && !isJWT(token)) {
        const avatar: any = await Base64.getFromBlobUrl(vaultUser.avatar_url || 'https://static-assets.pek3b.qingstor.com/rum-avatars/default.png');
        const res = await TrxApi.createPerson({
          groupId: groupStore.map.group_profiles.groupId,
          person: {
            name: vaultUser.display_name,
            image: {
              mediaType: Base64.getMimeType(avatar.url),
              content: Base64.getContent(avatar.url),
            },
          },
          aesKey: groupStore.map.group_profiles.extra.rawGroup.cipherKey,
          privateKey: userStore.privateKey,
        }, userStore.jwt ? { ethPubKey: userStore.vaultAppUser.eth_pub_key, jwt: userStore.jwt } : null);
        console.log(res);
        userStore.setProfile({
          name: vaultUser.display_name,
          avatar: avatar.url,
          groupId: groupStore.map.group_profiles.groupId,
          userAddress: vaultAppUser.eth_address
        });
      }
    } catch (err) {
      console.log(err);
    }
  }

  const handlePermission = async () => {
    try {
      const { vaultAppUser } = userStore;
      if (['mixin', 'web3'].includes(vaultAppUser.provider) && vaultAppUser.status !== 'allow') {
        const res = await PermissionApi.tryAdd(groupStore.map.group_timeline.groupId, vaultAppUser.eth_pub_key, vaultAppUser.provider, vaultAppUser.access_token);
        console.log(`[PermissionApi.tryAdd]`, vaultAppUser.eth_pub_key, { res });
        if (res.allow) {
          userStore.setVaultAppUser({
            ...userStore.vaultAppUser,
            status: 'allow'
          });
        } else {
          userStore.setVaultAppUser({
            ...userStore.vaultAppUser,
            status: 'no_allow'
          });
          openNftAuthModal(res.nft.meta.icon_url);
        }
      }
    } catch (err: any) {
      if (err.code === 'ERR_IS_INVALID' && err.message.includes('userId')) {
        userStore.setVaultAppUser({
          ...userStore.vaultAppUser,
          status: 'token_expired'
        });
      }
      if (err.code === 'ERR_NOT_FOUND' && err.message.includes('nft')) {
        const collectionInfo = JSON.parse(err.message.split(' ')[0]);
        userStore.setVaultAppUser({
          ...userStore.vaultAppUser,
          status: 'no_nft',
          nft_info: collectionInfo
        });
      }
    }
  }

  const tryOpenProfileModal = async () => {
    const action = Query.get('action');
    if (action) {
      Query.remove('action');
      if (action === 'openProfileEditor') {
        await sleep(1000);
        openProfileEditor({
          emptyName: true
        });
      }
    }
  }

  const tryOpenLoginModal = async () => {
    const action = Query.get('action');
    if (action) {
      Query.remove('action');
      if (action === 'openLoginModal') {
        await sleep(1000);
        openLoginModal();
      }
    }
  }

  return null;
});

export default Preload;