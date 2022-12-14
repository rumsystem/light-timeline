import { IGroup } from 'apis/types';

type APP_KEY = 'group_timeline' | 'group_comments' | 'group_profiles' | 'group_counters' | 'group_relations';

export function createGroupStore() {
  return {
    loading: true,

    map: {} as Record<APP_KEY, IGroup>,

    groupIdMap: {} as Record<string, IGroup>,

    setLoading(loading: boolean) {
      this.loading = loading;
    },

    setMap(groups: IGroup[]) {
      for (const group of groups) {
        this.map[group.extra.rawGroup.appKey as APP_KEY] = group;
        this.groupIdMap[group.groupId] = group;
      }
    },
  };
}
