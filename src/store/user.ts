import { IProfile, IUser } from 'apis/types';
import store from 'store2';

export function createUserStore() {
  return {
    address: store('address') || '',

    privateKey: store('privateKey') || '',

    keystore: store('keystore') || '',

    password: store('password') || '',

    user: {} as IUser,

    profile: {} as IProfile,

    get isLogin() {
      return !!this.address
    },

    setAddress(address: string) {
      this.address = address;
      if (address) {
        store('address', address);
      } else {
        store.remove('address');
      }
    },

    setPrivateKey(privateKey: string) {
      this.privateKey = privateKey;
      if (privateKey) {
        store('privateKey', privateKey);
      } else {
        store.remove('privateKey');
      }
    },

    setKeystore(keystore: string) {
      this.keystore = keystore;
      if (keystore) {
        store('keystore', keystore);
      } else {
        store.remove('keystore');
      }
    },

    setPassword(password: string) {
      this.password = password;
      if (password) {
        store('password', password);
      } else {
        store.remove('password');
      }
    },

    setProfile(profile: IProfile) {
      this.profile = profile;
    },

    setUser(user: IUser) {
      this.user = user;
    }
  };
}
