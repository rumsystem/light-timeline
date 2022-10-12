import { isProduction } from 'utils/env';

export enum TrxStorage {
  cache = 'cache',
  chain = 'chain'
}

export const API_ORIGIN = isProduction ?  window.location.origin : 'http://192.168.31.120:9000';

export const API_BASE_URL = `${API_ORIGIN}/api`;

export const OBJECT_STATUS_DELETED_LABEL = 'OBJECT_STATUS_DELETED';