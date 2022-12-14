import { IGroup } from 'apis/types';

export function createGroupStore() {
  return {
    loading: true,

    group: {} as IGroup,

    relationGroupId: '' as string,

    groupMap: {} as Record<string, IGroup>,

    get groupId() {
      return this.group.groupId || '';
    },

    setGroup(group: IGroup) {
      this.group = group;
    },

    setRelationGroupId(groupId: string) {
      this.relationGroupId = groupId;
    },

    setLoading(loading: boolean) {
      this.loading = loading;
    },

    setGroupMap(map: Record<string, IGroup>) {
      this.groupMap = map;
    },

    getCipherKey(groupId: string) {
      return this.groupMap[groupId]?.extra.rawGroup.cipherKey
    }
  };
}
