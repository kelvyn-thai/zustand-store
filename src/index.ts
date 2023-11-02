/**
 * @author [Jayce Thai]
 * @email [phattnh@carehealth.io]
 * @create date 2023-01-17 14:48:03
 * @desc Zustand store config
 */

export * from './store';
export * from './store.typings';
export * from './store.constants';
export * from './store.utils';
export * from './store.query';
export * from './store.queryInfinite';
export * as QueryCaching from './store.queryCaching';
export * as MutationAsync from './store.mutation';
export * as QueryPagination from './store.queryPagination';
export * as QueryInfinite from './store.queryInfinite';
export * as UseMutation from './store.useMutation';
export * as UseSearch from './store.useSearch';
export { shallow } from 'zustand/shallow';
