import { runInAction } from 'mobx';
import { IPost } from 'apis/types';

export function createPostStore() {
  return {
    trxIds: [] as string[],

    userTrxIds: [] as string[],

    searchedTrxIds: [] as string[],

    map: {} as Record<string, IPost>,

    get total() {
      return this.trxIds.length;
    },

    get posts() {
      return this.trxIds.map((rId: string) => this.map[rId]);
    },

    get userPosts() {
      return this.userTrxIds.map((rId: string) => this.map[rId]);
    },

    get searchedPosts() {
      return this.searchedTrxIds.map((rId: string) => this.map[rId]);
    },

    clear() {
      runInAction(() => {
        this.trxIds = [];
        this.map = {};
      })
    },

    addPosts(posts: IPost[]) {
      runInAction(() => {
        for (const post of posts) {
          if (!this.trxIds.includes(post.trxId)) {
            this.trxIds.push(post.trxId);
          }
          this.map[post.trxId] = post;
        }
      });
    },

    addPost(post: IPost) {
      runInAction(() => {
        this.trxIds.unshift(post.trxId);
        this.map[post.trxId] = post;
      })
    },

    addUserPosts(posts: IPost[]) {
      runInAction(() => {
        for (const post of posts) {
          if (!this.userTrxIds.includes(post.trxId)) {
            this.userTrxIds.push(post.trxId);
          }
          this.map[post.trxId] = post;
        }
      });
    },

    addSearchedPosts(posts: IPost[]) {
      runInAction(() => {
        for (const post of posts) {
          if (!this.searchedTrxIds.includes(post.trxId)) {
            this.searchedTrxIds.push(post.trxId);
          }
          this.map[post.trxId] = post;
        }
      });
    },

    addUserPost(post: IPost) {
      runInAction(() => {
        this.userTrxIds.unshift(post.trxId);
        this.map[post.trxId] = post;
      })
    },

    addPostToMap(post: IPost) {
      this.map[post.trxId] = post;
    },

    removePost(trxId: string) {
      runInAction(() => {
        this.trxIds = this.trxIds.filter(t => t !== trxId);
        this.userTrxIds = this.userTrxIds.filter(t => t !== trxId);
        this.searchedTrxIds = this.searchedTrxIds.filter(t => t !== trxId);
        delete this.map[trxId];
      });
    },

    updatePost(post: IPost) {
      const item = this.map[post.trxId];
      if (item) {
        item.storage = post.storage;
        item.likeCount = post.likeCount;
        item.commentCount = post.commentCount;
        item.extra.liked = post.extra.liked;
      }
    },

    resetUserTrxIds() {
      this.userTrxIds = [];
    },

    resetSearchedTrxIds() {
      this.searchedTrxIds = [];
    },
  }
}
