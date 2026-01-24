import type {RootState} from './index.ts';

export const selectCurrentUser = (state: RootState) => state.auth.user;