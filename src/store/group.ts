import { IGroup } from 'apis/types';

export function createGroupStore() {
  return {
    loading: true,

    group: {} as IGroup,

    relationGroupId: '' as string,

    get groupId() {
      return this.group.groupId || '';
    },

    get cipherKey() {
      return this.group?.extra.rawGroup.cipherKey || '';
    },

    setGroup(group: IGroup) {
      this.group = group;
    },

    setRelationGroupId(groupId: string) {
      this.relationGroupId = groupId;
    },

    setLoading(loading: boolean) {
      this.loading = loading;
    }
  };
}
